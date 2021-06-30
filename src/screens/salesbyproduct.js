
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
			"reference": "salesByProduct-list",
			"title": null,
			"columns": [
				{reference: "image", label: "Image", visible: true, export: false, help: "L'image du produit. Ce champ ne peut être exporté."},
				{reference: "cashRegister", label: "Caisse", visible: false, help: "La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."},
				{reference: "category", label: "Catégorie", visible: true, help: "La catégorie actuelle du produit."},
				{reference: "reference", label: "Reference", visible: false, help: "La référence du produit."},
				{reference: "label", label: "Désignation", visible: true, help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."},
				{reference: "quantity", label: "Quantité", export_as_number: true, visible: true, help: "La quantité de produit vendue sur la période."},
				{reference: "priceSell", label: "Vente HT", export_as_number: true, visible: false, help: "Le montant de chiffre d'affaire hors taxes réalisé par le produit sur la période concernée."},
				{reference: "priceBuy", label: "Prix d'achat", export_as_number: true, visible: false, help: "Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente."},
				{reference: "margin", label: "Marge", export_as_number: true, visible: false, help: "La marge réalisée sur les ventes du produit sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente."},
				{reference: "priceSellVat", label: "Vente TTC", export_as_number: true, visible: false, help: "Le montant de chiffre d'affaire TTC réalisé par le produit sur la période concernée."},
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
		"products": {},
		"customProducts": {}
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
				if (!(line.product in _salesbyproduct_data.products)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.products[line.product] = {};
					} else {
						_salesbyproduct_data.products[line.product] = {qty: 0, price: 0.0, priceTax: 0.0};
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.products[line.product])) {
						_salesbyproduct_data.products[line.product][ticket.cashRegister] = {qty: 0, price: 0.0, priceTax: 0.0};
					}
					_salesbyproduct_data.products[line.product][ticket.cashRegister].qty += line.quantity;
					_salesbyproduct_data.products[line.product][ticket.cashRegister].priceTax += line.finalTaxedPrice
					_salesbyproduct_data.products[line.product][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
				} else {
					_salesbyproduct_data.products[line.product].qty += line.quantity;
					_salesbyproduct_data.products[line.product].priceTax += line.finalTaxedPrice
					_salesbyproduct_data.products[line.product].price += (line.finalTaxedPrice / (1.0 + line.taxRate))
				}
			} else {
				if (!(line.productLabel in _salesbyproduct_data.customProducts)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.customProducts[line.productLabel] = {};
					} else {
						_salesbyproduct_data.customProducts[line.productLabel] = {qty: 0, price: 0.0, priceTax: 0.0};
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.customProducts[line.productLabel])) {
						_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister] = {qty: 0, price: 0.0, priceTax: 0.0};
					}
					_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister].qty += line.quantity;
					_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister].priceTax += line.finalTaxedPrice
					_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

				} else {
					_salesbyproduct_data.customProducts[line.productLabel].qty += line.quantity;
					_salesbyproduct_data.customProducts[line.productLabel].priceTax += line.finalTaxedPrice
					_salesbyproduct_data.customProducts[line.productLabel].price += (line.finalTaxedPrice / (1.0 + line.taxRate))

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
				if (!(prd.id in _salesbyproduct_data.products)) {
					_salesbyproduct_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
				}
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in _salesbyproduct_data.products[prd.id])) {
						_salesbyproduct_data.products[prd.id][cashRegister.id] = {qty: 0, price: 0.0, priceTax: 0.0};;
					}
				}
			}
		}
		for (let prdLabel in _salesbyproduct_data.customProducts) {
			for (let j = 0; j < cashRegisters.length; j++) {
				let cashRegister = cashRegisters[j];
				if (!(cashRegister.id in _salesbyproduct_data.customProducts[prdLabel])) {
					_salesbyproduct_data.customProducts[prdLabel][cashRegister.id] = {qty: 0, price: 0.0, priceTax: 0.0};;
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
			if (!(prd.id in _salesbyproduct_data.products) && vue.screen.data.includeZero && !separateByCR) {
				_salesbyproduct_data.products[prd.id] = {qty: 0, price: 0.0, priceTax: 0.0};
			}
			if (prd.id in _salesbyproduct_data.products) {
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
	let customProductLabels = Object.keys(_salesbyproduct_data.customProducts).sort()
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
				let qty = _salesbyproduct_data.products[prd.id].qty.toLocaleString();
				let price = _salesbyproduct_data.products[prd.id].price;
				let line = [img, "", cat, prd.reference, prd.label, qty, price.toLocaleString()];
				if (prd.priceBuy > 0) {
					line.push(prd.priceBuy.toLocaleString());
					line.push((price - prd.priceBuy * qty).toLocaleString());
				} else {
					line.push("");
					line.push("");
				}
				line.push(_salesbyproduct_data.products[prd.id].priceTax.toLocaleString());
				lines.push(line);
			} else {
				for (let k = 0; k < cashRegisters.length; k++) {
					let cr = cashRegisters[k];
					if (cr.id in _salesbyproduct_data.products[prd.id]) {
						let qty = _salesbyproduct_data.products[prd.id][cr.id].qty;
						let price = _salesbyproduct_data.products[prd.id][cr.id].price;
						let line = [img, cr.label, cat, prd.reference, prd.label, qty, price.toLocaleString()];
						if (prd.priceBuy > 0) {
							line.push(prd.priceBuy.toLocaleString());
							line.push((price - prd.priceBuy * qty).toLocaleString());
						} else {
							line.push("");
							line.push("");
						}
						line.push(_salesbyproduct_data.products[prd.id][cr.id].priceTax.toLocaleString());
						lines.push(line);
					}
				}
			}
		}
	}
	for (let i = 0; i < customProductLabels.length; i++) {
		let productLabel = customProductLabels[i];
		if (!separateByCR) {
			let qty = _salesbyproduct_data.customProducts[productLabel].qty.toLocaleString();
			let price = _salesbyproduct_data.customProducts[productLabel].price.toLocaleString();
			let priceTax = _salesbyproduct_data.customProducts[productLabel].priceTax.toLocaleString();
			lines.push(["", "", "", "", productLabel, qty, price, "", "", priceTax]);
		} else {
			for (let k = 0; k < cashRegisters.length; k++) {
				let cr = cashRegisters[k];
				if (cr.id in _salesbyproduct_data.customProducts[productLabel]) {
					let qty = _salesbyproduct_data.customProducts[productLabel][cr.id].qty;
					let price = _salesbyproduct_data.customProducts[productLabel][cr.id].price.toLocaleString();
					let priceTax = _salesbyproduct_data.customProducts[productLabel][cr.id].priceTax.toLocaleString();
					lines.push(["", cr.label, "" ,"", productLabel, qty, price, "", "", priceTax]);
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

