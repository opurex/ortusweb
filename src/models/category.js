
function Category.fromForm(form) {
	let cat = {};
	if (form["id"]) {
		cat.id = parseInt(form["id"].value);
	}
	cat.reference = form["reference"].value;
	cat.label = form["label"].value;
	cat.dispOrder = parseInt(form["dispOrder"].value);

	if (form["parent"].value == "") {
		cat.parent = null;
	} else {
		cat.parent = parseInt(form["parent"].value);
	}
	return cat;	
}
