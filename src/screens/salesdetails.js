
var _salesdetails_data = {};

function salesdetails_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "products", "categories", "paymentmodes", "customers"], function(data) {
			let catById = {};
			let prdById = {};
			let crById = {};
			let custById = {};
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
			for (let i = 0; i < data["customers"].length; i++) {
				let cust = data["customers"][i];
				custById[cust.id] = cust;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"crById": crById,
				"prdById": prdById,
				"catById": catById,
				"custById": custById,
				"paymentModes": data["paymentmodes"],
				"table": new Table().reference("salesDetail-list")

					// .column(new TableCol().reference("cashRegister").label("Caisse").visible(false).help("Le nom de la caisse."))
					// .column(new TableCol().reference("paymentmodes").label("Encaissement").visible(true).help("Les modes de paiement utilisés à l'encaissement."))
					// .column(new TableCol().reference("number").label("Ticket").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro du ticket de la caisse."))
					// .column(new TableCol().reference("date").type(TABLECOL_TYPE.DATETIME).label("Date").visible(false).help("La date de réalisation de la vente."))
					// .column(new TableCol().reference("semaine").label("Semaine").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numero de la semaine dans l'année."))
					// .column(new TableCol().reference("mois").label("Mois").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro du mois."))
					// .column(new TableCol().reference("customer").label("Client").visible(false).help("Le compte client associé."))
					// .column(new TableCol().reference("line").label("Ligne").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de ligne du ticket."))
					// .column(new TableCol().reference("articleLine").label("Ligne-article").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de l'article du ticket. Diffère de la ligne uniquement pour les compositions. Le contenu de la composition partage le même numéro de ligne-article avec la composition elle-même."))
					// .column(new TableCol().reference("category").label("Catégorie").visible(true).searchable(true).help("La catégorie à laquelle le produit est rattaché, si disponible."))
					// .column(new TableCol().reference("reference").label("Référence").visible(true).searchable(true).help("La référence du produit, si disponible."))
					// .column(new TableCol().reference("label").label("Désignation").visible(true).searchable(true).help("La désignation du produit telle qu'imprimée sur le ticket au moment de la vente."))
					// .column(new TableCol().reference("tax").label("TVA").type(TABLECOL_TYPE.PERCENT).visible(true).help("Le taux de TVA appliqué."))
					// .column(new TableCol().reference("priceBuy").label("Prix d'achat HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le prix d'achat actuel du produit si disponible. Ce montant n'est pas historisé et ne correspond pas forcément au prix d'achat au moment de la vente."))
					// .column(new TableCol().reference("unitPriceSell").label("Prix unitaire HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le prix de vente unitaire hors taxes."))
					// .column(new TableCol().reference("unitPriceSellVat").label("Prix unitaire TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le prix de vente unitaire TTC."))
					// .column(new TableCol().reference("quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).visible(true).help("La quantité vendue."))
					// .column(new TableCol().reference("priceSell").label("Sous-total HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le montant hors taxes de la ligne avant application des réductions."))
					// .column(new TableCol().reference("priceSellVat").label("Sous-total TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant TTC de la ligne avant application des réductions."))
					// .column(new TableCol().reference("discountRate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(true).help("Le taux de réduction appliqué à la ligne."))
					// .column(new TableCol().reference("finalPrice").label("Total HT").type(TABLECOL_TYPE.NUMBER5).visible(true).help("Le montant hors taxes de la ligne après réduction."))
					// .column(new TableCol().reference("finalTaxedPrice").label("Total TTC").type(TABLECOL_TYPE.NUMBER2).visible(true).help("Le montant TTC de la ligne après réductions."))
					// .column(new TableCol().reference("margin").label("Marge HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("La marge indicative de la ligne. La marge est calculée à partir du prix d'achat actuel qui peut être différent de celui lors de la vente du produit."))
					//


					.column(new TableCol().reference("cashRegister").label("Cash Register").visible(false).help("The name of the cash register."))
					.column(new TableCol().reference("paymentmodes").label("Payment Methods").visible(true).help("The payment methods used at checkout."))
					.column(new TableCol().reference("number").label("Ticket").type(TABLECOL_TYPE.NUMBER).visible(false).help("The cash register ticket number."))
					.column(new TableCol().reference("date").type(TABLECOL_TYPE.DATETIME).label("Date").visible(false).help("The date when the sale was made."))
					.column(new TableCol().reference("semaine").label("Week").type(TABLECOL_TYPE.NUMBER).visible(false).help("The week number in the year."))
					.column(new TableCol().reference("mois").label("Month").type(TABLECOL_TYPE.NUMBER).visible(false).help("The month number."))
					.column(new TableCol().reference("customer").label("Customer").visible(false).help("The associated customer account."))
					.column(new TableCol().reference("line").label("Line").type(TABLECOL_TYPE.NUMBER).visible(false).help("The ticket line number."))
					.column(new TableCol().reference("articleLine").label("Article Line").type(TABLECOL_TYPE.NUMBER).visible(false).help("The article number on the ticket. Differs from line number only for product bundles. The contents of a bundle share the same article line number as the bundle itself."))
					.column(new TableCol().reference("category").label("Category").visible(true).searchable(true).help("The category to which the product belongs, if available."))
					.column(new TableCol().reference("reference").label("Reference").visible(true).searchable(true).help("The product reference, if available."))
					.column(new TableCol().reference("label").label("Designation").visible(true).searchable(true).help("The product designation as printed on the ticket at the time of sale."))
					.column(new TableCol().reference("tax").label("VAT").type(TABLECOL_TYPE.PERCENT).visible(true).help("The applied VAT rate."))
					.column(new TableCol().reference("priceBuy").label("Purchase Price excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The current purchase price of the product if available. This amount is not historicized and may not correspond to the purchase price at the time of sale."))
					.column(new TableCol().reference("unitPriceSell").label("Unit Price excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The unit selling price excluding taxes."))
					.column(new TableCol().reference("unitPriceSellVat").label("Unit Price incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The unit selling price including taxes."))
					.column(new TableCol().reference("quantity").label("Quantity").type(TABLECOL_TYPE.NUMBER).visible(true).help("The quantity sold."))
					.column(new TableCol().reference("priceSell").label("Subtotal excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The line amount excluding taxes before applying discounts."))
					.column(new TableCol().reference("priceSellVat").label("Subtotal incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The line amount including taxes before applying discounts."))
					.column(new TableCol().reference("discountRate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(true).help("The discount rate applied to the line."))
					.column(new TableCol().reference("finalPrice").label("Total excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(true).help("The line amount excluding taxes after discount."))
					.column(new TableCol().reference("finalTaxedPrice").label("Total incl. tax").type(TABLECOL_TYPE.NUMBER2).visible(true).help("The line amount including taxes after discounts."))
					.column(new TableCol().reference("margin").label("Margin excl. tax").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The indicative margin for the line. Margin is calculated from the current purchase price, which may differ from that at the time of product sale."))



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

		let pmModes = {};
		for (let j = 0; j < ticket.payments.length; j++) {
			let payment = ticket.payments[j];
			if (!(payment.paymentMode in pmModes)) {
				pmModes[payment.paymentMode] = true;
			}
		}
		let pmModesStr = "";
		for (pm in pmModes) {
			for (let j = 0; j < vue.screen.data.paymentModes.length; j++) {
				pmMode = vue.screen.data.paymentModes[j]
				if (pm == pmMode.id) {
					pmModesStr += ", " + pmMode.label;
				}
			}
		}
		pmModesStr = pmModesStr.substring(2);
		let customer = "";
		if (ticket.customer != null) {
			customer = vue.screen.data.custById[ticket.customer].dispName;
		}
		for (let j = 0; j < ticket.lines.length; j++) {
			let tktLine = ticket.lines[j];
			let method = pmModesStr
			let date = new Date(ticket.date * 1000);
			let week = date.getWeek()
			let month = date.getMonth() + 1;
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
				priceBuy = prd.priceBuy;
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
				margin = finalPrice - (tktLine.quantity * prd.priceBuy);
			}
			lines.push([vue.screen.data.crById[ticket.cashRegister].label,
				method,
				ticket.number,
				date,
				week,
				month,
				customer,
				line,
				articleLine,
				category,
				reference,
				tktLine.productLabel,
				tktLine.taxRate,
				priceBuy,
				unitPrice,
				taxedUnitPrice,
				tktLine.quantity,
				price,
				taxedPrice,
				tktLine.discountRate,
				finalPrice,
				finalTaxedPrice,
				margin]);
		}
	}
	vue.screen.data.table.title("Sales details from "
		+ tools_dateToString(vue.screen.data.start)
		+ " to "
		+ tools_dateToString(vue.screen.data.stop));
	vue.screen.data.table.resetContent(lines);
	gui_hideLoading();

}
