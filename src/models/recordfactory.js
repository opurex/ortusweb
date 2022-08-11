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
			} else {
				console.error("Missing required " + key + " to create a " + this.#modelDef.modelName);
				this.#errors.push(key);
			}
		}
		return record;
	}
	merge(record, values) {
		this.#reset();
		for (let key in this.#modelDef.fields) {
			if (key in values) {
				let edited = false;
				switch (this.#modelDef.fields[key].type) {
					case "date":
						edited = !tools_dateEquals(record[key], values[key]);
						break;
					default:
						edited = record[key] != values[key];
						break;
				}
				if (edited) {
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
