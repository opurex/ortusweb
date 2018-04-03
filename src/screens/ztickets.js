function ztickets_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	start = tools_dateToString(start);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	stop = tools_dateToString(stop);
	var html = Mustache.render(view_ztickets, {"start": start, "stop": stop});
	document.getElementById('content').innerHTML = html;
}

function ztickets_filter() {
	let inputs = document.forms["ztickets-filter"].elements;
	let start = inputs["start"].value.split("/");
	if (start.length != 3) {
		start = new Date(new Date().getTime() - 604800000);
	} else {
		start = new Date(start[2], start[1] - 1, start[0]);
	}
	let stop = inputs["stop"].value.split("/");
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
							_parseZTickets(paymentModes, taxes, categories, zTickets);
						}
					}
				}
			}
		}
	}
}

function _parseZTickets(paymentModes, taxes, categories, zTickets) {
	// Collect the listed taxes, payment modes and cat taxes
	let catTaxes = [];
	for (let i = 0; i < categories.length; i++) {
		for (let j = 0; j < taxes.length; j++) {
			catTaxes.push(JSON.parse(JSON.stringify(taxes[j])));
			catTaxes[i * taxes.length + j]["cat"] = categories[i]["label"];
		}
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
		let renderZ = {
			"cashRegister": "",
			"sequence": z.sequence,
			"openDate": tools_dateTimeToString(openDate),
			"closeDate": tools_dateTimeToString(closeDate),
			"openCash": (z.openCash != null) ? z.openCash.toLocaleString() : "",
			"closeCash": (z.closeCash != null) ? z.closeCash.toLocaleString() : "",
			"expectedCash": (z.expectedCash != null) ? z.expectedCash.toLocaleString() : "",
			"ticketCount": z.ticketCount,
			"cs": z.cs.toLocaleString(),
			"csPeriod": z.csPeriod.toLocaleString(),
			"csFYear": z.csFYear.toLocaleString(),
			"payments": [],
			"taxes": [],
			"categories": [],
			"catTaxes": [],
		}
		for (let j = 0; j < paymentModes.length; j++) {
			let pm = paymentModes[j];
			let found = false;
			for (let k = 0; k < z.payments.length; k++) {
				if (z.payments[k].paymentMode == pm.id) {
					renderZ.payments.push({"amount": z.payments[k].currencyAmount.toLocaleString()});
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
			spliced++;
		}
	}
	// Render
	let elements = { "paymentModes": paymentModes,
		"paymentModesCount": paymentModes.length,
		"taxes": taxes,
		"taxesCount": taxes.length * 2,
		"categories": categories,
		"categoriesCount": categories.length,
		"catTaxes": catTaxes,
		"catTaxesCount": catTaxes.length * 2,
		"z": renderZs,
		"start": document.forms["ztickets-filter"].elements["start"].value,
		"stop": document.forms["ztickets-filter"].elements["stop"].value
	};
	var html = Mustache.render(view_zticketsTable, elements);
	document.getElementById('z-content').innerHTML = html;
	gui_hideLoading();
}

