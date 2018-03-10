
function Customer_fromForm(formId) {
	let inputs = document.forms[formId].elements;
	let cust = {};
	if ("id" in inputs) {
		cust.id = parseInt(inputs["id"].value);
	}
	cust.dispName = inputs["dispName"].value;
	cust.card = inputs["card"].value;
	cust.firstName = inputs["firstName"].value;
	cust.lastName = inputs["lastName"].value;
	cust.email = inputs["email"].value;
	cust.phone1 = inputs["phone1"].value;
	cust.phone2 = inputs["phone2"].value;
	cust.fax = inputs["fax"].value;
	cust.addr1 = inputs["addr1"].value;
	cust.addr2 = inputs["addr2"].value;
	cust.zipCode = inputs["zipCode"].value;
	cust.city = inputs["city"].value;
	cust.region = inputs["region"].value;
	cust.country = inputs["country"].value;
	if (inputs["tax"].value == "") {
		cust.tax = null;
	} else {
		cust.tax = parseInt(inputs["tax"].value);
	}
	if (inputs["discountProfile"].value == "") {
		cust.discountProfile = null;
	} else {
		cust.discountProfile = parseInt(inputs["discountProfile"].value);
	}
	if (inputs["tariffArea"].value == "") {
		cust.tariffArea = null;
	} else {
		cust.tariffArea = parseInt(inputs["tariffArea"].value);
	}
	cust.balance = parseFloat(inputs["balance"].value);
	if (isNaN(cust.balance)) {
		cust.balance = 0.0;
	}
	cust.maxDebt = parseFloat(inputs["maxDebt"].value);
	if (isNaN(cust.maxDebt)) {
		cust.maxDebt = 0.0;
	}
	cust.note = inputs["note"].value;
	cust.visible = inputs["visible"].checked;
	cust.expireDate = tools_stringToDate(inputs["expireDate"].value);
	if (cust.expireDate == false) {
		cust.expireDate = null;
	}
	// hasImage is used only locally
	if ("hasImage" in inputs && inputs["hasImage"].value != "0") {
		cust.hasImage = true;
	} else {
		cust.hasImage = false;
	}
	return cust;
}

