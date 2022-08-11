class CsvParser {
	#recordDef;
	#columnMappingDef;
	#existingRecords;
	#linkedRecords;
	#columnMapping;
	#unknownColumns;
	#errors;
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
		return {newRecords: newRecords, editedRecords: editedRecords,
				editedValues: editedValues, unchangedRecords: unchangedRecords,
				unknownColumns: this.#unknownColumns, errors: this.#errors};
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
					linkedRecord = linkRec.records.find(r => r[field] == this.#convertStrVal(value, linkRec.modelDef.fields[field].type));
					if (typeof linkedRecord != "undefined") {
						return false;
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
			default:
				console.error("Unknown column type \"" + field.type + "\" for " + key);
				return value;
		}
	}
	#convertStrVal(stringVal, type) {
		switch (type) {
			case "string": return stringVal;
			case "boolean": return (stringVal ? true : false);
			case "number": return parseFloat(stringVal);
			case "date": return new PTDate(stringVal);
		}
		return stringVal;
	}
}
