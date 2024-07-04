let CategoryDef = {
	modelName: "category",
	modelId: function(cat) {
		if (cat && cat.id) {
			return cat.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", label: "Référence" },
		"label": { type: "string", label: "Désignation" },
		"dispOrder": { type: "number", default: 0, label: "Ordre" },
		"parent": { type: "record", modelName: "category", default: null, label: "Parent" },
		"hasImage": { type: "boolean", default: false },
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}
