
var _salesdetails_data = {};

function salesdetails_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "products", "categories"], function(data) {
			let catById = {};
			let prdById = {};
			let crById = {};
			for (let i = 0; i < data["cashRegisters"].length; i++) {
				let cr = data["cashRegisters"][i];
				crById[cr.id] = cr
			}
			for (let i = 0; i < data["products"].length; i++) {
				let prd = data["products"][i];
				prdById[prd.id] = prd;
			}
			for (let i = 0; i < data["categories"].length; i++) {
				let cat = data["categories"][i];
				catById[cat.id] = cat;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"crById": crById,
				"prdById": prdById,
				"catById": catById,
				"table": {
					"reference": "salesDetail-list",
					"title": null,
					"columns": [
						{reference: "cashRegister", label: "Caisse", visible: false, help: "Le nom de la caisse."},
						{reference: "number", label: "Ticket", export_as_number: true, visible: false, help: "Le numéro du ticket de la caisse."},
						{reference: "date", label: "Date", visible: false, help: "La date de réalisation de la vente."},
						{reference: "line", label: "Ligne", export_as_number: true, visible: false, help: "Le numéro de ligne du ticket."},
						{reference: "articleLine", label: "Ligne-article", export_as_number: true, visible: false, help: "Le numéro de l'article du ticket. Diffère de la ligne uniquement pour les compositions. Le contenu de la composition partage le même numéro de ligne-article avec la composition elle-même."},
						{reference: "category", label: "Catégorie", visible: true, help: "La catégorie à laquelle le produit est rattaché, si disponible."},
						{reference: "reference", label: "Référence", visible: true, help: "La référence du produit, si disponible."},
						{reference: "label", label: "Désignation", visible: true, help: "La désignation du produit telle qu'imprimée sur le ticket au moment de la vente."},
						{reference: "tax", label: "TVA", visible: true, help: "Le taux de TVA appliqué."},
						{reference: "priceBuy", label: "Prix d'achat HT", export_as_number: true, visible: false, help: "Le prix d'achat actuel du produit si disponible. Ce montant n'est pas historisé et ne correspond pas forcément au prix d'achat au moment de la vente."},
						{reference: "unitPriceSell", label: "Prix unitaire HT", export_as_number: true, visible: false, help: "Le prix de vente unitaire hors taxes."},
						{reference: "unitPriceSellVat", label: "Prix unitaire TTC", export_as_number: true, visible: false, help: "Le prix de vente unitaire TTC."},
						{reference: "quantity", label: "Quantité", export_as_number: true, visible: true, help: "La quantité vendue."},
						{reference: "priceSell", label: "Sous-total HT", export_as_number: true, visible: false, help: "Le montant hors taxes de la ligne avant application des réductions."},
						{reference: "priceSellVat", label: "Sous-total TTC", export_as_number: true, visible: false, help: "Le montant TTC de la ligne avant application des réductions."},
						{reference: "discountRate", label: "Remise", export_as_number: true, visible: true, help: "Le taux de réduction appliqué à la ligne."},
						{reference: "finalPrice", label: "Total HT", export_as_number: true, visible: true, help: "Le montant hors taxes de la ligne après réduction."},
						{reference: "finalTaxedPrice", label: "Total TTC", export_as_number: true, visible: true, help: "Le montant TTC de la ligne après réductions."},
						{reference: "margin", label: "Marge HT", export_as_number: true, visible: false, help: "La marge indicative de la ligne. La marge est calculée à partir du prix d'achat actuel qui peut être différent de celui lors de la vente du produit."},
					],
				},
			}
			vue.screen.component = "vue-salesdetails";
		});
	});

}

function salesdetails_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	_salesdetails_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"tickets": []};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_countCallback);
	gui_showLoading();
}

function _salesdetails_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesdetails_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesdetails_data.pages = pages;
	gui_showProgress(0, pages);
	srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_filterCallback);
}

function _salesdetails_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesdetails_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		_salesdetails_data.tickets.push(tickets[i]);
	}
	_salesdetails_data.currentPage++;
	if (_salesdetails_data.currentPage < _salesdetails_data.pages) {
		gui_showProgress(_salesdetails_data.currentPage, _salesdetails_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesdetails_data.currentPage) + "&dateStart=" + _salesdetails_data.start + "&dateStop=" + _salesdetails_data.stop, _salesdetails_filterCallback);
	} else {
		_salesdetails_dataRetreived();
	}
}

function _salesdetails_dataRetreived() {
	gui_showLoading();
	_salesdetails_render(_salesdetails_data.tickets);
}

function _salesdetails_render(tickets) {
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		let inCompo = false;
		let articleLine = 0;
		for (let j = 0; j < ticket.lines.length; j++) {
			let tktLine = ticket.lines[j];
			let date = new Date(ticket.date * 1000);
			let category = "";
			let reference = "";
			let taxedRef = tktLine.finalTaxedPrice != null;
			let unitPrice = tktLine.unitPrice;
			let taxedUnitPrice = tktLine.taxedUnitPrice;
			let priceBuy = "";
			let price = tktLine.price;
			let taxedPrice = tktLine.taxedPrice;
			let finalPrice = tktLine.finalPrice;
			let finalTaxedPrice = tktLine.finalTaxedPrice;
			let margin = "";
			let line = tktLine.dispOrder + 1;
			if (inCompo && (tktLine.price == 0.0 || tktLine.taxedPrice == 0.0)) {
				// Keep article line to match the composition line
			} else {
				articleLine++;
				inCompo = false;
			}
			if (tktLine.product != null) {
				let prd = vue.screen.data.prdById[tktLine.product];
				category = vue.screen.data.catById[prd.category].label;
				reference = prd.reference;
				priceBuy = prd.priceBuy.toLocaleString();
				if (prd.composition) {
					inCompo = true;
				}
			}
			if (taxedRef) {
				unitPrice = taxedUnitPrice / (1.0 + tktLine.taxRate);
				price = taxedPrice / (1.0 + tktLine.taxRate);
				finalPrice = finalTaxedPrice / (1.0 + tktLine.taxRate);
			} else {
				taxedUnitPrice = unitPrice * (1.0 + tktLine.taxRate);
				taxedPrice = price * (1.0 + tktLine.taxRate);
				finalTaxedPrice = finalPrice * (1.0 + tktLine.taxRate);
			}
			if (priceBuy != "") {
				let prd = vue.screen.data.prdById[tktLine.product];
				margin = (finalPrice - (tktLine.quantity * prd.priceBuy)).toLocaleString();
			}
			lines.push([vue.screen.data.crById[ticket.cashRegister].label,
				ticket.number,
				tools_dateTimeToString(date),
				line,
				articleLine,
				category,
				reference,
				tktLine.productLabel,
				(tktLine.taxRate * 100).toLocaleString(),
				priceBuy,
				unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }),
				taxedUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				tktLine.quantity.toLocaleString(),
				price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }),
				taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				(tktLine.discountRate * 100).toLocaleString(),
				finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 5 }),
				finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 } ),
				margin]);
		}
	}
	vue.screen.data.table.title = "Détail des ventes du "
			+ tools_dateToString(vue.screen.data.start)
			+ " au "
			+ tools_dateToString(vue.screen.data.stop);
	Vue.set(vue.screen.data.table, "lines", lines);
	gui_hideLoading();
}
