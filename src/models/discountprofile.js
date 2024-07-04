function DiscountProfile_default() {
	return {
		"label": "",
		"rate": 0.0,
	};
}

let DiscountProfileDef = {
	modelName: "discountProfile",
	modelId: function(dp) {
		if (dp && dp.id) {
			return dp.id.toString();
		}
		return null;
	},
	fields: {
		"label": {type: "string", default: "", label: "Désignation"},
		"rate": {type: "rate", default: 0.0, label: "Remise"},
	},
	refField: "label",
	lookupFields: ["label"],
}
