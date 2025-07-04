var _salesbycategory_data = {};

function salesbycategory_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"includeArchives": false,
		"includeZero": true,
		"separateCashRegisters": false,
		"separateTaxes": false,
		"table": new Table().reference("salesByCategory-list")
	}
	vue.screen.component = "vue-salesbycategory";
}

function salesbycategory_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesbycategory_data = {
		"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"separateByCR": vue.screen.data.separateCashRegisters,
		"separateByTax": vue.screen.data.separateTaxes,
		"products": {}, // Products data by id
		"productCat": {}, // Category id from product id
		"categories": {}, // Category sales data by category id (0 for custom products)
		"initSalesData": function() {
			return {
				"qty": 0,
				"price": 0.0,
				"priceTax": 0.0,
				"priceBuy": 0.0,
				"margin": 0.0,
				"tax": 0.0,
				"taxDetails": {},
			};
		},
	};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_countCallback);
	gui_showLoading();
}

function _salesbycategory_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbycategory_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesbycategory_data.pages = pages;
	gui_showProgress(0, pages);
	// Load products to get their category, then load tickets
	storage_open(function(event) {
		storage_readStore("products", function(data) {
			for (let i = 0; i < data.length; i++) {
				let product = data[i];
				_salesbycategory_data.productCat[product.id] = product.category;
				_salesbycategory_data.products[product.id] = product;
			}
			storage_close();
			srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_filterCallback);
		});
	});
}

function _salesbycategory_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbycategory_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let line = ticket.lines[j];
			let catId = 0;
			let unitPriceBuy = 0.0;
			if (line.product != null) {
				catId = _salesbycategory_data.productCat[line.product];
				unitPriceBuy = _salesbycategory_data.products[line.product].priceBuy;
			}
			// Initialize sales data to 0 for categories seen the first time
			if (!(catId in _salesbycategory_data.categories)) {
				if (_salesbycategory_data.separateByCR) {
					_salesbycategory_data.categories[catId] = {};
				} else {
					_salesbycategory_data.categories[catId] = _salesbycategory_data.initSalesData();
				}
			}
			// Count sales
			let salesData = _salesbycategory_data.categories[catId];
			let price = (line.finalTaxedPrice / (1.0 + line.taxRate));
			let priceBuy = unitPriceBuy * line.quantity;
			if (_salesbycategory_data.separateByCR) {
				// Separated by cash registers
				if (!(ticket.cashRegister in salesData)) {
					salesData[ticket.cashRegister] = _salesbycategory_data.initSalesData();
				}
				salesData = _salesbycategory_data.categories[catId][ticket.cashRegister];
			}
			salesData.qty += line.quantity;
			salesData.price += price;
			salesData.priceTax += line.finalTaxedPrice;
			salesData.priceBuy += priceBuy;
			salesData.margin += price - priceBuy;
			salesData.tax += line.finalTaxedPrice - price;
			if (!(line.tax in salesData["taxDetails"])) {
				salesData["taxDetails"][line.tax] = {"base": 0.0, "amount": 0.0};
			}
			salesData["taxDetails"][line.tax].base += price;
			salesData["taxDetails"][line.tax].amount += line.finalTaxedPrice - price;
		}
	}
	_salesbycategory_data.currentPage++;
	if (_salesbycategory_data.currentPage < _salesbycategory_data.pages) {
		gui_showProgress(_salesbycategory_data.currentPage, _salesbycategory_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbycategory_data.currentPage) + "&dateStart=" + _salesbycategory_data.start + "&dateStop=" + _salesbycategory_data.stop, _salesbycategory_filterCallback);
	} else {
		_salesbycategory_dataRetreived();
	}
}

function _salesbycategory_dataRetreived() {
	gui_showLoading();
	storage_open(function (event) {
		storage_readStores(["categories", "cashRegisters", "taxes"], function (data) {
			let cr = null
			if (vue.screen.data.separateCashRegisters) {
				cr = data["cashRegisters"];
			}
			let taxes = null;
			if (vue.screen.data.separateTaxes) {
				taxes = data["taxes"];
			}
			_salesbycategory_render(cr, data["categories"], taxes);
			storage_close();
		});
	});
}

