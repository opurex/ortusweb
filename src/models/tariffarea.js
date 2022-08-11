function TariffArea_default() {
	return {
		"reference": "",
		"label": "",
		"dispOrder": 0,
		"prices": [],
	};
}

function TariffArea_price(product) {
	return {
		"product": product.id,
		"price": null,
		"tax": null,
	}
}

let TariffAreaDef = {
	modelName: "tariffArea",
	modelId: function(ta) {
		if (ta && ta.id) {
			return ta.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", default: "" },
		"label": { type: "string", default: "" },
		"dispOrder": { type: "number", default: 0 },
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}
