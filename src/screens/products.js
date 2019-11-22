function products_show(catId) {
	if (arguments.length < 1) {
		catId = null;
	}
	gui_showLoading();
	let catStore = appData.db.transaction(["categories"], "readonly").objectStore("categories");
	let categories = [];
	vue.screen.data = {
		"categories": [],
		"products": [],
		"filterVisible": "visible",
		"sort": "dispOrder",
		"selectedCatId": null
	};
	vue.screen.component = "vue-product-list";
	catStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		let selectedCat = null;
		if (cursor) {
			categories.push(cursor.value);
			cursor.continue();
		} else {
			vue.screen.data.categories = categories.sort(tools_sort("dispOrder", "reference"));
			if (vue.screen.data.categories.length > 0) {
				vue.screen.data.selectedCatId = vue.screen.data.categories[0].id;
			}
			gui_hideLoading();
		}
	}
}

function products_showCategory(catId) {
	gui_showLoading();
	let prdStore = appData.db.transaction(["products"], "readonly").objectStore("products");
	let products = [];
	prdStore.index("category").openCursor(IDBKeyRange.only(catId)).onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			products.push(cursor.value);
			cursor.continue();
		} else {
			let sortedPrds = products.sort(tools_sort("dispOrder", "reference"));
			products_showProducts(sortedPrds);
		}
	}
}

function products_showProducts(products) {
	gui_hideLoading();
	vue.screen.data.products = products;
	products_sortProducts(vue.screen.data.sort);
}

function products_sortProducts(sort) {
	switch (vue.screen.data.sort) {
		case "dispOrder":
			vue.screen.data.products = vue.screen.data.products.sort(tools_sort("dispOrder", "reference"));
			break;
		case "label":
			vue.screen.data.products = vue.screen.data.products.sort(tools_sort("label"));
			break;
	}
}

function products_showProduct(prdId, catId) {
	gui_showLoading();
	let stores = appData.db.transaction(["products", "categories", "taxes"], "readonly");
	let catStore = stores.objectStore("categories");
	let categories = [];
	let taxStore = stores.objectStore("taxes");
	let taxes = [];
	if (typeof(catId) == "string") {
		catId = parseInt(catId);
	}
	let categoryFound = false;
	catStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			categories.push(cursor.value);
			if (catId != null && cursor.value.id == catId) {
				categoryFound = true;
			}
			cursor.continue();
		} else {
			taxStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					taxes.push(cursor.value);
					cursor.continue();
				} else {
					if (prdId != null) {
						let prdStore = stores.objectStore("products");
						prdStore.get(parseInt(prdId)).onsuccess = function(event) {
							_products_showProduct(event.target.result, categories, taxes);
						}
					} else {
						let prdCatId = categories[0].id;
						if (catId != null && categoryFound == true) {
							prdCatId = catId;
						}
						let prd = Product_default(prdCatId, null);
						_products_showProduct(prd, categories, taxes);
					}
				}
			}
		}
	}
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
	vue.screen.component = "vue-product-form";
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
	if (prd.hasImage) {
		// Force image refresh
		prd.hasImage = false;
		prd.hasImage = true;
	}
	// Update in local database
	let prdStore = appData.db.transaction(["products"], "readwrite").objectStore("products");
	delete prd.margin;
	let req = prdStore.put(prd);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}