function _salesbycategory_render(cashRegisters, categories, taxes) {
	// Sort for display
	let separateByCR = cashRegisters != null;
	if (cashRegisters != null) {
		cashRegisters = cashRegisters.sort(tools_sort("reference"));
	}
	let separateByTaxes = taxes != null;
	// Include 0 for non used categories
	if (vue.screen.data.includeZero) {
		for (let i = 0; i < categories.length; i++) {
			let cat = categories[i];
			if (separateByCR) {
				if (!(cat.id in _salesbycategory_data.categories)) {
					_salesbycategory_data.categories[cat.id] = {};
				}
				// Initialize all missing 0 in separated cash registers
				let salesData = _salesbycategory_data.categories[cat.id];
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in salesData)) {
						salesData[cashRegister.id] = _salesbycategory_data.initSalesData();
					}
					// Include 0 for unused taxes
					if (separateByTaxes) {
						salesData = _salesbycategory_data.categories[cat.id][cashRegister.id];
						for (let k = 0; k < taxes.length; k++) {
							if (!(k in salesData.taxDetails)) {
								salesData.taxDetails[k] = {"base": 0.0, "amount": 0.0};
							}
						}
					}
				}
			} else {
				if (!(cat.id in _salesbycategory_data.categories)) {
					_salesbycategory_data.categories[cat.id] = _salesbycategory_data.initSalesData();
				}
				// Include 0 for unused taxes
				if (separateByTaxes) {
					let salesData = _salesbycategory_data.categories[cat.id];
					for (let j = 0; j < taxes.length; j++) {
						if (!(j in salesData.taxDetails)) {
							salesData.taxDetails[j] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			}
		}
		if (separateByCR) {
			// Set 0 for custom products only if there are some
			if ((0 in _salesbycategory_data.categories) &&  _salesbycategory_data.categories[0].length > 0) {
				let salesData = _salesbycategory_data.categories[0];
				for (let j = 0; j < cashRegisters.length; j++) {
					let cashRegister = cashRegisters[j];
					if (!(cashRegister.id in salesData)) {
						salesData[cashRegister.id] = _salesbycategory_data.initSalesData();
					}
				}
			}
		} // else don't add 0 for custom products if there are none
	}
	// Set 0 for unused taxes
	if (separateByTaxes) {
		for (let catId in _salesbycategory_data.categories) {
			let salesData;
			if (separateByCR) {
				for (let crId in _salesbycategory_data.categories[catId]) {
					for (let i = 0; i < taxes.length; i++) {
						if (!(taxes[i].id in _salesbycategory_data.categories[catId][crId].taxDetails)) {
							_salesbycategory_data.categories[catId][crId].taxDetails[taxes[i].id] = {"base": 0.0, "amount": 0.0};
						}
					}
				}
			} else {
				for (let i = 0; i < taxes.length; i++) {
					if (!(taxes[i].id in _salesbycategory_data.categories[catId].taxDetails)) {
						_salesbycategory_data.categories[catId].taxDetails[taxes[i].id] = {"base": 0.0, "amount": 0.0};
					}
				}
			}
		}
	}
	// Sort the categories
	let sortedCats = categories.sort(tools_sort("dispOrder", "reference"));
	let sortedData = [];
	for (let i = 0; i < sortedCats.length; i++) {
		let catId = sortedCats[i].id;
		if (catId in _salesbycategory_data.categories) {
			sortedData.push(_salesbycategory_data.categories[catId]);
			sortedData[sortedData.length - 1].category = sortedCats[i];
		}
	}
	// Add custom products at the end if there are some
	if (0 in _salesbycategory_data.categories) {
		sortedData.push(_salesbycategory_data.categories[0]);
		sortedData[sortedData.length - 1].category = {"label": "Open products ", "reference": "", "hasImage": false};
	}
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < sortedData.length; i++) {
		let cat = sortedData[i].category;
		let salesData = sortedData[i];

		let img = null;
		if (cat.hasImage) {
			img = login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
		} else {
			img = login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
		}
		if (!separateByCR) {
			let line = [
				img,
				"",
				cat.label,
				cat.reference,
				salesData.qty,
				salesData.price,
				salesData.priceBuy,
				salesData.margin,
				salesData.priceTax,
				salesData.tax
			];
			if (separateByTaxes) {
				for (let j = 0; j < taxes.length; j++) {
					if (salesData.taxDetails[taxes[j].id].base != 0.0) {
						let taxDetail = salesData.taxDetails[taxes[j].id];
						line.push(taxDetail.base);
						line.push(taxDetail.amount);
						line.push(taxDetail.base + taxDetail.amount);
					} else {
						line.push("");
						line.push("");
						line.push("");
					}
				}
			}
			lines.push(line);
		} else {
			for (let j = 0 ; j < cashRegisters.length; j++) {
				let cr = cashRegisters[j];
				let line = [
					img,
					cr.label,
					cat.label,
					cat.reference,
					salesData[cr.id].qty,
					salesData[cr.id].price,
					salesData[cr.id].priceBuy,
					salesData[cr.id].margin,
					salesData[cr.id].priceTax,
					salesData[cr.id].tax
				];
				if (separateByTaxes) {
					for (let k = 0; k < taxes.length; k++) {
						if (salesData[cr.id].taxDetails[taxes[k].id].base != 0.0) {
							let taxDetail = salesData[cr.id].taxDetails[taxes[k].id];
							line.push(taxDetail.base);
							line.push(taxDetail.amount);
							line.push(taxDetail.base + taxDetail.amount);
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
	vue.screen.data.table.reset();
	vue.screen.data.table

		// .column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("L'image de la catégorie. Ce champ ne peut être exporté."))
		// .column(new TableCol().reference("cashRegister").label("Caisse").visible(oldColumnVisible("Caisse", oldColumns, false)).help("La caisse pour laquelle les vente sont comptabilisées. Si l'option Détailler par caisse n'est pas cochée, ce champ est vide."))
		// .column(new TableCol().reference("label").label("Catégorie").visible(oldColumnVisible("Catégorie", oldColumns, true)).help("Le nom de la catégorie."))
		// .column(new TableCol().reference("reference").label("Référence").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Référence", oldColumns, false)).help("La référence de la catégorie."))
		// .column(new TableCol().reference("quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantité", oldColumns, true)).help("La quantité de produits vendus sur la période.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSell").label("Total ventes HT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total ventes HT", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxes réalisé par les produits de la catégorie sur la période concernée.").class("z-oddcol"))
		// .column(new TableCol().reference("priceBuy").label("Total achats HT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total achats HT", oldColumns, false)).help("Le prix d'achat hors taxes actuel. Ce montant n'a pas d'historique et ne correspond pas forcément au prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("margin").label("Marge").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Marge", oldColumns, false)).help("La marge réalisée sur les ventes des produits sur la période. Cette marge est calculée en fonction du prix d'achat actuel et non du prix d'achat au moment de la vente.").class("z-oddcol"))
		// .column(new TableCol().reference("priceSellVat").label("Ventes TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Ventes TTC", oldColumns, false)).help("Le montant de chiffre d'affaire TTC réalisé par les produits de la catégorie sur la période concernée.").class("z-oddcol"))
		// .column(new TableCol().reference("taxTotal").label("Total TVA").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total TVA", oldColumns, false)).help("Le montant de la TVA collectée sur les produits de la catégorie sur la période concernée.").class("z-oddcol"));
		//

		.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).visible(oldColumnVisible("Image", oldColumns, true)).exportable(false).help("The category image. This field cannot be exported."))
		.column(new TableCol().reference("cashRegister").label("Cash Register").visible(oldColumnVisible("Cash Register", oldColumns, false)).help("The cash register for which the sales are accounted. If the 'Detail by cash register' option is not checked, this field is empty."))
		.column(new TableCol().reference("label").label("Category").visible(oldColumnVisible("Category", oldColumns, true)).help("The name of the category."))
		.column(new TableCol().reference("reference").label("Reference").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(oldColumnVisible("Reference", oldColumns, false)).help("The reference of the category."))
		.column(new TableCol().reference("quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Quantity", oldColumns, true)).help("The quantity of products sold during the period.").class("z-oddcol"))
		.column(new TableCol().reference("priceSell").label("Total Sales excl. VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total Sales excl. VAT", oldColumns, false)).help("The total sales amount excluding VAT made by the products of the category during the concerned period.").class("z-oddcol"))
		.column(new TableCol().reference("priceBuy").label("Total Purchases excl. VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total Purchases excl. VAT", oldColumns, false)).help("The current purchase price excluding VAT. This amount has no history and does not necessarily correspond to the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("margin").label("Margin").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Margin", oldColumns, false)).help("The margin realized on product sales during the period. This margin is calculated based on the current purchase price, not the purchase price at the time of sale.").class("z-oddcol"))
		.column(new TableCol().reference("priceSellVat").label("Sales incl. VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Sales incl. VAT", oldColumns, false)).help("The total sales amount including VAT made by the products of the category during the concerned period.").class("z-oddcol"))
		.column(new TableCol().reference("taxTotal").label("Total VAT").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible("Total VAT", oldColumns, false)).help("The total VAT collected on products of the category during the concerned period.").class("z-oddcol"));

	if (separateByTaxes) {
		for (let i = 0; i < taxes.length; i++) {
			let tax = taxes[i];
			let col = new TableCol().reference("tax-" + i + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " base", oldColumns, false)).help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TVA", oldColumns, false)).help("Le montant de TVA collectée associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
			col = new TableCol().reference("tax-" + i + "-total").label(tax.label + " TTC").type(TABLECOL_TYPE.NUMBER5).footerType(TABLECOL_FOOTER.SUM).visible(oldColumnVisible(tax.label + " TTC", oldColumns, false)).help("Le montant de TTC associé au taux de TVA.");
			if (i % 2 != 0) {
				col.class("z-oddcol");
			}
			vue.screen.data.table.column(col);
		}
	}
	vue.screen.data.table.title("Sales by category from "
		+ tools_dateToString(vue.screen.data.start)
		+ " au "
		+ tools_dateToString(vue.screen.data.stop));
	lines.forEach(l => {
		vue.screen.data.table.line(l);
	});

	gui_hideLoading();
}

