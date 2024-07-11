
var _tickets_data = {};

function tickets_show() {
	let start = new Date();
	start.setHours(4);
	start.setMinutes(0);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "products", "taxes", "paymentmodes", "users", "customers"], function(data) {
			let cashRegisters = data["cashRegisters"];
			let crById = {};
			for (let i = 0; i < cashRegisters.length; i++) {
				let cr = cashRegisters[i];
				crById[cr.id] = cr;
			}
			let products = data["products"];
			let taxes = data["taxes"];
			let crId = null;
			if (cashRegisters.length > 0) {
				cr = cashRegisters[0].id;
			}
			let table = new Table().reference("ticket-list");
			table
				.column(new TableCol().reference("cashRegster").label("Caisse").visible(false).help("Le nom de la caisse."))
				.column(new TableCol().reference("sequence").label("Séquence").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de session de la caisse. Le numéro de séquence augmente à chaque clôture de caisse."))
				.column(new TableCol().reference("number").label("Numéro").type(TABLECOL_TYPE.NUMBER).visible(true).help("Le numéro du ticket de la caisse."))
				.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATETIME).visible(true).help("La date de réalisation de la vente."))
				.column(new TableCol().reference("customer").label("Client").visible(false).help("Le compte client associé au ticket."))
				.column(new TableCol().reference("finalPrice").label("Montant HT").type(TABLECOL_TYPE.NUMBER2).visible(true).help("Le montant HT du ticket après remise."))
				.column(new TableCol().reference("finalTaxedPrice").label("Montant TTC").type(TABLECOL_TYPE.NUMBER2).visible(true).help("Le montant TTC du ticket après remise."))
				.column(new TableCol().reference("discountRate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(false).help("La remise accordée sur la totalité du ticket (incluse dans les montant TTC, HT et de TVA)"))
				.column(new TableCol().reference("discountAmount").label("Montant de remise HT").type(TABLECOL_TYPE.NUMBER2).visible(false).help("La valeur HT de la remise accordée"))
				.column(new TableCol().reference("discountTaxedAmount").label("Montant de remise TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("La valeur TTC de la remise accordée"))
				.column(new TableCol().reference("paymentmodes").label("Encaissement").visible(true).help("Les modes de paiement utilisés à l'encaissement."))
				.column(new TableCol().reference("overPerceived").label("Trop perçu").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant trop perçu pour les modes de paiement sans rendu-monnaie."));
			data["paymentmodes"].forEach(pm => {
				table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).visible(false).class("z-oddcol").help("Le montant des encaissements réalisés avec ce moyen de paiement sur la session."));
			});
			data["taxes"].forEach(tax => {
				table.column(new TableCol().reference("tax-" + tax.id + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA."));
				table.column(new TableCol().reference("tax-" + tax.id + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant de TVA collectée associé au taux de TVA."));
			});
			table
				.column(new TableCol().reference("user").label("Opérateur").visible(false).help("Le nom du compte utilisateur qui a réalisé la vente."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).visible(true).exportable(false).help("Sélectionner le ticket. Ce champ n'est jamais exporté."));
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"cashRegisters": cashRegisters,
				"crById": crById,
				"products": products,
				"taxes": taxes,
				"paymentModes": data["paymentmodes"],
				"users": data["users"],
				"customers": data["customers"],
				"cashRegisterId": cr,
				"table": table
			};
			vue.screen.component = "vue-tickets-list";
		});
	});
}

function tickets_search() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	let crId = vue.screen.data.cashRegisterId;
	_tickets_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"crId": crId,
		"pages": 0,
		"currentPage": 0,
		"tickets": []
	};
	if (crId != "") {
		srvcall_get("api/ticket/search?count=1&cashRegister=" + encodeURIComponent(crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	} else {
		srvcall_get("api/ticket/search?count=1&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	}
	gui_showLoading();
}

function _tickets_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_tickets_data.pages = pages;
	gui_showProgress(0, pages);
	if (_tickets_data.crId != "") {
		srvcall_get("api/ticket/search?limit=100&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	} else {
		srvcall_get("api/ticket/search?limit=100&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	}
}

function _tickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = tickets.length - 1; i >= 0; i--) {
		_tickets_data.tickets.push(tickets[i]);
	}
	_tickets_data.currentPage++;
	if (_tickets_data.currentPage < _tickets_data.pages) {
		gui_showProgress(_tickets_data.currentPage, _tickets_data.pages);
		if (_tickets_data.crId != "") {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		} else {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		}
	} else {
		_tickets_dataRetreived();
	}
}

function _tickets_dataRetreived() {
	gui_hideLoading();
	vue.screen.data.tickets = _tickets_data.tickets;
	let total = {
		"tickets": 0,
		"cs": 0.0,
		"csTaxes": 0.0,
		"custBalance": 0.0,
		"discountAmount": 0.0,
		"discountTaxedAmount": 0.0,
		"paymentMode": {},
		"tax": {},
		"overPerceived": 0.0,
	};
	vue.screen.data.paymentModes.forEach(pm => {
		total.paymentMode[pm.id] = 0.0;
	});
	vue.screen.data.taxes.forEach(tax => {
		total.tax[tax.id] = {"base": 0.0, "amount": 0.0};
	});
	let lines = [];
	for (let i = 0; i < _tickets_data.tickets.length; i++) {
		let tkt = _tickets_data.tickets[i];
		let cr = "Inconnue";
		if (tkt.cashRegister in vue.screen.data.crById) {
			cr = vue.screen.data.crById[tkt.cashRegister].label;
		}
		let date = new Date(tkt.date * 1000);
		let customer = "";
		if (tkt.customer != null) {
			for (let j = 0; j < vue.screen.data.customers.length; j++) {
				if (vue.screen.data.customers[j].id == tkt.customer) {
					customer = vue.screen.data.customers[j].dispName;
					break;
				}
			}
		}
		let pmTotal = 0.0;
		let pmModes = [];
		let taxes = [];
		let actualPrice = 0.0; // total of tax bases, to compute the discount amount until it is stored in the ticket
		vue.screen.data.paymentModes.forEach(pm => {
			pmModes.push({id: pm.id, amount: 0.0, label: pm.label});
		});
		vue.screen.data.taxes.forEach(tax => {
			taxes.push({id: tax.id, base: 0.0, amount: 0.0});
		});
		tkt.payments.forEach(payment => {
			pmTotal += payment.amount;
			total.paymentMode[payment.paymentMode] += payment.amount;
			let pm = pmModes.find((p) => p.id == payment.paymentMode);
			pm.amount += payment.amount;
		});
		tkt.taxes.forEach(tktTax => {
			let tax = taxes.find((t) => t.id == tktTax.tax);
			tax.base += tktTax.base;
			tax.amount += tktTax.amount;
			actualPrice += tax.base;
		});
		// Compute missing data from the raw ticket
		/* Assume B2C mode is used (taxedPrice is set, price is not reliable). */
		let overPerceived = pmTotal - tkt.finalTaxedPrice;
		let discountAmount = actualPrice / (1.0 - tkt.discountRate) - actualPrice;
		discountAmount = Number.parseFloat(discountAmount.toFixed(2));
		let discountTaxedAmount = tkt.taxedPrice - tkt.finalTaxedPrice;
		// Add to totals
		total.tickets++;
		total.cs += tkt.finalPrice;
		total.csTaxes += tkt.finalTaxedPrice;
		total.custBalance += tkt.custBalance;
		total.overPerceived += overPerceived;
		total.discountAmount += discountAmount;
		total.discountTaxedAmount += discountTaxedAmount;
		taxes.forEach(tax => {
			total.tax[tax.id].base += tax.base;
			total.tax[tax.id].amount += tax.amount;
		});
		// List payment modes
		let pmModesStr = "";
		pmModes.forEach(pm => {
			if (pm.amount == 0.0) {
				return;
			}
			pmModesStr += ", " + pm.label;
		});
		pmModesStr = pmModesStr.substring(2);
		// Retreive username
		let user = "";
		for (let j = 0; j < vue.screen.data.users.length; j++) {
			if (vue.screen.data.users[j].id == tkt.user) {
				user = vue.screen.data.users[j].name;
				break;
			}
		}
		// Fill the table
		line = [cr, tkt.sequence, tkt.number, date, customer, tkt.finalPrice, tkt.finalTaxedPrice, tkt.discountRate, discountAmount, discountTaxedAmount, pmModesStr, overPerceived];
		pmModes.forEach(pm => {
			line.push(pm.amount);
		});
		taxes.forEach(tax => {
			line.push(tax.base);
			line.push(tax.amount);
		});
		line.push(user);
		line.push("<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:_tickets_selectTicket(vue.screen.data.tickets[" + i + "]);\">Afficher</a></div>");
		lines.push(line);
	}
	let footer = ["", "", "", "", "Total", total.cs.toLocaleString(), total.csTaxes.toLocaleString(), "", total.discountAmount.toLocaleString(), total.discountTaxedAmount.toLocaleString(), "", total.overPerceived.toLocaleString()];
	vue.screen.data.paymentModes.forEach(pm => {
		footer.push(total.paymentMode[pm.id].toLocaleString());
	});
	vue.screen.data.taxes.forEach(tax => {
		footer.push(Number.parseFloat(total.tax[tax.id].base.toFixed(2)).toLocaleString());
		footer.push(Number.parseFloat(total.tax[tax.id].amount.toFixed(2)).toLocaleString());
	});
	footer.push("");
	footer.push("");
	vue.screen.data.table.resetContent(lines, footer);
	_tickets_selectTicket(null);
}

_tickets_selectTicket = function(ticket) {
	if (ticket == null) {
		Vue.set(vue.screen.data, "selectedTicket", null);
		return;
	}
	let cr = "";
	for (let i = 0; i < vue.screen.data.cashRegisters.length; i++) {
		let cashRegister = vue.screen.data.cashRegisters[i];
		if (cashRegister.id == ticket.cashRegister) {
			cr = cashRegister.label;
			break;
		}
	}
	let user = "";
	for (let i = 0; i < vue.screen.data.users.length; i++) {
		if (vue.screen.data.users[i].id == ticket.user) {
			user = vue.screen.data.users[i].name;
			break;
		}
	}
	let customer = null;
	if (ticket.customer != null) {
		for (let i = 0; i < vue.screen.data.customers.length; i++) {
			if (vue.screen.data.customers[i].id == ticket.customer) {
				customer = vue.screen.data.customers[i].dispName;
				break;
			}
		}
	}
	let tkt = {
		cashRegister: cr,
		number: ticket.number,
		date: tools_dateTimeToString(new Date(ticket.date * 1000)),
		user: user,
		customer: customer,
		lines: [],
		payments: [],
		taxes: [],
		discountRate: (ticket.discountRate == 0.0) ? null : ((ticket.discountRate*100).toLocaleString() + "%"),
		discountAmount: (ticket.finalTaxedPrice - ticket.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
		taxedPrice: ticket.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
		finalPrice: ticket.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
		finalTaxedPrice: ticket.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
		taxSum: (ticket.finalTaxedPrice - ticket.finalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
	}
	for (let i = 0; i < ticket.lines.length; i++) {
		let tktline = ticket.lines[i];
		let line = {};
		line.label = tktline.productLabel;
		line.price = tktline.taxedUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
		line.quantity = tktline.quantity.toLocaleString();
		line.discountRate = (tktline.discountRate == 0.0) ? null : ((tktline.discountRate*100).toLocaleString() + "%"),
		line.discountAmount = (tktline.finalTaxedPrice - tktline.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
		line.taxedPrice = tktline.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
		line.finalTaxedPrice = tktline.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
		tkt.lines.push(line);
	}
	for (let i = 0; i < ticket.taxes.length; i++) {
		let tkttax = ticket.taxes[i];
		let taxLabel = ""
		for (let j = 0; j < vue.screen.data.taxes.length; j++) {
			if (vue.screen.data.taxes[j].id == tkttax.tax) {
				taxLabel = vue.screen.data.taxes[j].label;
				break;
			}
		}
		let tax = {};
		tax.label = taxLabel;
		tax.base = tkttax.base.toLocaleString(undefined, { minimumFractionDigits: 2 });
		tax.amount = tkttax.amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
		tkt.taxes.push(tax);
	}
	for (let i = 0; i < ticket.payments.length; i++) {
		let tktpm = ticket.payments[i];
		let pmLabel = "";
		for (let j = 0; j < vue.screen.data.paymentModes.length; j++) {
			if (vue.screen.data.paymentModes[j].id == tktpm.paymentMode) {
				if (tktpm.amount >= 0) {
					pmLabel = vue.screen.data.paymentModes[j].label;
				} else {
					pmLabel = vue.screen.data.paymentModes[j].backLabel;
				}
				break;
			}
		}
		let pm = {};
		pm.label = pmLabel;
		pm.amount = tktpm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
		tkt.payments.push(pm);
	}
	Vue.set(vue.screen.data, "selectedTicket", tkt);
}
