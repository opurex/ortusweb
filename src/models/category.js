
function Category_fromForm(formId) {
	let form = document.forms[formId];
	let cat = {};
	if (form["id"]) {
		cat.id = parseInt(form["id"].value);
	}
	cat.reference = form["reference"].value;
	cat.label = form["label"].value;
	cat.dispOrder = parseInt(form["dispOrder"].value);
	if (isNaN(cat.dispOrder)) { cat.dispOrder = 0; }
	if (form["parent"].value == "") {
		cat.parent = null;
	} else {
		cat.parent = parseInt(form["parent"].value);
	}
	// hasImage is used only locally
	if (form["hasImage"] && form["hasImage"].value != "0") {
		cat.hasImage = true;
	} else {
		cat.hasImage = false;
	}
	return cat;
}
