function ztickets_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	start = tools_dateToString(start);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	stop = tools_dateToString(stop);
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"table": {columns: []}
	}
	vue.screen.component = "vue-zticket-list";
}

function ztickets_filter() {
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
	start = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
	//stop = stop.getFullYear() + "-" + (stop.getMonth() + 1) + "-" + stop.getDate();
	srvcall_get("api/cash/search/?dateStart=" + start + "&dateStop=" + (stop.getTime() / 1000), _ztickets_filterCallback);
	gui_showLoading();
}

function _ztickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, ztickets_filter)) {
		return;
	}
	let zTickets = JSON.parse(response);
	let stores = appData.db.transaction(["cashRegisters", "taxes", "categories", "paymentmodes"], "readonly");
	let cashRegisters = [];
	let taxes = [];
	let categories = [];
	let paymentModes = [];
	stores.objectStore("paymentmodes").openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			paymentModes.push(cursor.value);
			cursor.continue();
		} else {
			stores.objectStore("taxes").openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					taxes.push(cursor.value);
					cursor.continue();
				} else {
					stores.objectStore("categories").openCursor().onsuccess = function(event) {
						let cursor = event.target.result;
						if (cursor) {
							categories.push(cursor.value);
							cursor.continue();
						} else {
							stores.objectStore("cashRegisters").openCursor().onsuccess = function(event) {
								let cursor = event.target.result;
								if (cursor) {
									cashRegisters.push(cursor.value);
									cursor.continue();
								} else {
									_parseZTickets(cashRegisters, paymentModes, taxes, categories, zTickets);
								}
							}
						}
					}
				}
			}
		}
	}
}

