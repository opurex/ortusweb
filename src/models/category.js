
function Category_fromForm(formId) {
	let inputs = document.forms[formId].elements;
	let cat = {};
	if ("id" in inputs) {
		cat.id = parseInt(inputs["id"].value);
	}
	cat.reference = inputs["reference"].value;
	cat.label = inputs["label"].value;
	cat.dispOrder = parseInt(inputs["dispOrder"].value);
	if (isNaN(cat.dispOrder)) { cat.dispOrder = 0; }
	if (inputs["parent"].value == "") {
		cat.parent = null;
	} else {
		cat.parent = parseInt(inputs["parent"].value);
	}
	// hasImage is used only locally
	if ("hasImage" in inputs && inputs["hasImage"].value != "0") {
		cat.hasImage = true;
	} else {
		cat.hasImage = false;
	}
	return cat;
}
