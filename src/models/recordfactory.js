class RecordFactory {
	#modelDef;
	#errors;
	#changes;
	constructor(modelDef) {
		this.#modelDef = modelDef;
	}
	#reset() {
		this.#errors = [];
		this.#changes = [];
	}
	/**
	 * Create a record prefilled with the default values but without checking
	 * for constraints nor running ModelDef.postChange.
	 * @return The new record as an associative array, with default values set.
	 */
	createEmpty() {
		let record = {};
		for (let key in this.#modelDef.fields) {
			if ("default" in this.#modelDef.fields[key]) {
				record[key] = this.#modelDef.fields[key].default;
			}
		}
		return record;
	}
	/**
	 * Create a new record from its model definition a set of values.
	 * @param values The associative array of values to set.
	 * @param linkedRecords (optional) The dictionary of records to get
	 * actual value from. In the form of {"modelDef": def, "records": list of records}.
	 * It is passed to ModelDef.postChange if any is defined.
	 * @return The new record as an associative array, with default value
	 * when not specified. Null if the record is not complete or a constraint fails.
	 * See getErrors.
	 */
	create(values, linkedRecords) {
		this.#reset();
		let record = {};
		for (let key in this.#modelDef.fields) {
			if (values && (key in values)) {
				switch (this.#modelDef.fields[key].type) {
					case "date":
						record[key] = new PTDate(values[key]);
						break;
					default:
						record[key] = values[key];
						break;
				}
				if ("default" in this.#modelDef.fields[key] && values[key] != this.#modelDef.fields[key].default) {
					this.#changes.push(key);
				}
			} else if ("default" in this.#modelDef.fields[key]) {
				record[key] = this.#modelDef.fields[key].default;
			}
		}
		if ("postChange" in this.#modelDef) {
			try {
				this.#modelDef.postChange(null, record, linkedRecords);
			} catch (e) {
				this.#errors.push(e);
				return null;
			}
		}
		if (!this.#checkFieldErrors(record, linkedRecords)) {
			return null;
		}
		return record;
	}
	/**
	 * Merge values into an existing record.
	 * @param record The existing record.
	 * @param value The new values to merge into the record.
	 * @param linkedRecords (optional) The dictionary of records to get
	 * actual value from. In the form of {"modelDef": def, "records": list of records}.
	 * It is passed to ModelDef.postChange if any is defined.
	 * @return True when merge is a success. False if an error occured
	 * and the record was left untouched. See getErrors.
	 */
	merge(record, values, linkedRecords) {
		this.#reset();
		let oldValues = {};
		for (let key in this.#modelDef.fields) {
			oldValues[key] = record[key];
			if (key in values) {
				if (typeof values[key] == "undefined") {
					continue;
				}
				record[key] = values[key];
			}
		}
		if ("postChange" in this.#modelDef) {
			try {
				this.#modelDef.postChange(oldValues, record, linkedRecords);
			} catch (e) {
				this.#errors.push(e);
				for (let key in this.#modelDef.fields) {
					record[key] = oldValues[key];
				}
				return false;
			}
		}
		if (!this.#checkFieldErrors(record, linkedRecords)) {
			for (let key in this.#modelDef.fields) {
				record[key] = oldValues[key];
			}
			return false;
		}
		for (let key in this.#modelDef.fields) {
			let edited = false;
			switch (this.#modelDef.fields[key].type) {
				case "date":
					edited = !tools_dateEquals(oldValues[key], record[key]);
					break;
				default:
					edited = oldValues[key] != record[key];
					break;
			}
			if (edited) {
				this.#changes.push(key);
			}
		}
		return true;
	}
	#checkFieldErrors(values, linkedRecords) {
		let noError = true;
		let id = null;
		if ("id" in values) {
			id = values["id"];
		}
		for (let key in this.#modelDef.fields) {
			if (!(key in values)) {
				this.#errors.push(new InvalidFieldException(InvalidFieldConstraints.CSTR_NOT_NULL,
						this.#modelDef.modelName, key, id, null));
				noError = false;
				continue;
			}
			if (this.#modelDef.fields[key].type == "record" && values[key] != null) {
				let modelName = this.#modelDef.fields[key].modelName;
				let modelRecords = linkedRecords.find(e => e.modelDef.modelName == modelName);
				if (typeof modelRecords == "undefined") {
					// Cannot check for linked record
					console.warn("Could not check linked record for " + this.#modelDef.modelName + "." + modelName);
				} else {
					let record = modelRecords.records.find(r => r.id == values[key]);
					if (typeof record == "undefined") {
						this.#errors.push(new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
								this.#modelDef.modelName, key, id, values[key]));
						noError = false;
					}
				}
			}
		}
		return noError;
	}
	hasErrors() {
		return this.#errors.length > 0;
	}
	/**
	 * Get the list or errors that happened during the latest create or merge.
	 * @return The list of exceptions thrown during the latest create or merge.
	 */
	getErrors() {
		return this.#errors;
	}
	hasChanges() {
		return this.#changes.length > 0;
	}
	getChanges() {
		return this.#changes;
	}
}

/**
 * Enumeration of constraints for InvalidFieldExceptino
 */
const InvalidFieldConstraints = {
	/** The field is a reference to an other record but this record
	 * was not found. */
	CSTR_ASSOCIATION_NOT_FOUND: 'AssociationNotFound',
	/** The field is null but it cannot be. */
	CSTR_NOT_NULL: 'NotNull',
	/** The field is an enum and the value is not within it. */
	CSTR_ENUM: 'Enum',
	/** The value cannot be converted to float. */
	CSTR_FLOAT: 'Float',
	/** The value cannot be converted to boolean. */
	CSTR_BOOL: 'Boolean',
	/** The value cannot be converted to integer. */
	CSTR_INT: 'Integer',
	CSTR_INVALID_DATE: 'InvalidDate',
	CSTR_INVALID_DATERANGE: 'InvalidDateRange',
}

/**
 * Writing a record failed because one of it's fields has an invalid value.
 * Partial reimplementation of API exception.
 */
class InvalidFieldException extends Error
{
	constraint;
	modelName;
	field;
	id;
	value;
	constructor(constraint, modelName, field, id, value) {
		super("Invalid field exception: " + constraint + " on " + field);
		this.constraint = constraint;
		this.modelName = modelName;
		this.field = field;
		this.id = id;
		this.value = value;
	}
}
