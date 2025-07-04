function products_show(catId) {
	if (arguments.length < 1) {
		catId = null;
	} else {
		if (typeof catId == "string") {
			catId = Number.parseInt(catId);
			if (catId == Number.NaN) {
				catId = null;
			}
		}
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

function products_showDuplicateProduct(prdId, isCompo) {
	if (arguments.length < 3) {
		isCompo = false;
	}
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			let categories = data["categories"];
			let taxes = data["taxes"];
			storage_get("products", parseInt(prdId), function(product) {
				delete product.id;
				_products_showProduct(product, categories, taxes);
				storage_close();
			});
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
		product.tax = "";
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
			if (prdIds.length == 0) {
				vue.screen.component = "vue-product-composition-form";
			} else {
				storage_get("products", prdIds, function(prdData) {
					let products = Object.values(prdData);
					for (let j = 0; j < products.length; j++) {
						let cachePrd = products[j];
						vue.screen.data.precache[cachePrd.id] = cachePrd;
					}
					vue.screen.component = "vue-product-composition-form";
					storage_close();
				});
			}
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
		return;
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
		srvcall_put("api/product/" + encodeURIComponent(prd.reference), prd, products_saveCallback);
	}
}

function _products_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function products_saveProducts() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newProducts.length; i++) {
		let prd = vue.screen.data.newProducts[i];
		calls.push({id: "new-" + i, method: "PUT", target: "api/product/" + encodeURIComponent(prd.reference), data: prd});
	}
	for (let i = 0; i < vue.screen.data.editedProducts.length; i++) {
		let prd = vue.screen.data.editedProducts[i];
		let copy = {};
		for (key in prd) {
			if (key != "id")
				copy[key] = prd[key];
		}
		calls.push({id: "edit-" + i, method: "PATCH", target: "api/product/" + encodeURIComponent(prd.reference), data: copy});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, products_saveMultipleCallback, _products_progress);
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
		srvcall_delete("api/image/product/" + encodeURIComponent(prd.id), function(request, status, response) {
			_products_saveCommit(prd);
		});
	} else if (imgTag.files.length != 0) {
		prd.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/product/" + encodeURIComponent(prd.id), imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		} else {
			srvcall_put("api/image/product/" + encodeURIComponent(prd.id), imgTag.files[0], function(request, status, response) {
				_products_saveCommit(prd);
			});
		}
	} else {
		_products_saveCommit(prd);
	}
}

function products_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("Les données n'ont pas été envoyées, veuillez réitérer l'opération.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			let err = JSON.parse(response);
			if (err.error == "InvalidField") {
				errors.push("La référence " + err.value + " n'est pas unique. Le produit n'a pas été enregistré.");
			} else {
				errors.push("Quelque chose cloche dans les données du formulaire. " + request.statusText);
			}
			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let prd = vue.screen.data.newProducts[num];
			let respPrd = JSON.parse(response);
			prd.id = respPrd.id;
			saves.push(prd);
		} else {
			let num = parseInt(reqId.substr(5));
			let prd = vue.screen.data.editedProducts[num];
			saves.push(prd);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("Les autres enregistrements ont été pris en compte. Vous pouvez recharger le fichier pour retrouver les erreurs.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("Les données ont été enregistrées.");
		}
		vue.screen.data = {};
		vue.screen.data = {
				"categories": vue.screen.data.categories,
				"taxes": vue.screen.data.taxes,
		};
		vue.$refs.screenComponent.reset();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("Aucune opération.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("products", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}

function _products_saveCommit(prd) {
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


function products_showImport() {
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			vue.screen.data = {
				"modelDef": ProductDef,
				"categories": data.categories,
				"taxes": data.taxes,
			}
			vue.screen.component = "vue-product-import";
			storage_close();
		});
	});
}

function _products_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["products", "categories", "taxes"], function(data) {
			let parser = new CsvParser(ProductDef, data.products,
					[
						{modelDef: CategoryDef, "records": data.categories},
						{modelDef: TaxDef, "records": data.taxes}
					]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newProducts = imported.newRecords;
			vue.screen.data.editedProducts = imported.editedRecords;
			callback(imported);
		});
	});
}
