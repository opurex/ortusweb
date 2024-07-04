let CustomerDef = {
	modelName: "customer",
	modelId: function(cust) {
		if (cust && cust.id) {
			return cust.id.toString();
		}
		return null;
	},
	fields: {
		"dispName": {type: "string", default: "", label: "Nom affiché"},
		"card": {type: "string", default: "", label: "Carte"},
		"firstName": {type: "string", default: "", label: "Nom"},
		"lastName": {type: "string", default: "", label: "Prénom"},
		"email": {type: "string", default: "", label: "Courriel"},
		"phone1": {type: "string", default: "", label: "Téléphone"},
		"phone2": {type: "string", default: "", label: "Téléphone 2"},
		"fax": {type: "string", default: "", label: "Fax"},
		"addr1": {type: "string", default: "", label: "Adresse"},
		"addr2": {type: "string", default: "", label: "Adresse 2"},
		"zipCode": {type: "string", default: "", label: "Code postal"},
		"city": {type: "string", default: "", label: "Ville"},
		"region": {type: "string", default: "", label: "Région"},
		"country": {type: "string", default: "", label: "Pays"},
		"tax": {type: "record", modelName: "tax", default: null, label: "TVA"},
		"discountProfile": {type: "record", modelName: "discountProfile", default: null, label: "Profil de remise"},
		"tariffArea": {type: "record", modelName: "tariffArea", default: null, label: "Zone tarifaire"},
		"balance": {type: "number", default: 0.0},
		"maxDebt": {type: "number", default: 0.0, label: "Dette max"},
		"note": {type: "text", default: "", label: "Notes"},
		"visible": {type: "boolean", default: true, label: "Actif"},
		"expireDate": {type: "date", default: null, label: "Date d'expiration"},
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
