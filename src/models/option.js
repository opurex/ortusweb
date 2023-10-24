/** @deprecated */
const OPTION_DYSLEXICMODE = Option_prefName("preferDyslexicMode");
const OPTION_PREFERENCES = Option_prefName("preferences");
const OPTION_ACCOUNTING_CONFIG = Option_prefName("accountingConfig");
const OPTION_CUSTOMER_FIELDS = "customer.customFields"; // No jsadmin prefix

function Option(name, value) {
	return {
		"name": name,
		"content": String(value),
		"system": false
	};
}

function Option_prefName(name) {
	let prefix = "jsadmin.";
	if (location.protocol == "file:") {
		prefix += "local.";
	} else {
		prefix += location.host + "/" + location.pathname + ".";
	}
	return prefix + name;
}
