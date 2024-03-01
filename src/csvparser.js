class CsvParser {
	#recordDef;
	#columnMappingDef;
	#existingRecords;
	#linkedRecords;
	#columnMapping;
	#unknownColumns;
	#errors;
	#warnings;
	/**
	 * Create a parser.
	 * @param recordDef A record definition object.
	 * @param mappingDef An object with accepted headers as keys and field name as values.
	 * Headers are case-insensitive. It shares values with vue-import-preview widget.
	 * @param existingRecords The list of existing records to check for editions.
	 * @param linkedRecords A list of {"modelDef": def, "records": list of records} to check
	 * for fields that references an other record.
	 */
	constructor(recordDef, mappingDef, existingRecords, linkedRecords) {
		this.#recordDef = recordDef;
		this.#columnMappingDef = mappingDef;
		this.#existingRecords = existingRecords;
		this.#linkedRecords = linkedRecords;
	}
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
		let recFacto = new RecordFactory(this.#recordDef);
		for (let i = 0; i < rawData.length; i++) {
			let lineVals = this.#readLine(i, rawData[i]);
			let refField = this.#recordDef.refField;
			let existingRec = this.#existingRecords.find(r => r[refField] == lineVals[refField]);
			let rec = null;
			if (typeof existingRec == "undefined") {
				rec = recFacto.create(lineVals);
				newRecords.push(rec);
			} else {
				recFacto.merge(existingRec, lineVals);
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
		this.#unknownColumns = [];
		for (let key in line) {
			if (key.toLowerCase() in this.#columnMappingDef) {
				this.#columnMapping[key] = this.#columnMappingDef[key.toLowerCase()];
			} else {
				this.#unknownColumns.push(key);
			}
		}
	}
	#readLine(index, lineData) {
		let ret = {};
		for (let key in this.#columnMapping) {
			let fieldName = this.#columnMapping[key];
			ret[fieldName] = this.#parseValue(fieldName, key, lineData[key], index);
		}
		return ret;	
	}
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
					this.#errors.push({line: lineNum + 2, field: fieldName, column: key, error: "RecordNotFound", value: value});
					return null;
				}
				return linkedRecord.id;
			case "string":
			case "text":
			case "boolean":
			case "number":
			case "date":
				return this.#convertStrVal(value, field.type);
			case "rate":
				return this.#convertRate(value);
			default:
				console.error("Unknown column type \"" + field.type + "\" for " + key);
				return value;
		}
	}
	#convertStrVal(stringVal, type) {
		switch (type) {
			case "string": return stringVal;
			case "boolean": return (stringVal ? true : false);
			case "number":
				let v = stringVal.trim().replace(",", ".");
				return parseFloat(v);
			case "rate": return this.#convertRate(stringVal);
			case "date": return new PTDate(stringVal);
		}
		return stringVal;
	}
	#convertRate(stringVal) {
		let value = stringVal;
		if (typeof value == "string") {
			let percentIndex = value.indexOf("%");
			if (percentIndex != -1) {
				return this.#convertStrVal(value.substring(0, percentIndex), "number") / 100.0;
			}
			value = this.#convertStrVal(value, "number");
			// continue
		}
		if (value > 1.0) {
			return value / 100.0;
		}
		return value;
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
