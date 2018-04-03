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
	if (inputs["clear-image"].value != "0") {
		cat.image = null;
		cat.hasImage = false;
	} else {
		if (inputs["image"].files.length == 0) {
			if ("hasImage" in inputs && inputs["hasImage"].value != "0") {
				cat.hasImage = true;
			} else {
				cat.hasImage = false;
			}
		} else {
			cat.image = inputs["image"].files[0];
			cat.hasImage = true;
		}
	}
	return cat;
}
