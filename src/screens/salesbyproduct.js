
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
		"separateTaxes": false,
		"table": {
			"reference": "salesByProduct-list",
			"title": null,
			"columns": [
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
		"separateByTax": vue.screen.data.separateTaxes,
		"products": {},
		"customProducts": {},
		"total": {
			"qty": 0,
			"price": 0.0,
			"priceTax": 0.0,
			"priceBuy": 0.0,
			"margin": 0.0,
			"tax": 0.0,
			"taxDetails": {},
		},
		"initSalesData": function() {
			return {
				"qty": 0,
				"price": 0.0,
				"priceTax": 0.0,
				"tax": 0.0,
				"taxDetails": {},
			};
		},
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
			// Initialize product data for the first time
			if (line.product != null) {
				if (!(line.product in _salesbyproduct_data.products)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.products[line.product] = {};
					} else {
						_salesbyproduct_data.products[line.product] = _salesbyproduct_data.initSalesData();
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.products[line.product])) {
						_salesbyproduct_data.products[line.product][ticket.cashRegister] = _salesbyproduct_data.initSalesData();
					}
				}
			} else {
				if (!(line.productLabel in _salesbyproduct_data.customProducts)) {
					if (_salesbyproduct_data.separateByCR) {
						_salesbyproduct_data.customProducts[line.productLabel] = {};
					} else {
						_salesbyproduct_data.customProducts[line.productLabel] = _salesbyproduct_data.initSalesData();
					}
				}
				if (_salesbyproduct_data.separateByCR) {
					if (!(ticket.cashRegister in _salesbyproduct_data.customProducts[line.productLabel])) {
						_salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister] = _salesbyproduct_data.initSalesData();
					}
				}
			}
			// Pick the correct sales data
			let salesData = null;
			if (line.product != null) {
				if (_salesbyproduct_data.separateByCR) {
					salesData = _salesbyproduct_data.products[line.product][ticket.cashRegister];
				} else {
					salesData = _salesbyproduct_data.products[line.product];
				}
			} else {
				if (_salesbyproduct_data.separateByCR) {
					salesData = _salesbyproduct_data.customProducts[line.productLabel][ticket.cashRegister];
				} else {
					salesData = _salesbyproduct_data.customProducts[line.productLabel];
				}
			}
			// Update the sales data
			let price = (line.finalTaxedPrice / (1.0 + line.taxRate));
			salesData.qty += line.quantity;
			salesData.priceTax += line.finalTaxedPrice;
			salesData.price += price;
			_salesbyproduct_data.total.qty += line.quantity;
			_salesbyproduct_data.total.price += price;
			_salesbyproduct_data.total.priceTax += line.finalTaxedPrice;
			// Include tax details
			if (!(line.tax in salesData.taxDetails)) {
				salesData.taxDetails[line.tax] = {"base": 0.0, "amount": 0.0};
			}
			salesData.taxDetails[line.tax].base += price;
			salesData.taxDetails[line.tax].amount += line.finalTaxedPrice - price;
			if (!(line.tax in _salesbyproduct_data.total.taxDetails)) {
				_salesbyproduct_data.total.taxDetails[line.tax] = {"base": 0.0, "amount": 0.0};
			}
			_salesbyproduct_data.total.taxDetails[line.tax].base += price;
			_salesbyproduct_data.total.taxDetails[line.tax].amount += line.finalTaxedPrice - price;
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
		storage_readStores(["categories", "products", "cashRegisters", "taxes"], function(data) {
			let cr = null;
			let taxes = null;
			if (vue.screen.data.separateCashRegisters) {
				cr = data["cashRegisters"];
			}
			if (vue.screen.data.separateTaxes) {
				taxes = data["taxes"];
			}
			_salesbyproduct_render(cr, data["categories"], data["products"], taxes);
			storage_close();
		});
	});
}

