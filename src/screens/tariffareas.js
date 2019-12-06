function tariffareas_show() {
	gui_showLoading();
	let areas = [];
	vue.screen.data = {tariffareas: [], sort: "dispOrder"};
	storage_readStore("tariffareas", function(areas) {
		vue.screen.data.tariffareas = areas;
		vue.screen.component = "vue-tariffarea-list";
		gui_hideLoading();
	});
}

function tariffareas_showArea(id) {
	gui_showLoading();
	let taStore = appData.db.transaction(["tariffareas"], "readonly").objectStore("tariffareas");
	if (id != null) {
		taStore.get(parseInt(id)).onsuccess = function(event) {
			let tariffarea = event.target.result;
			storage_readStores(["categories", "taxes"], function(data) {
				_tariffareas_showArea(tariffarea, data["categories"], data["taxes"]);
			});
		};
	} else {
		storage_readStores(["categories", "taxes"], function(data) {
			_tariffareas_showArea(TariffArea_default(), data["categories"], data["taxes"]);
		});
	}
}
function _tariffareas_showArea(area, categories, taxes) {
	vue.screen.data = {
		tariffarea: area,
		categories: categories,
		taxes: taxes,
		productCache: [],
		selectedCatId: categories[0].id,
	};
	let prdStore = appData.db.transaction(["products"], "readonly").objectStore("products");
	let loaded = 0;
	if (area.prices.length == 0) {
		vue.screen.component = "vue-tariffarea-form";
		gui_hideLoading();
		return;
	}
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		prdStore.get(price.product).onsuccess = function(event) {
			let product = event.target.result;
			vue.screen.data.productCache[product.id] = product;
			loaded++;
			if (loaded == area.prices.length) {
				vue.screen.component = "vue-tariffarea-form";
				gui_hideLoading();
			}
		};
	}
	
}

function tariffareas_addProduct(product) {
	let area = vue.screen.data.tariffarea;
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		if (price.product.id == product.id) {
			return;
		}
	}
	vue.screen.data.productCache[product.id] = product;
	area.prices.push(TariffArea_price(product));
}

function tariffareas_delProduct(productId) {
	let area = vue.screen.data.tariffarea;
	for (let i = 0; i < area.prices.length; i++) {
		let price = area.prices[i];
		if (price.product == productId) {
			area.prices.splice(i, 1);
console.info(area.prices);
			return;
		}
	}
}

function tariffareas_saveArea() {
	let area = vue.screen.data.tariffarea;
	gui_showLoading();
	if ("id" in area) {
		srvcall_post("api/tariffarea", area, tariffareas_saveCallback);
	} else {
		srvcall_put("api/tariffarea/" + area["reference"], area, tariffareas_saveCallback);
	}
}

function tariffareas_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
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
	let area = vue.screen.data.tariffarea;
	if (!("id" in area)) {
		let respArea = JSON.parse(response);
		area.id = respArea["id"];
	}
	// Update in local database
	storage_write("tariffareas", area, function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}, function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	});
}

