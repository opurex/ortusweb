let CategoryDef = {
	modelName: "category",
	modelId: function(cat) {
		if (cat && cat.id) {
			return cat.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", default: "" },
		"label": { type: "string", default: "" },
		"dispOrder": { type: "number", default: 0 },
		"parent": { type: "record", modelName: "category", default: null },
		"hasImage": { type: "boolean", default: false },
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}
