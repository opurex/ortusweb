class CsvParser {
	#recordDef;
	#columnMappingDef;
	#existingRecords;
	#linkedRecords;
	#columnMapping;
	#columnName;
	#unknownColumns;
	#errors;
	#warnings;
	/**
	 * Create a parser.
	 * @param recordDef A record definition object.
	 * @param existingRecords The list of existing records to check for editions.
	 * @param linkedRecords A list of {"modelDef": def, "records": list of records} to check
	 * for fields that references an other record.
	 */
	constructor(recordDef, existingRecords, linkedRecords) {
		this.#recordDef = recordDef;
		this.#existingRecords = existingRecords;
		this.#linkedRecords = linkedRecords;
	}
	/**
	 * Parse the content of a csv file and return a CsvImportResult.
	 * @param content The raw text content, with headers, passed to CSV.
	 * @return A fully set CsvImportResult.
	 */
	parseContent(content) {
		// Get csv content, CSV will return an object for each line with header as key.
		let csv = new CSV(content, {header: true, cast: false});
		let rawData = csv.parse();
		if (rawData.length == 0) {
			return {new: [], edited: [], unchanged: [], unknownColumns: [], errors: []};
		}
		this.#buildMapping(rawData[0]);
		let newRecords = [];
		let editedRecords = [];
		let editedValues = [];
		let unchangedRecords = [];
		this.#errors = [];
		this.#warnings = [];
		// Check for the reference field in content
		if (!((this.#recordDef.refField) in this.#columnName)) {
			let refFieldName = this.#recordDef.refField;
			if ((refFieldName in this.#recordDef.fields) && ("label" in this.#recordDef.fields[refFieldName])) {
				refFieldName = this.#recordDef.fields[refFieldName].label;
			}
			this.#errors.push({line: 1, column: refFieldName, exception: new MissingReferenceColumnException(this.#recordDef.modelName, this.#recordDef.refField)});
			return new CsvImportResult(newRecords, editedRecords, editedValues, unchangedRecords,
				this.#unknownColumns, this.#errors, this.#warnings);
		}
		// Read lines
		let recFacto = new RecordFactory(this.#recordDef);
		for (let i = 0; i < rawData.length; i++) {
			let lineVals = this.#readLine(i, rawData[i]);
			if (lineVals == null) {
				continue;
			}
			let refField = this.#recordDef.refField;
			let existingRec = this.#existingRecords.find(r => r[refField] == lineVals[refField]);
			let rec = null;
			if (typeof existingRec == "undefined") {
				rec = recFacto.create(lineVals, this.#linkedRecords);
				if (!recFacto.hasErrors()) {
					newRecords.push(rec);
				} else {
					recFacto.getErrors().forEach(exception => {
						this.#errors.push({line: i + 2, column: this.#columnName[exception.field], exception: exception});
					}, this);
				}
			} else {
				if (!recFacto.merge(existingRec, lineVals, this.#linkedRecords)) {
					recFacto.getErrors().forEach(exception => {
						this.#errors.push({line: i + 2, column: this.#columnName[exception.field], exception: exception});
					}, this);
					continue;
				}
				rec = existingRec;
				if (recFacto.hasChanges()) {
					editedRecords.push(rec);
					let editVals = {};
					recFacto.getChanges().forEach(key => editVals[key] = true)
					editedValues.push(editVals);
				} else {
					unchangedRecords.push(rec);
				}
			}
		}
		return new CsvImportResult(newRecords, editedRecords, editedValues, unchangedRecords,
				this.#unknownColumns, this.#errors, this.#warnings);
	}
	/** Read the first line to map column headers to fields. */
	#buildMapping(line) {
		this.#columnMapping = {};
		this.#columnName = {};
		this.#unknownColumns = [];
		for (let key in line) {
			let columnKey = key.toLowerCase();
			let found = false;
			for (let fieldKey in this.#recordDef.fields) {
				let field = this.#recordDef.fields[fieldKey];
				if (columnKey == fieldKey.toLowerCase() || ("label" in field && columnKey == field.label.toLowerCase())) {
					this.#columnMapping[key] = fieldKey;
					this.#columnName[fieldKey] = key;
					found = true;
					break;
				}
			}
			if (!found) {
				this.#unknownColumns.push(key);
			}
		}
	}
	/**
	 * Read the line and return an dictionary with the parsed values.
	 * Warnings and errors are added during the process.
	 * @param index Index of the line, to list errors and warnings.
	 * @param lineData The dictionary of header => value of a line.
	 * @return A dictionary of fieldName => parsed value of the record.
	 */
	#readLine(index, lineData) {
		let ret = {};
		let noError = true;
		for (let key in this.#columnMapping) {
			let fieldName = this.#columnMapping[key];
			try {
				let val = this.#parseValue(fieldName, key, lineData[key], index);
				if (typeof val !== "undefined") {
					ret[fieldName] = val;
				}
			} catch (e) {
				this.#errors.push({line: index + 2, column: key, exception: e});
				noError = false;
			}
		}
		if (noError) {
			return ret;
		} else {
			return null;
		}
	}
	/**
	 * Convert a single cell to a record value.
	 * @param fieldName The name of the field from a ModelDef.
	 * @param key The header of the column to push errors and warnings.
	 * @param value The raw csv value to parse.
	 * @param lineNum The number of the line to push errors and warnings.
	 * @return The parsed value for the record.
	 */
	#parseValue(fieldName, key, value, lineNum) {
		let field = this.#recordDef.fields[fieldName];
		switch (field.type) {
			case "record":
				if (value == "") {
					return null;
				}
				let modelName = field.modelName;
				let linkRec = this.#linkedRecords.find(l => l.modelDef.modelName == modelName);
				if (typeof linkRec == "undefined") {
					console.error("Model name " + modelName + " is not referenced in linkedRecords");
					return null;
				}
				let lookupFields = linkRec.modelDef.lookupFields;
				let linkedRecord; // undefined, not null
				lookupFields.every(field => {
					let convertedVal = this.#convertStrVal(value, linkRec.modelDef.fields[field].type);
					linkedRecord = linkRec.records.find(r => this.#equalsIgnoreCase(r[field], convertedVal, linkRec.modelDef.fields[field].type));
					if (typeof linkedRecord != "undefined") {
						// Add warning for case insensitive match
						if (convertedVal != linkedRecord[field]) {
							let linkedRecordLabel = linkedRecord[field];
							if ("label" in linkedRecord) {
								linkedRecordLabel = linkedRecord.label;
							}
							let message = (linkedRecordLabel != linkedRecord[field]) ?
									value + " a été associé à " + linkedRecordLabel + " (" + linkedRecord[field] + ")" :
									value + " a été associé à " + linkedRecordLabel;
							this.#warnings.push({line: lineNum + 2, field: field, warning: "InsensitiveMatch", message: message});
						}
						return false; // lookupFields.every break
					}
					return true;
				});
				if (typeof linkedRecord == "undefined") {
					throw new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
						this.#recordDef.modelName, fieldName, null, value);
				}
				return linkedRecord.id;
			case "string":
			case "text":
			case "boolean":
			case "number":
			case "date":
			case "rate":
			case "scaleType":
				return this.#convertStrVal(value, field.type);
			default:
				console.error("Unknown column type \"" + field.type + "\" for " + key);
				return value;
		}
	}
	#convertStrVal(stringVal, type) {
		switch (type) {
			case "string":
			case "text":
				return stringVal;
			case "boolean":
				return this.#convertBoolean(stringVal);
			case "number":
				return this.#convertNumber(stringVal);
			case "date":
				return this.#convertDate(stringVal);
			case "rate":
				return this.#convertRate(stringVal);
			case "scaleType":
				return this.#convertScaleType(stringVal);
			default:
				console.error("Unknown column type \"" + type + "\"");
				return value;
		}
	}
	#convertBoolean(stringVal) {
		let v = stringVal.trim().toLowerCase();
		if (v.length == 0) {
			return false;
		}
		let first = v.charAt(0);
		return v == "o" || v == "y" || v == "1";
	}
	#convertNumber(stringVal) {
		let num = parseFloat(stringVal.trim().replace(",", "."));
		if (isNaN(num)) {
			return undefined;
		}
		return num;
	}
	#convertDate(stringVal) {
		return new PTDate(stringVal);
	}
	#convertRate(stringVal) {
		let value = stringVal;
		// Convert value to number
		if (typeof value == "string") {
			let percentIndex = value.indexOf("%");
			if (percentIndex != -1) {
				// Explicitely %, return rate
				return this.#convertNumber(value.substring(0, percentIndex)) / 100.0;
			}
			// Convert string to number and continue
			value = this.#convertNumber(value);
		}
		if (value > 1.0) {
			return value / 100.0;
		}
		return value;
	}
	#convertScaleType(stringVal) {
		let intVal = parseInt(stringVal, 10);
		if (! isNaN(intVal) && intVal >= 0 && intVal <= 3) {
			return intVal;
		}
		switch (stringVal.trim().toLowerCase()) {
			case 'kilogramme': case 'kg': case 'poid': case 'poids': case '1':
				return 1;
			case 'litre': case 'l': case '2':
				return 2;
			case 'heure': case 'h': case 'horaire': case '3':
				return 3;
			case 'piece': case 'p': case 'u': case 'unité': case '0': case '-':
			default:
				return 0
		}
	}
	#equalsIgnoreCase(val1, val2, type) {
		switch (type) {
			case "string": return val1.toLowerCase() == val2.toLowerCase();
			case "date": (val1 === null && val2 === null) || (val1.equals(val2));
			case "boolean":
			case "number":
			default:
				return val1 == val2;
		}
	}
}

/** Structure to hold parsing results. */
class CsvImportResult {
	newRecords;
	editedRecords;
	editedValues;
	unchangedRecords;
	unknownColumns;
	errors;
	warnings;
	constructor(newRecs, editedRecs, editedVals, unchangedRecs, unknownCols, errs, warns) {
		this.newRecords = newRecs;
		this.editedRecords = editedRecs;
		this.editedValues = editedVals;
		this.unchangedRecords = unchangedRecs;
		this.unknownColumns = unknownCols;
		this.errors = errs;
		this.warnings = warns;
	}
}

class MissingReferenceColumnException extends Error
{
	modelName;
	field;
	constructor(modelName, field) {
		super("Missing column for lookup: " + field);
		this.modelName = modelName;
		this.field = field;
	}
}