function _salesbyproduct_render(cashRegisters, categories, products, taxes) {
	// Sort for display
	let separateByCR = cashRegisters != null;
	if (cashRegisters != null) {
		cashRegisters = cashRegisters.sort(tools_sort("reference"));
	}
	let separateByTax = taxes != null;
	if (vue.screen.data.includeZero) {
		// Initialize all missing products
		if (separateByCR) {
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if (prd.visible || vue.screen.data.includeArchives) {
					if (!(prd.id in _salesbyproduct_data.products)) {
						_salesbyproduct_data.products[prd.id] = {};
					}
					for (let j = 0; j < cashRegisters.length; j++) {
						let cashRegister = cashRegisters[j];
						if (!(cashRegister.id in _salesbyproduct_data.products[prd.id])) {
							_salesbyproduct_data.products[prd.id][cashRegister.id] = _salesbyproduct_data.initSalesData();
						}
					}
				}
			}
			for (let prdLabel in _salesbyproduct_data.customProducts) {
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in _salesbyproduct_data.customProducts[prdLabel])) {
						_salesbyproduct_data.customProducts[prdLabel][cashRegister.id] = _salesbyproduct_data.initSalesData();
					}
				}
			}
		} else {
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if (prd.visible || vue.screen.data.includeArchives) {
					if (!(prd.id in _salesbyproduct_data.products)) {
						_salesbyproduct_data.products[prd.id] = _salesbyproduct_data.initSalesData();
					}
				}
			}
		}
	}
	// Fill missing tax detail with 0
	if (separateByTax) {
		for (let prdId in _salesbyproduct_data.products) {
			if (separateByCR) {
				for (let cr in _salesbyproduct_data.products[prdId]) {
					for (let i = 0; i < taxes.length; i++) {
						let tax = taxes[i];
						if (!(tax.id in _salesbyproduct_data.products[prdId][cr].taxDetails)) {
							_salesbyproduct_data.products[prdId][cr].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					let tax = taxes[i];
					if (!(tax.id in _salesbyproduct_data.products[prdId].taxDetails)) {
						_salesbyproduct_data.products[prdId].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
		for (let prdId in _salesbyproduct_data.customProducts) {
			if (separateByCR) {
				for (let cr in _salesbyproduct_data.customProducts[prdId]) {
					for (let i = 0; i < taxes.length; i++) {
						let tax = taxes[i];
						if (!(tax.id in _salesbyproduct_data.customProducts[prdId][cr].taxDetails)) {
							_salesbyproduct_data.customProducts[prdId][cr].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					let tax = taxes[i];
					if (!(tax.id in _salesbyproduct_data.customProducts[prdId].taxDetails)) {
						_salesbyproduct_data.customProducts[prdId].taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
		for (let i = 0; i < taxes.length; i++) {
			let tax = taxes[i];
			if (!(tax.id in _salesbyproduct_data.total.taxDetails)) {
				_salesbyproduct_data.total.taxDetails[tax.id] = {"base": 0.0, "amount": 0.0};
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
				_salesbyproduct_data.products[prd.id] = _salesbyproduct_data.initSalesData();
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
	let customProductLabels = Object.keys(_salesbyproduct_data.customProducts).sort();
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
				let qty = _salesbyproduct_data.products[prd.id].qty;
				let price = _salesbyproduct_data.products[prd.id].price;
				let line = [img, "", cat, prd.reference, prd.label, qty.toLocaleString(), price.toLocaleString()];
				if (prd.priceBuy > 0) {
					line.push((prd.priceBuy * qty).toLocaleString());
					line.push((price - prd.priceBuy * qty).toLocaleString());
					_salesbyproduct_data.total.priceBuy += prd.priceBuy * qty;
					_salesbyproduct_data.total.margin += price - prd.priceBuy * qty;
				} else {
					line.push("");
					line.push("");
				}
				line.push(_salesbyproduct_data.products[prd.id].priceTax.toLocaleString());
				if (separateByTax) {
					for (let k = 0; k < taxes.length; k++) {
						let taxDetail = _salesbyproduct_data.products[prd.id].taxDetails[taxes[k].id];
						if (taxDetail.base != 0.0) {
							line.push(taxDetail.base.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
							line.push(taxDetail.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
							line.push((taxDetail.base + taxDetail.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
						} else {
							line.push("");
							line.push("");
							line.push("");
						}
					}
				}
				lines.push(line);
			} else {
				for (let k = 0; k < cashRegisters.length; k++) {
					let cr = cashRegisters[k];
					if (cr.id in _salesbyproduct_data.products[prd.id]) {
						let qty = _salesbyproduct_data.products[prd.id][cr.id].qty;
						let price = _salesbyproduct_data.products[prd.id][cr.id].price;
						let line = [img, cr.label, cat, prd.reference, prd.label, qty, price.toLocaleString()];
						if (prd.priceBuy > 0) {
							line.push((prd.priceBuy * qty).toLocaleString());
							line.push((price - prd.priceBuy * qty).toLocaleString());
							_salesbyproduct_data.total.priceBuy += prd.priceBuy * qty;
							_salesbyproduct_data.total.margin += price - prd.priceBuy * qty;
						} else {
							line.push("");
							line.push("");
						}
						line.push(_salesbyproduct_data.products[prd.id][cr.id].priceTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
						if (separateByTax) {
							for (let l = 0; l < taxes.length; l++) {
								let taxDetail = _salesbyproduct_data.products[prd.id][cr.id].taxDetails[taxes[l].id];
								if (taxDetail.base != 0.0) {
									line.push(taxDetail.base.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
									line.push(taxDetail.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
									line.push((taxDetail.base + taxDetail.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
								} else {
									line.push("");
									line.push("");
									line.push("");
								}
							}
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
			let qty = _salesbyproduct_data.customProducts[productLabel].qty.toLocaleString();
			let price = _salesbyproduct_data.customProducts[productLabel].price.toLocaleString();
			let priceTax = _salesbyproduct_data.customProducts[productLabel].priceTax.toLocaleString();
			let line = ["", "", "", "", productLabel, qty, price, "", "", priceTax];
			if (separateByTax) {
				for (let l = 0; l < taxes.length; l++) {
					let taxDetail = _salesbyproduct_data.customProducts[productLabel].taxDetails[taxes[l].id];
					if (taxDetail.base != 0.0) {
						line.push(taxDetail.base.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
						line.push(taxDetail.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
						line.push((taxDetail.base + taxDetail.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
					} else {
						line.push("");
						line.push("");
						line.push("");
					}
				}
			}
			lines.push(line);
		} else {
			for (let k = 0; k < cashRegisters.length; k++) {
				let cr = cashRegisters[k];
				if (cr.id in _salesbyproduct_data.customProducts[productLabel]) {
					let qty = _salesbyproduct_data.customProducts[productLabel][cr.id].qty;
					let price = _salesbyproduct_data.customProducts[productLabel][cr.id].price.toLocaleString();
					let priceTax = _salesbyproduct_data.customProducts[productLabel][cr.id].priceTax.toLocaleString();
					let line = ["", "", "", "", productLabel, qty, price, "", "", priceTax];
					if (separateByTax) {
						for (let l = 0; l < taxes.length; l++) {
							let taxDetail = _salesbyproduct_data.customProducts[productLabel][cr.id].taxDetails[taxes[l].id];
							if (taxDetail.base != 0.0) {
								line.push(taxDetail.base.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
								line.push(taxDetail.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
								line.push((taxDetail.base + taxDetail.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
							} else {
								line.push("");
								line.push("");
								line.push("");
							}
						}
					}
					lines.push(line);
				}
			}
		}
	}
	// Set table
	let oldColumns = vue.screen.data.table.columns;
	let oldColumnVisible = function(label, old, default_val) {
		for (let i = 0; i < old.length; i++) {
			if (old[i].label == label) {
				return old[i].visible;
			}
		}
		return default_val;
	};
	vue.screen.data.table.title = "Ventes par produits du "
			+ tools_dateToString(vue.screen.data.start)
			+ " au "
			+ tools_dateToString(vue.screen.data.stop);
	vue.screen.data.table.columns = [
		{reference: "image", label: "Image", visible: oldColumnVisible("Image", oldColumns, true), export: false, help: "L'image du produit. Ce champ ne peut être exporté."},
		{reference: "cashRegister", label: "Caisse", visible: oldColumnVisible("Caisse", oldColumns, false), help: "La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."},
		{reference: "category", label: "Catégorie", visible: oldColumnVisible("Catégorie", oldColumns, true), help: "La catégorie actuelle du produit."},
		{reference: "reference", label: "Reference", visible: oldColumnVisible("Reference", oldColumns, false), help: "La référence du produit."},
		{reference: "label", label: "Désignation", visible: oldColumnVisible("Désignation", oldColumns, true), help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."},
		{reference: "quantity", label: "Quantité", export_as_number: true, visible: oldColumnVisible("Quantité", oldColumns, true), help: "La quantité de produit vendue sur la période.", class: "z-oddcol"},
		{reference: "priceSell", label: "Vente HT", export_as_number: true, visible: oldColumnVisible("Vente HT", oldColumns, false), help: "Le montant de chiffre d'affaire hors taxes réalisé par le produit sur la période concernée.", class: "z-oddcol"},
		{reference: "priceBuy", label: "Prix d'achat", export_as_number: true, visible: oldColumnVisible("Prix d'achat", oldColumns, false), help: "Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente.", class: "z-oddcol"},
		{reference: "margin", label: "Marge", export_as_number: true, visible: oldColumnVisible("Marge", oldColumns, false), help: "La marge réalisée sur les ventes du produit sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente.", class: "z-oddcol"},
		{reference: "priceSellVat", label: "Vente TTC", export_as_number: true, visible: oldColumnVisible("Vente TTC", oldColumns, false), help: "Le montant de chiffre d'affaire TTC réalisé par le produit sur la période concernée.", class: "z-oddcol"},
	];
	vue.screen.data.table.footer = [
		"", "", "", "", "Total",
		_salesbyproduct_data.total.qty.toLocaleString(),
		_salesbyproduct_data.total.price.toLocaleString(),
		_salesbyproduct_data.total.priceBuy.toLocaleString(),
		_salesbyproduct_data.total.margin.toLocaleString(),
		_salesbyproduct_data.total.priceTax.toLocaleString(),
	];
	if (separateByTax) {
		for (let i = 0; i < taxes.length; i++) {
			let tax = taxes[i];
			let col = {reference: "tax-" + i + "-base", label: tax.label + " base", visible: oldColumnVisible(tax.label + " base", oldColumns, false), help: "Le montant de chiffre d'affaire hors taxe associé au taux de TVA."};
			if (i % 2 != 0) {
				col.class = "z-oddcol";
			}
			vue.screen.data.table.columns.push(col);
			col = {reference: "tax-" + i + "-amount", label: tax.label + " TVA", visible: oldColumnVisible(tax.label + " TVA", oldColumns, false), help: "Le montant de TVA collectée associé au taux de TVA."};
			if (i % 2 != 0) {
				col.class = "z-oddcol";
			}
			vue.screen.data.table.columns.push(col);
			col = {reference: "tax-" + i + "-total", label: tax.label + " TTC", visible: oldColumnVisible(tax.label + " TTC", oldColumns, false), help: "Le montant TTC associé au taux de TVA."};
			if (i % 2 != 0) {
				col.class = "z-oddcol";
			}
			vue.screen.data.table.columns.push(col);
			let totalTaxDetail = _salesbyproduct_data.total.taxDetails[tax.id]
			vue.screen.data.table.footer.push(totalTaxDetail.base.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
			vue.screen.data.table.footer.push(totalTaxDetail.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
			vue.screen.data.table.footer.push((totalTaxDetail.base + totalTaxDetail.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 5}));
		}
	}
	Vue.set(vue.screen.data.table, "lines", lines);
	gui_hideLoading();
}

