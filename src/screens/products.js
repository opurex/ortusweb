function products_show(catId) {
	if (arguments.length < 1) {
		catId = null;
	}
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let selectedCatId = catId;
			if (data.categories.length > 0 && selectedCatId == null) {
				selectedCatId = data.categories[0].id;
			}
			vue.screen.data = {
				"categories": data.categories,
				"taxes": data.taxes,
				"filterVisible": "visible",
				"sort": "dispOrder",
				"selectedCatId": selectedCatId,
			}
			vue.screen.component = "vue-product-list";
			gui_hideLoading();
			storage_close();
		});
	});
}

function products_showProduct(prdId, catId, isCompo) {
	if (arguments.length < 3) {
		isCompo = false;
	}
	gui_showLoading();
	if (typeof(catId) == "string") {
		catId = parseInt(catId);
	}
	let categoryFound = false;
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let categories = data["categories"];
			let taxes = data["taxes"];
			for (let i = 0; i < categories.length; i++) {
				if (catId != null && categories[i].id == catId) {
					categoryFound = true;
				}
			}
			if (prdId != null) {
				storage_get("products", parseInt(prdId), function(product) {
					_products_showProduct(product, categories, taxes);
					storage_close();
				});
			} else {
				let prdCatId = categories[0].id;
				if (catId != null && categoryFound == true) {
					prdCatId = catId;
				}
				if (!isCompo) {
					let prd = Product_default(prdCatId, null);
					_products_showProduct(prd, categories, taxes);
				} else {
					let prd = Composition_default(prdCatId, null);
					_products_showProduct(prd, categories, taxes);
				}
				storage_close();
			}
		});
	});
}

function _products_showProduct(product, categories, taxes) {
	gui_hideLoading();
	vue.screen.data = {
		product: product,
		categories: categories,
		taxes: taxes,
		deleteImage: false,
		deleteImageButton: "Supprimer",
		hadImage: product.hasImage // Save for later check
	}
	if (product.tax == null) {
		product.tax = taxes[0].id;
	}
	if (!product.composition) {
		vue.screen.component = "vue-product-form";
	} else {
		if (product.compositionGroups.length == 0) {
			vue.screen.data.product.compositionGroups.push(CompositionGroup_default());
		}
		vue.screen.data.index = 0;
		vue.screen.data.precache = [];
		let prds = [];
		let prdIds = []
		for (let i = 0; i < product.compositionGroups.length; i++) {
			let grp = product.compositionGroups[i];
			for (let j = 0; j < grp.compositionProducts.length; j++) {
				let prdId = grp.compositionProducts[j].product;
				if (!(prdId in prds)) {
					prds[prdId] = true; // Avoid duplicated ids.
					prdIds.push(prdId);
				}
			}
		}
		storage_open(function(event) {
			storage_get("products", prdIds, function(products) {
				for (let j = 0; j < products.length; j++) {
					let cachePrd = products[j];
					vue.screen.data.precache[cachePrd.id] = cachePrd;
				}
				vue.screen.component = "vue-product-composition-form";
				storage_close();
			});
		});
	}
	product_updatePrice();
}

function product_updatePrice() {
	let sellVat = vue.screen.data.product.taxedPrice;
	let taxId = vue.screen.data.product.tax;
	let tax = null;
	for (let i = 0; i < vue.screen.data.taxes.length; i++) {
		if (vue.screen.data.taxes[i].id == taxId) {
			tax = vue.screen.data.taxes[i];
			break;
		}
	}
	if (tax == null) {
		tax = vue.screen.data.taxes[0];
		product.tax = tax.id;
	}
	let taxRate = tax.rate;
	let priceSell = Number(sellVat / (1.0 + taxRate)).toFixed(5);
	vue.screen.data.product.priceSell = priceSell;
	let priceBuy = vue.screen.data.product.priceBuy;
	if (isNaN(priceBuy) || priceBuy == 0.0) {
		vue.screen.data.product.margin = "";
	} else {
		let margin = Number(priceSell / priceBuy).toFixed(2);
		let ratio = Number((priceSell / priceBuy - 1) * 100).toFixed(2);
		vue.screen.data.product.margin = ratio + "%\t\t" + margin;
	}
}

function product_toggleImage() {
	if (vue.screen.data.product.hasImage) {
		vue.screen.data.product.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restaurer";
	} else {
		vue.screen.data.product.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Supprimer";
	}
}

function product_composition_addGroup(label) {
	let grp = CompositionGroup_default();
	grp.label = label;
	vue.screen.data.product.compositionGroups.push(grp);
}

function product_composition_switchGroup(index) {
	vue.screen.data.index = index; // ugly way to access selectedGroupIndex from the vue.
}

function product_composition_addProduct(product) {
	let group = vue.screen.data.product.compositionGroups[vue.screen.data.index];
	for (let i = 0; i < group.compositionProducts.length; i++) {
		let cmpPrdId = group.compositionProducts[i].product;
		if (cmpPrdId == product.id) {
			return;
		}
	}
	vue.screen.data.product.compositionGroups[vue.screen.data.index].compositionProducts.push(CompositionProduct_default(product));
}

function product_composition_deleteGroup(index) {
	vue.screen.data.product.compositionGroups.splice(index, 1);
}

function product_composition_delProduct(prdId) {
	let group = vue.screen.data.product.compositionGroups[vue.screen.data.index];
	for (let i = 0; i < group.compositionProducts.length; i++) {
		let cmpPrdId = group.compositionProducts[i].product;
		if (cmpPrdId == prdId) {
			group.compositionProducts.splice(i, 1);
			return;
		}
	}
}

function products_saveProduct() {
	let prd = vue.screen.data.product;
	gui_showLoading();
	if ("id" in prd) {
		// This is an update
		srvcall_post("api/product", prd, products_saveCallback);
	} else {
		// This is a create
		srvcall_put("api/product/" + prd.reference, prd, products_saveCallback);
	}
}

function products_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, products_saveProduct)) {
		return;
	}
	if (status == 400) {
		if (request.statusText == "Reference is already taken") {
			gui_showError("La référence existe déjà, veuillez en choisir une autre.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		} else {
			gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		}
		gui_hideLoading();
		return;
	}
	let prd = vue.screen.data.product;
	if (!("id" in prd)) {
		let respPrd = JSON.parse(response);
		prd.id = respPrd["id"];
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		prd.hasImage = false;
		srvcall_delete("api/image/product/" + prd.id, function(request, status, response) {
			_products_saveCommit(prd);
		});
	} else if (imgTag.files.length != 0) {
		prd.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/product/" + prd.id, imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		} else {
			srvcall_put("api/image/product/" + prd.id, imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		}
	} else {
		_products_saveCommit(prd);
	}
}

function _products_saveCommit(prd) {
console.info("on save " + prd.dispOrder + " " + typeof(prd.dispOrder));
	if (prd.hasImage) {
		// Force image refresh
		prd.hasImage = false;
		prd.hasImage = true;
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("products", prd,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
