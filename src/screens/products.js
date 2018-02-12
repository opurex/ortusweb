function products_show() {
	gui_showLoading();
	let catStore = appData.db.transaction(["categories"], "readonly").objectStore("categories");
	let categories = [];
	catStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			categories.push(cursor.value);
			cursor.continue();
		} else {
			_products_initView(categories);
		}
	}
}
function _products_initView(categories) {
	gui_hideLoading();
	// Init view and categories filter
	var sortedCats = categories.sort(tools_sort("dispOrder", "reference"));
	var elements = {
		"categories": sortedCats,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/category/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_products, elements);
	document.getElementById('content').innerHTML = html;
	// Select the first category
	products_selectCategory(sortedCats[0]["id"]);
}

function products_categoryChanged() {
	let catId = parseInt(document.getElementById("filter-category").value);
	products_selectCategory(catId);
}
function products_selectCategory(catId) {
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
	var elements = {
		"products": products,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/product/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_product_list, elements);
	document.getElementById("product-list").innerHTML = html;
}

function products_showProduct(prdId) {
	gui_showLoading();
	let stores = appData.db.transaction(["products", "categories", "taxes"], "readonly");
	let catStore = stores.objectStore("categories");
	let categories = [];
	let taxStore = stores.objectStore("taxes");
	let taxes = [];
	catStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			categories.push(cursor.value);
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
						_products_showProduct(null, categories, taxes);
					}
				}
			}
		}
	}
}
function _products_showProduct(product, categories, taxes) {
	gui_hideLoading();
	if (product != null) {
		for (let i = 0; i < categories.length; i++) {
			if (product["category"] == categories[i]["id"]) {
				categories[i]["selected"] = true;
				break;
			}
		}
		for (let i = 0; i < taxes.length; i++) {
			if (product["tax"] == taxes[i]["id"]) {
				taxes[i]["selected"] = true;
				break;
			}
		}
	}
	var elements = {
		"product": product,
		"categories": categories,
		"taxes": taxes,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/product/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_product_form, elements);
	document.getElementById('content').innerHTML = html;
	product_updatePrice();
}

function product_updatePrice() {
	let sellVat = parseFloat(document.getElementById("edit-taxedPrice").value);
	let taxSelect = document.getElementById("edit-tax");
	let tax = taxSelect.options[taxSelect.selectedIndex];
	let taxRate = parseFloat(tax.getAttribute("data-rate"));
	let priceSell = Number(sellVat / (1.0 + taxRate)).toFixed(5);
	document.getElementById("edit-priceSell").value = priceSell;
	let priceBuy = parseFloat(document.getElementById("edit-priceBuy").value);
	if (isNaN(priceBuy) || priceBuy == 0.0) {
		document.getElementById("edit-margin").value = "";
	} else {
		let margin = Number(priceSell / priceBuy).toFixed(2);
		let ratio = Number((priceSell / priceBuy - 1) * 100).toFixed(2);
		document.getElementById("edit-margin").value = ratio + "%\t\t" + margin;
	}
}

function products_saveProduct() {
	let prd = Product_fromForm("edit-product-form");
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
	let prd = Product_fromForm("edit-product-form");
	if (!("id" in prd)) {
		prd.id = parseInt(response);
	}
	// Update in local database
	let prdStore = appData.db.transaction(["products"], "readwrite").objectStore("products");
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

