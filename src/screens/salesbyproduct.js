
var _salesbyproduct_data = {};

function salesbyproduct_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"includeArchives": false,
		"includeZero": true,
		"separateCashRegisters": false,
		"table": {
			"title": null,
			"columns": [
				{label: "Image", visible: true, export: false, help: "L'image du produit. Ce champ ne peut être exporté."},
				{label: "Caisse", visible: false, help: "La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."},
				{label: "Catégorie", visible: true, help: "La catégorie actuelle du produit."},
				{label: "Reference", visible: false, help: "La référence du produit."},
				{label: "Désignation", visible: true, help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."},
				{label: "Quantité", visible: true, help: "La quantité de produit vendue sur la période."},
				{label: "HT", visible: false, help: "Le montant de chiffre d'affaire hors taxes réalisé par le produit sur la période concernée."},
				{label: "Prix d'achat", visible: false, help: "Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente."},
				{label: "Marge", visible: false, help: "La marge réalisée sur les ventes du produit sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente."},
			],
		},
	}
	vue.screen.component = "vue-salesbyproduct";
}

function salesbyproduct_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesbyproduct_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"separateByCR": vue.screen.data.separateCashRegisters,
		"productsQty": {},
		"customProductsQty": {}
	};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_countCallback);
	gui_showLoading();
}

function _salesbyproduct_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesbyproduct_data.pages = pages;
	gui_showProgress(0, pages);
	srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
}

function _salesbyproduct_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let line = ticket.lines[j];
			if (line.product != null) {
				if (!(line.product in _salesbyproduct_data.productsQty)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.productsQty[line.product] = {};
					} else {
						_salesbyproduct_data.productsQty[line.product] = 0;
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.productsQty[line.product])) {
						_salesbyproduct_data.productsQty[line.product][ticket.cashRegister] = 0
					}
					_salesbyproduct_data.productsQty[line.product][ticket.cashRegister] += line.quantity;
				} else {
					_salesbyproduct_data.productsQty[line.product] += line.quantity;
				}
			} else {
				if (!(line.productLabel in _salesbyproduct_data.customProductsQty)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.customProductsQty[line.productLabel] = {};
					} else {
						_salesbyproduct_data.customProductsQty[line.productLabel] = 0;
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.customProductsQty[line.productLabel])) {
						_salesbyproduct_data.customProductsQty[line.productLabel][ticket.cashRegister] = 0
					}
					_salesbyproduct_data.customProductsQty[line.productLabel][ticket.cashRegister] += line.quantity;
				} else {
					_salesbyproduct_data.customProductsQty[line.productLabel] += line.quantity;
				}
			}
		}
	}
	_salesbyproduct_data.currentPage++;
	if (_salesbyproduct_data.currentPage < _salesbyproduct_data.pages) {
		gui_showProgress(_salesbyproduct_data.currentPage, _salesbyproduct_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbyproduct_data.currentPage) + "&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
	} else {
		_salesbyproduct_dataRetreived();
	}
}

function _salesbyproduct_dataRetreived() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["categories", "products", "cashRegisters"], function(data) {
			if (vue.screen.data.separateCashRegisters) {
				_salesbyproduct_render(data["cashRegisters"], data["categories"], data["products"]);
			} else {
				_salesbyproduct_render(null, data["categories"], data["products"]);
			}
			storage_close();
		});
	});
}

