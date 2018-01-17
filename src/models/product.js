
function Product_fromForm(formId) {
	let inputs = document.forms[formId].elements;
	let prd = {};
	if ("id" in inputs) {
		prd.id = parseInt(inputs["id"].value);
	}
	prd.label = inputs["label"].value;
	prd.category = parseInt(inputs["category"].value);
	prd.dispOrder = parseInt(inputs["dispOrder"].value);
	if (isNaN(prd.dispOrder)) { prd.dispOrder = 0; }
	prd.visible = inputs["visible"].checked;
	prd.prepay = inputs["prepay"].checked;
	prd.priceSell = parseFloat(inputs["priceSell"].value);
	prd.tax = parseInt(inputs["tax"].value);
	prd.priceBuy = parseFloat(inputs["priceBuy"]);
	if (isNaN(prd.priceBuy)) { prd.priceBuy = null; }
	prd.scaled = inputs["scaled"].checked;
	prd.reference = inputs["reference"].value;
	prd.barcode = inputs["barcode"].value;
	prd.scaleType = parseInt(inputs["scaleType"].value);
	prd.scaleValue = parseFloat(inputs["scaleValue"]);
	if (isNaN(prd.scaleValue)) { prd.scaleValue = 1.0; }
	prd.discountEnabled = inputs["discountEnabled"].checked;
	prd.discountRate = parseFloat(inputs["discountRate"]);
	if (isNaN(prd.discountRate)) { prd.discountRate = 0.0; }
	if (inputs["composition"] == "1") { prd.composition = true; }
	else { prd.composition = false; }
	// hasImage is used only locally
	if ("hasImage" in inputs && inputs["hasImage"].value != "0") {
		prd.hasImage = true;
	} else {
		prd.hasImage = false;
	}
	// taxedPrice is used only locally
	prd.taxedPrice = parseFloat(inputs["taxedPrice"].value);
	return prd;
}

