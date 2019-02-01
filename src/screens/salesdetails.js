
var _salesdetails_data = {};

function salesdetails_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	start = tools_dateToString(start);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	stop = tools_dateToString(stop);
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"table": {
			"title": null,
			"columns": [
				{label: "Caisse", visible: false},
				{label: "Ticket", visible: false},
				{label: "Date", visible: false},
				{label: "Désignation", visible: true},
				{label: "TVA", visible: true},
				{label: "Prix unitaire HT", visible: false},
				{label: "Prix unitaire TTC", visible: false},
				{label: "Quantité", visible: true},
				{label: "Sous-total HT", visible: false},
				{label: "Sous-total TTC", visible: false},
				{label: "Remise", visible: true},
				{label: "Total HT", visible: true},
				{label: "Total TTC", visible: true}
			],
		},
	}
	vue.screen.component = "vue-salesdetails";
}

function salesdetails_filter() {
	let start = vue.screen.data.start.split("/");
	if (start.length != 3) {
		start = new Date(new Date().getTime() - 604800000);
	} else {
		start = new Date(start[2], start[1] - 1, start[0]);
	}
	let stop = vue.screen.data.stop.split("/");
	if (stop.length != 3) {
		stop = new Date(new Date().getTime() + 86400000);
	} else {
		stop = new Date(stop[2], stop[1] - 1	, stop[0]);
	}
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
	let stores = appData.db.transaction(["cashRegisters", "taxes"], "readonly");
	let cashRegisters = [];
	stores.objectStore("cashRegisters").openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			cashRegisters.push(cursor.value);
			cursor.continue();
		} else {
			_salesdetails_render(cashRegisters, _salesdetails_data.tickets);
		}
	}
}

function _salesdetails_render(cashRegisters, tickets) {
	let crById = [];
	let prdById = [];
	for (let i = 0; i < cashRegisters.length; i++) {
		crById[cashRegisters[i].id] = cashRegisters[i];
	}
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let tktLine = ticket.lines[j];
			let date = new Date(ticket.date * 1000);
			let taxedRef = tktLine.finalTaxedPrice != null;
			let unitPrice = tktLine.unitPrice;
			let taxedUnitPrice = tktLine.taxedUnitPrice;
			let price = tktLine.price;
			let taxedPrice = tktLine.taxedPrice;
			let finalPrice = tktLine.finalPrice;
			let finalTaxedPrice = tktLine.finalTaxedPrice;
			if (taxedRef) {
				unitPrice = taxedUnitPrice / (1.0 + tktLine.taxRate);
				price = taxedPrice / (1.0 + tktLine.taxRate);
				finalPrice = finalTaxedPrice / (1.0 + tktLine.taxRate);
			} else {
				taxedUnitPrice = unitPrice * (1.0 + tktLine.taxRate);
				taxedPrice = price * (1.0 + tktLine.taxRate);
				finalTaxedPrice = finalPrice * (1.0 + tktLine.taxRate);
			}
			lines.push([crById[ticket.cashRegister].label,
				ticket.number,
				tools_dateTimeToString(date),
				tktLine.productLabel,
				(tktLine.taxRate * 100).toLocaleString(),
				(taxedRef) ? "~" + unitPrice.toLocaleString() : unitPrice.toLocaleString(),
				(taxedRef) ? taxedUnitPrice.toLocaleString() : "~" + taxedUnitPrice.toLocaleString(),
				tktLine.quantity.toLocaleString(),
				(taxedRef) ? "~" + price.toLocaleString() : price.toLocaleString(),
				(taxedRef) ? taxedPrice.toLocaleString() : "~" + taxedPrice.toLocaleString(),
				(tktLine.discountRate * 100).toLocaleString(),
				(taxedRef) ? "~" + finalPrice.toLocaleString() : finalPrice.toLocaleString(),
				(taxedRef) ? finalTaxedPrice.toLocaleString() : "~" + finalTaxedPrice.toLocaleString()]);
		}
	}
	vue.screen.data.table.title = "Détail des ventes du "
			+ vue.screen.data.start
			+ " au "
			+ vue.screen.data.stop;
	Vue.set(vue.screen.data.table, "lines", lines);
	gui_hideLoading();
}
