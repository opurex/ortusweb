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

	// Custom contact field name functions
	contactFieldList: ["firstName", "lastName", "email", "phone1", "phone2", "fax", "addr1", "addr2", "zipCode", "city", "region", "country"],
	contactFields: function() {
		return {
			firstName: {label: "Label.Customer.FirstName", value: "", default: "Nom"},
			lastName: {label: "Label.Customer.LastName", value: "", default: "Prénom"},
			email: {label: "Label.Customer.Email", value: "", default: "Email"},
			phone1: {label: "Label.Customer.Phone", value: "", default: "Téléphone"},
			phone2: {label: "Label.Customer.Phone2", value: "", default: "Télphone 2"},
			fax: {label: "Label.Customer.Fax", value: "", default: "Fax"},
			addr1: {label: "Label.Customer.Addr", value: "", default: "Adresse"},
			addr2: {label: "Label.Customer.Addr2", value: "", default: "Adresse 2"},
			zipCode: {label: "Label.Customer.ZipCode", value: "", default: "Code postal"},
			city: {label: "Label.Customer.City", value: "", default: "Ville"},
			region: {label: "Label.Customer.Region", value: "", default: "Région"},
			country: {label: "Label.Customer.Country", value: "", default: "Pays"},
		};
	},
	loadCustomizedContactFields: function(callback) {
		storage_open(function(event) {
			storage_get("options", OPTION_CUSTOMER_FIELDS, function(opt) {
				let fieldMapping = {};
				if (typeof(opt) != "undefined") {
					try {
						fieldMapping = JSON.parse(opt.content);
						if (fieldMapping == null || (typeof fieldMapping != "object")) {
							fieldMapping = {};
						}
					} catch (e) {
						console.warn("Could not parse customer's contact fields customisation", e);
					}
				}
				let contactFields = CustomerDef.contactFields();
				CustomerDef.contactFieldList.forEach(f => {
					let labelCode = contactFields[f].label;
					if (labelCode in fieldMapping && fieldMapping[labelCode] != null && fieldMapping[labelCode] != "") {
						contactFields[f].value = fieldMapping[labelCode];
					}
				});
				callback(contactFields);
			});
		});
	}
}
