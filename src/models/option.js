const OPTION_DYSLEXICMODE = Option_prefName("preferDyslexicMode");

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
