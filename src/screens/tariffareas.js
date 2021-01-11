function tariffareas_show() {
	gui_showLoading();
	let areas = [];
	vue.screen.data = {tariffareas: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStore("tariffareas", function(areas) {
			vue.screen.data.tariffareas = areas;
			vue.screen.component = "vue-tariffarea-list";
			gui_hideLoading();
			storage_close();
		});
	});
}

function tariffareas_showArea(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "taxes"], function(data) {
			if (id != null) {
				storage_get("tariffareas", parseInt(id), function(tariffarea) {
					_tariffareas_showArea(tariffarea, data["categories"], data["taxes"]);
					storage_close();
				});
			} else {
				_tariffareas_showArea(TariffArea_default(), data["categories"], data["taxes"]);
				storage_close();
			}
		});
	});
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
			let taxId = price.tax;
			let tax = null;
			if (taxId == null) {
				taxId = product.tax;
			}
			for (let j = 0; j < vue.screen.data.taxes.length; j++) {
				if (vue.screen.data.taxes[j].id == taxId) {
					tax = vue.screen.data.taxes[j];
					break;
				}
			}
			price.priceSellVat = Number(price.price * (1.0 + tax.rate)).toFixed(2)
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
			return;
		}
	}
}

function tariffareas_updatePrice(price) {
	let sellVat = price.priceSellVat;
	let prd = vue.screen.data.productCache[price.product];
	let newTaxId = price.tax;
	let tax = null;
	if (newTaxId != null) {
		for (let j = 0; j < vue.screen.data.taxes.length; j++) {
			let jTax = vue.screen.data.taxes[j];
			if (jTax.id == newTaxId) {
				tax = jTax;
				break;
			}
		}
	} else {
		for (let j = 0; j < vue.screen.data.taxes.length; j++) {
			let jTax = vue.screen.data.taxes[j];
			if (jTax.id == prd.tax) {
				tax = jTax;
				break;
			}
		}
	}
	let taxRate = tax.rate;
	price.price = Number(sellVat / (1.0 + taxRate)).toFixed(5);
}

function tariffareas_saveArea() {
	let area = vue.screen.data.tariffarea;
	gui_showLoading();
	if ("id" in area) {
		srvcall_post("api/tariffarea", area, tariffareas_saveCallback);
	} else {
		srvcall_put("api/tariffarea/" + encodeURIComponent(area["reference"]), area, tariffareas_saveCallback);
	}
}

function tariffareas_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tariffareas_saveArea)) {
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
	storage_open(function(event) {
		storage_write("tariffareas", area,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function _tariffareas_parseCsv(fileContent) {
	let csv = new CSV(fileContent, {header: true, cast: false});
	let rawPrices = csv.parse();
	if (rawPrices.length == 0) {
		Vue.set(vue.screen.data.tariffarea, "prices", []);
	}
	gui_showLoading();
	let columnMappingDef = {
		reference: "reference",
		"référence": "reference",
		priceSellVat: "priceSellVat",
		"prix de vente ttc": "priceSellVat",
		tax: "tax",
		"tva": "tax"
		
	};
	columnMapping = {};
	unknownColumns = [];
	for (let key in rawPrices[0]) {
		if (key.toLowerCase() in columnMappingDef) {
			columnMapping[key] = columnMappingDef[key.toLowerCase()];
		} else {
			unknownColumns.push(key);
		}
	}
	let taxByRef = [];
	let taxByLabel = [];
	let prdRefs = [];
	let readPrices = [];
	for (let i = 0; i < vue.screen.data.taxes.length; i++) {
		let tax = vue.screen.data.taxes[i];
		taxByRef[tax.reference] = tax;
		taxByLabel[tax.label] = tax;
	}
	for (let i = 0; i < rawPrices.length; i++) {
		// Convert the incoming csv lines to prices data
		// Except product ID which is looked for after
		function mapValues(line, mapping) {
			let ret = {};
			for (key in line) {
				if (key in mapping) {
					ret[mapping[key]] = line[key];
				}
			}
			return ret;
		}
		function convertNum(value) {
			let v = value.replace(",", ".");
			v = v.replace(" ", "");
			return parseFloat(v);
		}
		function convertTax(value) {
			if (value == "") {
				return null;
			} else {
				if (value in taxByRef) {
					return taxByRef[value].id;
				}
				if (value in taxByLabel) {
					return taxByLabel[value].id;
				}
				return null;
			}
		}
		function convertValues(value) {
			if ("priceSellVat" in value) {
				value.priceSellVat = convertNum(value.priceSellVat);
			} else {
				value.priceSellVat = null;
			}
			if ("tax" in value) {
				value.tax = convertTax(value.tax);
			} else {
				value.tax = null;
			}
			return value;
		}
		let value = mapValues(rawPrices[i], columnMapping);
		value = convertValues(value);
		rawPrices[i] = value;
		prdRefs.push(value.reference);
	}
	let prices = [];
	let errors = [];
	storage_open(function() {
		let prds = storage_getIndex("products", "reference", prdRefs, function(data) {
			for (let i = 0; i < data.length; i++) {
				let product = data[i];
				let rawPrice = rawPrices[i];
				if (product != null) {
					let price = TariffArea_price(product);
					price.priceSellVat = rawPrice.priceSellVat;
					price.tax = rawPrice.tax;
					let taxId = price.tax;
					let tax = null;
					if (taxId == null) {
						taxId = product.tax;
					}
					for (let j = 0; j < vue.screen.data.taxes.length; j++) {
						if (vue.screen.data.taxes[j].id == taxId) {
							tax = vue.screen.data.taxes[j];
							break;
						}
					}
					price.price = Number(price.priceSellVat / (1.0 + tax.rate)).toFixed(2)
					prices.push(price);
					vue.screen.data.productCache[product.id] = product;
				} else {
					errors.push("- " + prdRefs[i]);
				}
			}
			Vue.set(vue.screen.data.tariffarea, "prices", prices);
			gui_hideLoading();
			if (errors.length > 0) {
				let message = ["La liste des tarifs a été modifiée, mais les références suivantes n'ont pas été trouvées :"];
				for (let i = 0; i < errors.length; i++) {
					message.push(errors[i]);
				}
				gui_showWarning(message);
			} else {
				gui_showMessage("La liste des tarifs a été remplacée. N'oubliez pas d'enregistrer.")
			}
		});
	});
}
