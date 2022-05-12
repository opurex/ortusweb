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
	create(values) {
		this.#reset();
		let record = {};
		for (key in modelDef.fields) {
			if (key in values) {
				record[key] = values[key];
				if ("default" in modelDef.fields[key] && values[key] != modelDef.fields[key].default) {
					this.#changes.push(key);
				}
			} else if ("default" in modelDef.fields[key]) {
				record[key] = modelDef.fields[key].default;
			} else {
				console.error("Missing required " + key + " to create a " + modelDef.modelName);
				this.#errors.push(key);
			}
		}
		return record;
	}
	merge(record, values) {
		this.#reset();
		for (let key in this.#modelDef.fields) {
			if (key in values) {
				if (record[key] != values[key]) {
					record[key] = values[key];
					this.#changes.push(key);
				}
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
