function Tax_default() {
	return {
		"label": "",
		"rate": 0,
	};
}

let TaxDef = {
	modelName: "tax",
	modelId: function(tax) {
		if (tax && tax.id) {
			return tax.id.toString();
		}
		return null;
	},
	fields: {
		"label": { type: "string", default: "" },
		"rate": { type: "number", default: 0.0 },
	},
	refField: "label",
	lookupFields: ["label"],
}