function _salesbyproduct_render(cashRegisters, categories, products) {
	// Sort for display
	let separateByCR = cashRegisters != null;
	if (cashRegisters != null) {
		cashRegisters = cashRegisters.sort(tools_sort("reference"));
	}
	if (separateByCR && vue.screen.data.includeZero) {
		// Initialize all missing 0 in separated cash registers
		for (let i = 0; i < products.length; i++) {
			let prd = products[i];
			if (prd.visible || vue.screen.data.includeArchives) {
				if (!(prd.id in _salesbyproduct_data.productsQty)) {
					_salesbyproduct_data.productsQty[prd.id] = {};
				}
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in _salesbyproduct_data.productsQty[prd.id])) {
						_salesbyproduct_data.productsQty[prd.id][cashRegister.id] = 0;
					}
				}
			}
		}
		for (let prdLabel in _salesbyproduct_data.customProductsQty) {
			for (let j = 0; j < cashRegisters.length; j++) {
				let cashRegister = cashRegisters[j];
				if (!(cashRegister.id in _salesbyproduct_data.customProductsQty[prdLabel])) {
					_salesbyproduct_data.customProductsQty[prdLabel][cashRegister.id] = 0;
				}
			}
		}
	}
	let catById = [];
	for (let i = 0; i < categories.length; i++) {
		catById[categories[i].id] = categories[i];
		catById[categories[i].id].products = [];
	}
	for (let i = 0; i < products.length; i++) {
		// Put the data into the rendering data (catById)
		let prd = products[i];
		if (prd.visible || vue.screen.data.includeArchives) {
			if (!(prd.id in _salesbyproduct_data.productsQty) && vue.screen.data.includeZero && !separateByCR) {
				_salesbyproduct_data.productsQty[prd.id] = 0;
			}
			if (prd.id in _salesbyproduct_data.productsQty) {
				catById[prd.category].products.push(prd);
			}
		}
	}
	// Get non empty categories and sort their content
	let stats = [];
	for (let id in catById) {
		if (catById[id].products.length > 0) {
			catById[id].products = catById[id].products.sort(tools_sort("dispOrder", "reference"));
			stats.push(catById[id]);
		}
	}
	// Sort the categories
	stats = stats.sort(tools_sort("dispOrder", "reference"));
	let customProductLabels = Object.keys(_salesbyproduct_data.customProductsQty).sort()
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < stats.length; i++) {
		let cat = stats[i].label;
		for (let j = 0; j < stats[i].products.length; j++) {
			prd = stats[i].products[j];
			let img = null;
			if (prd.hasImage) {
				img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken()};
			} else {
				img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken()};
			}
			if (!separateByCR) {
				let qty = _salesbyproduct_data.productsQty[prd.id].toLocaleString();
				let line = [img, "", cat, prd.reference, prd.label, qty];
				line.push((prd.priceSell * qty).toLocaleString());
				if (prd.priceBuy > 0) {
					line.push(prd.priceBuy.toLocaleString());
					line.push(((prd.priceSell - prd.priceBuy) * qty).toLocaleString());
				} else {
					line.push("");
					line.push("");
				}
				lines.push(line);
			} else {
				for (let k = 0; k < cashRegisters.length; k++) {
					let cr = cashRegisters[k];
					if (cr.id in _salesbyproduct_data.productsQty[prd.id]) {
						let qty = _salesbyproduct_data.productsQty[prd.id][cr.id];
						let line = [img, cr.label, cat, prd.reference, prd.label, qty];
						line.push((prd.priceSell * qty).toLocaleString());
						if (prd.priceBuy > 0) {
							line.push(prd.priceBuy.toLocaleString());
							line.push(((prd.priceSell - prd.priceBuy) * qty).toLocaleString());
						} else {
							line.push("");
							line.push("");
						}
						lines.push(line);
					}
				}
			}
		}
	}
	for (let i = 0; i < customProductLabels.length; i++) {
		let productLabel = customProductLabels[i];
		if (!separateByCR) {
			let qty = _salesbyproduct_data.customProductsQty[productLabel].toLocaleString();
			lines.push(["", "", "", "", productLabel, qty, "", "", ""]);
		} else {
			for (let k = 0; k < cashRegisters.length; k++) {
				let cr = cashRegisters[k];
				if (cr.id in _salesbyproduct_data.customProductsQty[productLabel]) {
					let qty = _salesbyproduct_data.customProductsQty[productLabel][cr.id];
					lines.push(["", cr.label, "" ,"", productLabel, qty, "", "", ""]);
				}
			}
		}
	}
	vue.screen.data.table.title = "Ventes par produits du "
			+ tools_dateToString(vue.screen.data.start)
			+ " au "
			+ tools_dateToString(vue.screen.data.stop);
	Vue.set(vue.screen.data.table, "lines", lines);
	gui_hideLoading();
}

