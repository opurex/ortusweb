
var _tickets_data = {};

function tickets_show() {
	let start = new Date();
	start.setHours(4);
	start.setMinutes(0);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "products", "taxes", "paymentmodes", "users"], function(data) {
			let cashRegisters = data["cashRegisters"];
			let products = data["products"];
			let taxes = data["taxes"];	
			let crId = null;
			if (cashRegisters.length > 0) {
				cr = cashRegisters[0].id;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"cashRegisters": cashRegisters,
				"products": products,
				"taxes": taxes,
				"paymentModes": data["paymentmodes"],
				"users": data["users"],
				"cashRegisterId": cr,
				"table": {
					"title": null,
					"columns": [
						{label: "Caisse", visible: false, help: "Le nom de la caisse."},
						{label: "Séquence", visible: false, help: "Le numéro de session de la caisse. Le numéro de séquence augmente à chaque clôture de caisse."},
						{label: "Numéro", visible: true, help: "Le numéro du ticket de la caisse."},
						{label: "Date", visible: true, help: "La date de réalisation de la vente."},
						{label: "Encaissement", visible: true, help: "Les modes de paiement utilisés à l'encaissement."},
						{label: "Montant", visible: true, help: "Le montant TTC du ticket."},
						{label: "Opérateur", visible: false, help: "Le nom du compte utilisateur qui a réalisé la vente."},
						{label: "Opération", visible: true, export: false, help: "Sélectionner le ticket. Ce champ n'est jamais exporté."},
					],
				},
			}
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
		if (_ticket_data.crId != "") {
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
	let lines = [];
	let cr = "";
	for (let i = 0; i < vue.screen.data.cashRegisters.length; i++) {
		let cashRegister = vue.screen.data.cashRegisters[i];
		if (vue.screen.data.cashRegisterId == cashRegister.id) {
			cr = cashRegister.label;
			break;
		}
	}
	for (let i = 0; i < _tickets_data.tickets.length; i++) {
		let tkt = _tickets_data.tickets[i];
		let date = new Date(tkt.date * 1000);
		let pmModes = {};
		for (let j = 0; j < tkt.payments.length; j++) {
			let payment = tkt.payments[j];
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
		let user = "";
		for (let j = 0; j < vue.screen.data.users.length; j++) {
			if (vue.screen.data.users[j].id == tkt.user) {
				user = vue.screen.data.users[j].name;
				break;
			}
		}
		lines.push([cr, tkt.sequence, tkt.number, tools_dateTimeToString(date), pmModesStr,
			tkt.finalTaxedPrice.toLocaleString(), user,
			{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:_tickets_selectTicket(vue.screen.data.tickets[" + i + "]);\">Sélectionner</a></div>"}]);
	}
	Vue.set(vue.screen.data.table, "lines", lines);
	if (vue.screen.data.tickets.length > 0) {
		_tickets_selectTicket(vue.screen.data.tickets[0]);
	} else {
		_tickets_selectTicket(null);
	}
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
	let tkt = {
		cashRegister: cr,
		number: ticket.number,
		date: tools_dateTimeToString(new Date(ticket.date * 1000)),
		user: user,
		lines: [],
		payments: [],
		taxes: [],
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
		pm.amount = Math.abs(tktpm.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
		tkt.payments.push(pm);
	}
	Vue.set(vue.screen.data, "selectedTicket", tkt);
}
