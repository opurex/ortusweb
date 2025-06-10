let CustomerDef = {
	modelName: "customer",
	modelId: function(cust) {
		if (cust && cust.id) {
			return cust.id.toString();
		}
		return null;
	},
	fields: {
		"dispName": { type: "string", default: "", label: "Display Name" },
		"card": { type: "string", default: "", label: "Card" },
		"firstName": { type: "string", default: "", label: "First Name" },
		"lastName": { type: "string", default: "", label: "Last Name" },
		"email": { type: "string", default: "", label: "Email" },
		"phone1": { type: "string", default: "", label: "Phone" },
		"phone2": { type: "string", default: "", label: "Alternate Phone" },
		"fax": { type: "string", default: "", label: "Fax" },
		"addr1": { type: "string", default: "", label: "Address" },
		"addr2": { type: "string", default: "", label: "Address 2" },
		"zipCode": { type: "string", default: "", label: "Postal Code" },
		"city": { type: "string", default: "", label: "City" },
		"region": { type: "string", default: "", label: "Region" },
		"country": { type: "string", default: "", label: "Country" },
		"tax": { type: "record", modelName: "tax", default: null, label: "VAT" },
		"discountProfile": { type: "record", modelName: "discountProfile", default: null, label: "Discount Profile" },
		"tariffArea": { type: "record", modelName: "tariffArea", default: null, label: "Pricing Zone" },
		"balance": { type: "number", default: 0.0 },
		"maxDebt": { type: "number", default: 0.0, label: "Max Credit" },
		"note": { type: "text", default: "", label: "Notes" },
		"visible": { type: "boolean", default: true, label: "Active" },
		"expireDate": { type: "date", default: null, label: "Expiration Date" },
		"hasImage": { type: "boolean", default: false },
	},

	refField: "dispName",
	lookupFields: ["dispName", "email", "phone1", "phone2"],

	// Custom contact field name functions
	contactFieldList: ["firstName", "lastName", "email", "phone1", "phone2", "fax", "addr1", "addr2", "zipCode", "city", "region", "country"],
	contactFields: function() {
		return {
			firstName: { label: "Label.Customer.FirstName", value: "", default: "First Name" },
			lastName: { label: "Label.Customer.LastName", value: "", default: "Last Name" },
			email: { label: "Label.Customer.Email", value: "", default: "Email" },
			phone1: { label: "Label.Customer.Phone", value: "", default: "Phone" },
			phone2: { label: "Label.Customer.Phone2", value: "", default: "Alternate Phone" },
			fax: { label: "Label.Customer.Fax", value: "", default: "Fax" },
			addr1: { label: "Label.Customer.Addr", value: "", default: "Address" },
			addr2: { label: "Label.Customer.Addr2", value: "", default: "Address 2" },
			zipCode: { label: "Label.Customer.ZipCode", value: "", default: "Postal Code" },
			city: { label: "Label.Customer.City", value: "", default: "City" },
			region: { label: "Label.Customer.Region", value: "", default: "Region" },
			country: { label: "Label.Customer.Country", value: "", default: "Country" },
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
