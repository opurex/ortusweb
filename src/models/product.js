let ProductDef = {
	modelName: "product",
	modelId: function(prd) {
		if (prd && prd.id) {
			return prd.id.toString();
		}
		return null;
	},
	fields: {
		"reference": { type: "string", label: "Reference" },
		"label": { type: "string", label: "Description" },
		"category": { type: "record", modelName: "category", label: "Category" },
		"dispOrder": { type: "number", default: 0, label: "Display Order" },
		"visible": { type: "boolean", default: true, label: "Available for Sale" },
		"prepay": { type: "boolean", default: false, label: "Prepaid Recharge" },
		"priceSell": { type: "number", label: "Selling Price (excl. tax)" },
		"scaled": { type: "boolean", default: false, label: "Sold by Weight" },
		"scaleType": { type: "scaleType", default: 0, label: "Weight/Volume Type" },
		"scaleValue": { type: "number", default: 1.0, label: "Capacity" },
		"tax": { type: "record", modelName: "tax", label: "VAT" },
		"priceBuy": { type: "number", default: null, label: "Purchase Price (excl. tax)" },
		"barcode": { type: "string", default: "", label: "Barcode" },
		"discountEnabled": { type: "boolean", default: false, label: "Auto Discount Enabled" },
		"discountRate": { type: "rate", default: 0.0, label: "Discount Rate" },
		"taxedPrice": { type: "number", label: "Selling Price (incl. tax)" },
		"hasImage": { type: "boolean", default: false },
	},

	postChange: function(oldPrd, prd, linkedRecords) {
		if (typeof prd.priceSell != "number" && typeof prd.taxedPrice != "number") {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_FLOAT,
					this.modelName, "taxedPrice", this.modelId(prd), prd.taxedPrice);
		}
		let linkRecs = linkedRecords.find(l => l.modelDef.modelName == this.fields["tax"].modelName);
		if (prd.tax == null) {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_NOT_NULL,
					this.modelName, "tax", this.modelId(prd), prd.tax);
		}
		let tax = linkRecs.records.find(t => t.id == prd.tax);
		if (tax == null) {
			throw new InvalidFieldException(InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND,
					this.modelName, "tax", this.modelId(prd), prd.tax);
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
