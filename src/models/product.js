let ProductDef = {
	modelName: "product",
	modelId: function(prd) {
		if (prd && prd.id) {
			return prd.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string" },
		"label": { type: "string" },
		"category": { type: "record", modelName: "category" },
		"dispOrder": { type: "number", default: 0 },
		"visible": { type: "boolean", default: true },
		"prepay": { type: "boolean", default: false },
		"priceSell": { type: "number" },
		"scaled": { type: "boolean", default: false },
		"scaleType": { type: "scaleType", default: 0 },
		"scaleValue": { type: "number", default: 1.0 },
		"tax": { type: "record", modelName: "tax" },
		"priceBuy": { type: "number", default: null },
		"barcode": { type: "string", default: "" },
		"discountEnabled": { type: "boolean", default: false },
		"discountRate": { type: "rate", default: 0.0 },
		"taxedPrice": { type: "number" },
		"hasImage": { type: "boolean", default: false },
	},
	postChange: function(oldPrd, prd, linkedRecords) {
		if (typeof prd.priceSell != "number" && typeof prd.taxedPrice != "number") {
			return false;
		}
		let linkRecs = linkedRecords.find(l => l.modelDef.modelName == this.fields["tax"].modelName);
		if (prd.tax == null || !(prd.tax in linkRecs.records)) {
			return false;
		}
		let tax = linkRecs.records.find(t => t.id == prd.tax);
		if (tax == null) {
			return false;
		}
		if (oldPrd == null) {
			// New record, check that priceSell or taxedPrice is set and compute the other
			if (typeof prd.priceSell == "number") {
				// Compute taxedPrice from priceSell, even if taxed price is defined
				prd.taxedPrice = Number.parseFloat(Number(prd.priceSell * (1.0 + tax.rate)).toFixed(2));
			} else if (typeof prd.taxedPrice == "number") {
				// Otherwise compute priceSell from taxedPrice
				prd.priceSell = Number.parseFloat(Number(prd.taxedPrice / (1.0 + tax.rate)).toFixed(5));
			}
		} else {
			// Edited record
			let taxChanged = oldPrd.tax != prd.tax;
			if (oldPrd.priceSell != prd.priceSell) {
				// Recompute taxedPrice from the explicitely modified price
				prd.taxedPrice = Number.parseFloat(Number(prd.priceSell * (1.0 + tax.rate)).toFixed(2));
			} else if (oldPrd.taxedPrice != prd.taxedPrice || taxChanged) {
				// Recompute priceSell from the explicitely modified taxed price
				// or unchanged prices but changed tax rate
				prd.priceSell = Number((prd.taxedPrice / (1.0 + tax.rate)).toFixed(5));
			}
		}
		return true;
	},
	refField: "reference",
	lookupFields: ["reference", "label"],
}

function Product_default(categoryId, taxId) {
	return {
		"label": "",
		"hasImage": false,
		"category": categoryId,
		"dispOrder": 0,
		"visible": true,
		"prepay": false,
		"priceSell": 0.0,
		"tax": taxId,
		"priceBuy": "",
		"scaled": false,
		"reference": "",
		"barcode": "",
		"scaleType": 0,
		"scaleValue": 1.0,
		"discountEnabled": false,
		"discountRate": 0.0,
		"composition": false,
		"taxedPrice": 0.0
	};
}

function Composition_default(categoryId, taxId) {
	let prd = Product_default(categoryId, taxId);
	prd.composition = true;
	prd.compositionGroups = [];
	return prd;
}

function CompositionGroup_default() {
	return {
		"label": "",
		"dispOrder": 0,
		"compositionProducts": [],
	}
}

function CompositionProduct_default(product) {
	return {
		"dispOrder": product.dispOrder,
		"product": product.id,
	}
}
