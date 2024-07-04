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
	 * Create a new record from its model definition and optional values.
	 * @param values (optional) The associative array of values to set.
	 * @param linkedRecords (optional) The dictionary of records to get
	 * actual value from. In the form of {"<modelName>": [<record>, ...], ...}.
	 * It is passed to ModelDef.postChange if any is defined.
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
			this.#modelDef.postChange(null, record, linkedRecords);
		}
		this.#checkFieldErrors(record);
		return record;
	}
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
			if (!this.#modelDef.postChange(oldValues, record, linkedRecords)) {
				this.#checkFieldErrors(record);
				for (let key in this.#modelDef.fields) {
					record[key] = oldValues[key];
				}
				return;
			}
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
	}
	#checkFieldErrors(values) {
		for (let key in this.#modelDef.fields) {
			if (!(key in values)) {
				this.#errors.push(key);
			}
		}
	}
	hasErrors() {
		return this.#errors.length > 0;
	}
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