function _parseZTickets(cashRegisters, paymentModes, taxes, categories, zTickets) {
	// Collect the listed taxes, payment modes and cat taxes
	let catTaxes = [];
	let total = {
		"tickets": 0,
		"cs": 0.0,
		"errorTotal": 0.0,
		"paymentModeTotal": [],
		"taxTotal": [],
		"categoryTotal": [],
		"catTaxTotal": []
	};
	for (let i = 0; i < categories.length; i++) {
		total.categoryTotal.push(0.0);
	}
	for (let i = 0; i < paymentModes.length; i++) {
		total.paymentModeTotal.push(0.0);
	}
	for (let i = 0; i < taxes.length; i++) {
		total.taxTotal.push({"base": 0.0, "amount": 0.0});
	}
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j < taxes.length; j++) {
			catTaxes.push(JSON.parse(JSON.stringify(taxes[j])));
			catTaxes[i * taxes.length + j]["cat"] = categories[i]["label"];
			total.catTaxTotal.push({"base": 0.0, "amount": 0.0});
		}
	}
	let cashRegistersById = [];
	for (let i = 0; i < cashRegisters.length; i++) {
		let cr = cashRegisters[i];
		cashRegistersById[cr.id] = cr;
	}
	let renderZs = [];
	let keptPayments = [];
	let keptTaxes = [];
	let keptCategories = [];
	let keptCatTaxes = [];
	for (let i = 0; i < paymentModes.length; i++) {
		keptPayments[i] = false;
	}
	for (let i = 0; i < taxes.length; i++) {
		keptTaxes[i] = false;
	}
	for (let i = 0; i < categories.length; i++) {
		keptCategories[i] = false;
	}
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j < taxes.length; j++) {
			keptCatTaxes[i * taxes.length + j] = false;
		}
	}
	// Build the full data
	for (let i = 0; i < zTickets.length; i++) {
		let z = zTickets[i];
		let openDate = new Date(z.openDate * 1000);
		let closeDate = new Date(z.closeDate * 1000);
		let cashRegister = "";
		if (z.cashRegister in cashRegistersById) {
			cashRegister = cashRegistersById[z.cashRegister].label;
		}
		let closeError = 0.0;
		if (z.closeCash != null && z.expectedCash != null) {
			closeError = z.closeCash - z.expectedCash;
		}
		let renderZ = {
			"cashRegister": cashRegister,
			"sequence": z.sequence,
			"openDate": tools_dateTimeToString(openDate),
			"closeDate": tools_dateTimeToString(closeDate),
			"openCash": (z.openCash != null) ? z.openCash.toLocaleString() : "",
			"closeCash": (z.closeCash != null) ? z.closeCash.toLocaleString() : "",
			"expectedCash": (z.expectedCash != null) ? z.expectedCash.toLocaleString() : "",
			"closeError": closeError > 0 ? "+" + closeError.toLocaleString() : closeError.toLocaleString(),
			"ticketCount": z.ticketCount,
			"cs": z.cs.toLocaleString(),
			"csPeriod": z.csPeriod.toLocaleString(),
			"csFYear": z.csFYear.toLocaleString(),
			"payments": [],
			"taxes": [],
			"categories": [],
			"catTaxes": [],
		}
		total.tickets += z.ticketCount;
		total.cs += z.cs;
		total.errorTotal += closeError;
		for (let j = 0; j < paymentModes.length; j++) {
			let pm = paymentModes[j];
			let found = false;
			for (let k = 0; k < z.payments.length; k++) {
				if (z.payments[k].paymentMode == pm.id) {
					renderZ.payments.push({"amount": z.payments[k].currencyAmount.toLocaleString()});
					total.paymentModeTotal[j] += z.payments[k].currencyAmount;
					found = true;
					keptPayments[j] = true;
					break;
				}
			}
			if (!found) {
				renderZ.payments.push({"amount": ""});
			}
		}
		for (let j = 0; j < taxes.length; j++) {
			let tax = taxes[j];
			let found = false;
			for (let k = 0; k < z.taxes.length; k++) {
				if (z.taxes[k].tax == tax.id) {
					renderZ.taxes.push({"base": z.taxes[k].base.toLocaleString(),
						"amount": z.taxes[k].amount.toLocaleString()});
					total.taxTotal[j].base += z.taxes[k].base;
					total.taxTotal[j].amount += z.taxes[k].amount;
					found = true;
					keptTaxes[j] = true;
					break;
				}
			}
			if (!found) {
				renderZ.taxes.push({"base": "", "amount": ""});
			}
		}
		for (let j = 0; j < categories.length; j++) {
			let cat = categories[j];
			let found = false;
			for (let k = 0; k < z.catSales.length; k++) {
				if (z.catSales[k].reference == cat.reference) {
					renderZ.categories.push({"amount": z.catSales[k].amount.toLocaleString()});
					total.categoryTotal[j] += z.catSales[k].amount;
					found = true;
					keptCategories[j] = true;
					break;
				}
			}
			if (!found) {
				renderZ.categories.push({"amount": ""});
			}
		}
		for (let j = 0; j < categories.length; j++) {
			let cat = categories[j]
			for (let j2 = 0; j2 < taxes.length; j2++) {
				let tax = taxes[j2]
				let found = false;
				for (let k = 0; k < z.catTaxes.length; k++) {
					if (z.catTaxes[k].reference == cat.reference && z.catTaxes[k].tax == tax.id) {
						renderZ.catTaxes.push({"base": z.catTaxes[k].base.toLocaleString(),
							"amount": z.catTaxes[k].amount.toLocaleString()});
						total.catTaxTotal[j * taxes.length + j2].base += z.catTaxes[k].base;
						total.catTaxTotal[j * taxes.length + j2].amount += z.catTaxes[k].amount;
						found = true;
						keptCatTaxes[j * taxes.length + j2] = true;
						break;
					}
				}
				if (!found) {
					renderZ.catTaxes.push({"base": "", "amount": ""});
				}
			}
		}
		renderZs.push(renderZ);
	}
	// Remove the empty columns
	let spliced = 0;
	for (let i = 0; i < keptPayments.length; i++) {
		if (!keptPayments[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["payments"].splice(i - spliced, 1);
			}
			paymentModes.splice(i - spliced, 1);
			total.paymentModeTotal.splice(i - spliced, 1);
			spliced++;
		}
	}
	spliced = 0;
	for (let i = 0; i < keptTaxes.length; i++) {
		if (!keptTaxes[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["taxes"].splice(i - spliced, 1);
			}
			taxes.splice(i - spliced, 1);
			total.taxTotal.splice(i - spliced, 1);
			spliced++;
		}
	}
	spliced = 0;
	for (let i = 0; i < keptCategories.length; i++) {
		if (!keptCategories[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["categories"].splice(i - spliced, 1);
			}
			categories.splice(i - spliced, 1);
			total.categoryTotal.splice(i - spliced, 1);
			spliced++;
		}
	}
	spliced = 0;
	for (let i = 0; i < keptCatTaxes.length; i++) {
		if (!keptCatTaxes[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["catTaxes"].splice(i - spliced, 1);
			}
			catTaxes.splice(i - spliced, 1);
			total.catTaxTotal.splice(i - spliced, 1);
			spliced++;
		}
	}
	// Render
	total.cs = total.cs.toLocaleString();
	for (let i = 0; i < total.paymentModeTotal.length; i++) {
		total.paymentModeTotal[i] = total.paymentModeTotal[i].toLocaleString();
	}
	for (let i = 0; i < total.taxTotal.length; i++) {
		total.taxTotal[i].base = total.taxTotal[i].base.toLocaleString();
		total.taxTotal[i].amount = total.taxTotal[i].amount.toLocaleString();
	}
	for (let i = 0; i < total.categoryTotal.length; i++) {
		total.categoryTotal[i] = total.categoryTotal[i].toLocaleString();
	}
	for (let i = 0; i < total.catTaxTotal.length; i++) {
		total.catTaxTotal[i].base = total.catTaxTotal[i].base.toLocaleString();
		total.catTaxTotal[i].amount = total.catTaxTotal[i].amount.toLocaleString();
	}
	// Set table
	vue.screen.data.table.title = "Tickets Z du " + vue.screen.data.start + " au " + vue.screen.data.stop;
	vue.screen.data.table.columns = [
		{label: "Caisse", visible: true},
		{label: "N°", visible: false},
		{label: "Ouverture", visible: true},
		{label: "Clôture", visible: true},
		{label: "Fond ouverture", visible: false},
		{label: "Fond clôture", visible: false},
		{label: "Fond attendu", visible: false},
		{label: "Erreur de caisse", visible: true},
		{label: "Tickets", visible: true},
		{label: "CA", visible: true, class: "z-oddcol"},
		{label: "CA mois", visible: false, class: "z-oddcol"},
		{label: "CA année", visible: false, class: "z-oddcol"}
	];
	vue.screen.data.table.footer = ["", "", "", "", "", "", "Totaux", total.errorTotal, total.tickets, total.cs, "", ""];
	for (let i = 0; i < paymentModes.length; i++) {
		let pm = paymentModes[i];
		vue.screen.data.table.columns.push({label: pm.label, visible: true});
		vue.screen.data.table.footer.push(total.paymentModeTotal[i]);
	}
	for (let i = 0; i < taxes.length; i++) {
		let tax = taxes[i];
		vue.screen.data.table.columns.push({label: tax.label + " base", visible: true, class: "z-oddcol"});
		vue.screen.data.table.columns.push({label: tax.label + " TVA", visible: true, class: "z-oddcol"});
		vue.screen.data.table.footer.push(total.taxTotal[i].base);
		vue.screen.data.table.footer.push(total.taxTotal[i].amount);
	}
	for (let i = 0; i < categories.length; i++) {
		let cat = categories[i];
		vue.screen.data.table.columns.push({label: cat.label, visible: true});
		vue.screen.data.table.footer.push(total.categoryTotal[i]);
	}
	for (let i = 0; i < catTaxes.length; i++) {
		let catTax = catTaxes[i];
		vue.screen.data.table.columns.push({label: catTax.cat + " " + catTax.label + " base", visible: true, class: "z-oddcol"});
		vue.screen.data.table.columns.push({label: catTax.cat + " " + catTax.label + " TVA", visible: false, class: "z-oddcol"});
		vue.screen.data.table.footer.push(total.catTaxTotal[i].base);
		vue.screen.data.table.footer.push(total.catTaxTotal[i].amount);
	}
	vue.screen.data.table.lines = [];
	for (let i = 0; i < renderZs.length; i++) {
		let z = renderZs[i];
		let line = [z.cashRegister, z.sequence, z.openDate, z.closeDate, z.openCash, z.closeCash, z.expectedCash,
			z.closeError, z.ticketCount, z.cs, z.csPeriod, z.csFYear];
		for (let j = 0; j < z.payments.length; j++) {
			line.push(z.payments[j].amount);
		}
		for (let j = 0; j < z.taxes.length; j++) {
			line.push(z.taxes[j].base);
			line.push(z.taxes[j].amount);
		}
		for (let j = 0; j < z.categories.length; j++) {
			line.push(z.categories[j].amount);
		}
		for (let j = 0; j < z.catTaxes.length; j++) {
			line.push(z.catTaxes[j].base);
			line.push(z.catTaxes[j].amount);
		}
		vue.screen.data.table.lines.push(line);
	}
	gui_hideLoading();
}

