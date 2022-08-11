let CustomerDef = {
	modelName: "customer",
	modelId: function(cust) {
		if (cust && cust.id) {
			return cust.id.toString();
		}
		return null;
	},
	fields: {
		"dispName": {type: "string", default: ""},
		"card": {type: "string", default: ""},
		"firstName": {type: "string", default: ""},
		"lastName": {type: "string", default: ""},
		"email": {type: "string", default: ""},
		"phone1": {type: "string", default: ""},
		"phone2": {type: "string", default: ""},
		"fax": {type: "string", default: ""},
		"addr1": {type: "string", default: ""},
		"addr2": {type: "string", default: ""},
		"zipCode": {type: "string", default: ""},
		"city": {type: "string", default: ""},
		"region": {type: "string", default: ""},
		"country": {type: "string", default: ""},
		"tax": {type: "record", modelName: "tax", default: null},
		"discountProfile": {type: "record", modelName: "discountProfile", default: null},
		"tariffArea": {type: "record", modelName: "tariffArea", default: null},
		"balance": {type: "number", default: 0.0},
		"maxDebt": {type: "number", default: 0.0},
		"note": {type: "text", default: ""},
		"visible": {type: "boolean", default: true},
		"expireDate": {type: "date", default: null},
		"hasImage": {type: "boolean", default: false},
	},
	refField: "dispName",
	lookupFields: ["dispName", "email", "phone1", "phone2"],
}
