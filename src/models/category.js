function Category_default() {
	return {
		"reference": "",
		"label": "",
		"dispOrder": 0,
		"parent": null
	};
}

let CategoryDef = {
	modelName: "category",
	fields: {
		"reference": { type: "string", default: "" },
		"label": { type: "string", default: "" },
		"dispOrder": { type: "number", default: 0 },
		"parent": { type: "record", modelName: "category", default: null },
	},
	refField: "reference",
}
