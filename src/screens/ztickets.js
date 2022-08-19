function ztickets_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"addZeros": false,
		"includeUnusedPayments": false,
		"includeUnusedTaxes": false,
		"includeUnusedCategories": false,
		"table": {reference: "zticket-list", columns: []}
	}
	vue.screen.component = "vue-zticket-list";
}

function ztickets_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
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
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "categories", "paymentmodes", "customers"], function(data) {
			_parseZTickets(data["cashRegisters"], data["paymentmodes"],
				data["taxes"], data["categories"], data["customers"], zTickets);
			storage_close();
		});
	});
}

function _parseZTickets(cashRegisters, paymentModes, taxes, categories, customers, zTickets) {
	// Collect the listed taxes, payment modes and cat taxes
	let catTaxes = [];
	let total = {
		"tickets": 0,
		"cs": 0.0,
		"csTaxesTotal": 0.0,
		"errorTotal": 0.0,
		"custBalance": 0.0,
		"paymentModeTotal": [],
		"taxTotal": [],
		"categoryTotal": [],
		"catTaxTotal": [],
		"custBalanceTotal": [],
		"overPerceivedTotal": 0.0,
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
	for (let i = 0; i < customers.length; i++) {
		total.custBalanceTotal.push(0.0);
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
	let keptCustBalances = [];
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
	for (let i = 0; i < customers.length; i++) {
		keptCustBalances[i] = false;
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
		let csTaxes = z.cs;
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
			"csPerpetual": (z.csPerpetual) ? z.csPerpetual.toLocaleString() : "",
			"custBalance": 0.0,
			"payments": [],
			"taxes": [],
			"categories": [],
			"catTaxes": [],
			"custBalances": [],
		}
		total.tickets += z.ticketCount;
		total.cs += z.cs;
		total.errorTotal += closeError;
		let paymentTotal = 0.0;
		for (let j = 0; j < paymentModes.length; j++) {
			let pm = paymentModes[j];
			let found = false;
			let renderZIndex = 0;
			for (let k = 0; k < z.payments.length; k++) {
				let pmt = z.payments[k];
				if (pmt.paymentMode == pm.id) {
					if (found) {
						renderZ.payments[renderZIndex].amount += pmt.amount;
					} else {
						renderZIndex = renderZ.payments.length;
						renderZ.payments.push({"amount": pmt.amount});
					}
					total.paymentModeTotal[j] += pmt.amount;
					paymentTotal += pmt.amount;
					found = true;
					keptPayments[j] = true;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.payments.push({"amount": "0"});
				} else {
					renderZ.payments.push({"amount": ""});
				}
			} else {
				renderZ.payments[renderZIndex].amount = renderZ.payments[renderZIndex].amount.toLocaleString();
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
					csTaxes += z.taxes[k].amount;
					found = true;
					keptTaxes[j] = true;
					break;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.taxes.push({"base": "0", "amount": "0"});
				} else {
					renderZ.taxes.push({"base": "", "amount": ""});
				}
			}
		}
		total.csTaxesTotal += csTaxes;
		renderZ.csTaxes = csTaxes.toLocaleString();
		let overPerceived = paymentTotal - csTaxes;
		total.overPerceivedTotal += overPerceived;
		renderZ.overPerceived = overPerceived.toLocaleString();
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
				if (vue.screen.data.addZeros) {
					renderZ.categories.push({"amount": "0"});
				} else {
					renderZ.categories.push({"amount": ""});
				}
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
					if (vue.screen.data.addZeros) {
						renderZ.catTaxes.push({"base": "0", "amount": "0"});
					} else {
						renderZ.catTaxes.push({"base": "", "amount": ""});
					}
				}
			}
		}
		for (let j = 0; j < customers.length; j++) {
			let customer = customers[j];
			let found = false;
			for (let k = 0; k < z.custBalances.length; k++) {
				if (z.custBalances[k].id.customer == customer.id) {
					renderZ.custBalances.push({"amount": z.custBalances[k].balance.toLocaleString()});
					renderZ.custBalance += z.custBalances[k].balance;
					total.custBalance += z.custBalances[k].balance;
					total.custBalanceTotal[j] += z.custBalances[k].balance;
					found = true;
					keptCustBalances[j] = true;
					break;
				}
			}
			if (!found) {
				if (vue.screen.data.addZeros) {
					renderZ.custBalances.push({"amount": "0"});
				} else {
					renderZ.custBalances.push({"amount": ""});
				}
			}
		}
		renderZ.custBalance = renderZ.custBalance.toLocaleString();
		renderZs.push(renderZ);
	}
	// Remove the empty columns
	let spliced = 0;
	if (!vue.screen.data.includeUnusedPayments) {
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
	}
	spliced = 0;
	if (!vue.screen.data.includeUnusedTaxes) {
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
	}
	spliced = 0;
	if (!vue.screen.data.includeUnusedCategories) {
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
	spliced = 0;
	for (let i = 0; i < keptCustBalances.length; i++) {
		if (!keptCustBalances[i]) {
			for (let j = 0; j < renderZs.length; j++) {
				renderZs[j]["custBalances"].splice(i - spliced, 1);
			}
			customers.splice(i - spliced, 1);
			total.custBalanceTotal.splice(i - spliced, 1);
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
	for (let i = 0; i < total.custBalanceTotal.length; i++) {
		total.custBalanceTotal[i] = total.custBalanceTotal[i].toLocaleString();
	}
	total.overPerceivedTotal = total.overPerceivedTotal.toLocaleString();
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
	vue.screen.data.table.title = "Tickets Z du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop);
	vue.screen.data.table.columns = [
		{reference: "cashRegister", label: "Caisse", visible: oldColumnVisible("Caisse", oldColumns, true), help: "Le nom de la caisse."},
		{reference: "sequence", label: "N°", export_as_number: true, visible: oldColumnVisible("N°", oldColumns, true), help: "Le numéro de séquence de la session de caisse."},
		{reference: "openDate", label: "Ouverture", visible: oldColumnVisible("Ouverture", oldColumns, true), help: "La date et heure d'ouverture de la session de caisse."},
		{reference: "closeDate", label: "Clôture", visible: oldColumnVisible("Clôture", oldColumns, true), help: "La date et heure de clôture de la session de caisse."},
		{reference: "openCash", label: "Fond ouverture", export_as_number: true, visible: oldColumnVisible("Fond ouverture", oldColumns, true), help: "Le montant du fond de caisse compté à l'ouverture."},
		{reference: "closeCash", label: "Fond clôture", export_as_number: true, visible: oldColumnVisible("Fond clôture", oldColumns, true), help: "Le montant du fond de caisse compté à la clôture."},
		{reference: "expectedCash", label: "Fond attendu", export_as_number: true, visible: oldColumnVisible("Fond attendu", oldColumns, true), help: "Le montant du fond de caisse attendu à la clôture, calculé à partir du fond de caisse à l'ouverture et des encaissements."},
		{reference: "cashError", label: "Erreur de caisse", export_as_number: true, visible: oldColumnVisible("Erreur de caisse", oldColumns, true), help: "L'écart entre le fond de caisse à la clôture et le fond de caisse attendu. Lorsqu'il est positif, il y avait trop de monnaie, lorsque négatif, il en manquait."},
		{reference: "tickets", label: "Tickets", export_as_number: true, visible: oldColumnVisible("Tickets", oldColumns, false), help: "Le nombre de tickets réalisés sur la session de caisse."},
		{reference: "cs", label: "CA HT", export_as_number: true, visible: oldColumnVisible("CA", oldColumns, true), class: "z-oddcol", help: "Le montant total du chiffre d'affaire hors taxes réalisé pendant la session."},
		{reference: "csPeriod", label: "CA HT mois", export_as_number: true, visible: oldColumnVisible("CA mois", oldColumns, false), class: "z-oddcol", help: "Le cumul du chiffre d'affaire réalisé sur la période. Ce cumul est remis à zéro lorsque la clôture mensuelle est choisie au moment de clôturer la caisse."},
		{reference: "csFYear", label: "CA HT année", export_as_number: true, visible: oldColumnVisible("CA année", oldColumns, false), class: "z-oddcol", help: "Le cumul du chiffre d'affaire réalisé sur l'année ou exercice fiscal. Ce cumul est remis à zéro lorsque la clôture annuelle est choisie au moment de clôturer la caisse."},
		{reference: "csPerpetual", label: "CA HT perpétuel", export_as_number: true, visible: oldColumnVisible("CA perpétuel", oldColumns, false), class: "z-oddcol", help: "Le cumul perpetuel du chiffre d'affaire réalisé avec cette caisse. Ce cumul n'est jamais remis à zéro."},
		{reference: "csTaxes", label: "CA + taxes", export_as_number: true, visible: oldColumnVisible("CA + taxes", oldColumns, false), class: "z-oddcol", help: "Le total TTC de la session."},
		{reference: "custBalance", label: "Balance client", export_as_number: true, visible: oldColumnVisible("Balance client", oldColumns, false), class: "z-oddcol", help: "La variation totale des soldes des comptes clients. En positif pour les recharges pré-payés ou remboursements, en négatif pour les dépenses ou dettes."},
	];
	vue.screen.data.table.footer = ["", "", "", "", "", "", "Totaux", total.errorTotal.toLocaleString(), total.tickets, total.cs.toLocaleString(), "", "", "", total.csTaxesTotal.toLocaleString(), total.custBalance.toLocaleString()];
	for (let i = 0; i < paymentModes.length; i++) {
		let pm = paymentModes[i];
		vue.screen.data.table.columns.push({reference: "pm-" + pm.reference, label: pm.label, export_as_number: true, visible: oldColumnVisible(pm.label, oldColumns, true), help: "Le montant des encaissements réalisés avec ce moyen de paiement sur la session."});
		vue.screen.data.table.footer.push(total.paymentModeTotal[i]);
	}
	vue.screen.data.table.columns.push({reference: "overPerceived", label: "Produit exceptionnel", export_as_number: true, visible: oldColumnVisible("Produit exceptionnel", oldColumns, false), help: "Le montant trop perçu pour les modes de paiement sans rendu-monnaie ou les arrondis de TVA sur remises."});
	vue.screen.data.table.footer.push(total.overPerceivedTotal);
	for (let i = 0; i < taxes.length; i++) {
		let tax = taxes[i];
		vue.screen.data.table.columns.push({reference: "tax-" + i + "-base", label: tax.label + " base", export_as_number: true, visible: oldColumnVisible(tax.label + " base", oldColumns, false), class: "z-oddcol", help: "Le montant de chiffre d'affaire hors taxe associé au taux de TVA."});
		vue.screen.data.table.columns.push({reference: "tax-" + i + "-amount", label: tax.label + " TVA", export_as_number: true, visible: oldColumnVisible(tax.label + " TVA", oldColumns, false), class: "z-oddcol", help: "Le montant de TVA collectée associé au taux de TVA."});
		vue.screen.data.table.footer.push(total.taxTotal[i].base);
		vue.screen.data.table.footer.push(total.taxTotal[i].amount);
	}
	for (let i = 0; i < categories.length; i++) {
		let cat = categories[i];
		vue.screen.data.table.columns.push({reference: "cat-" + cat.reference + "-cs", label: cat.label, export_as_number: true, visible: oldColumnVisible(cat.label, oldColumns, false), help: "Le montant de chiffre d'affaire hors taxe réalisé dans cette catégorie de produit (indicatif)."});
		vue.screen.data.table.footer.push(total.categoryTotal[i]);
	}
	for (let i = 0; i < catTaxes.length; i++) {
		let catTax = catTaxes[i];
		vue.screen.data.table.columns.push({reference: "catTax-" + i + "-base", label: catTax.cat + " " + catTax.label + " base", export_as_number: true, visible: oldColumnVisible(catTax.cat + " " + catTax.label + " base", oldColumns, false), class: "z-oddcol", help: "Le montant de chiffre d'affaire hors taxe réalisé dans cette catégorie pour ce taux de TVA (indicatif)."});
		vue.screen.data.table.columns.push({reference: "catTax-" + i + "-amount", label: catTax.cat + " " + catTax.label + " TVA", export_as_number: true, visible: oldColumnVisible(catTax.cat + " " + catTax.label + " TVA", oldColumns, false), class: "z-oddcol", help: "Le montant de TVA collectée pour cette catégorie pour ce taux de TVA (indicatif)."});
		vue.screen.data.table.footer.push(total.catTaxTotal[i].base);
		vue.screen.data.table.footer.push(total.catTaxTotal[i].amount);
	}
	for (let i = 0; i < customers.length; i++) {
		let customer = customers[i];
		vue.screen.data.table.columns.push({reference: "cust-" + customer.id + "-balance", label: customer.dispName, export_as_number: true, visible: oldColumnVisible(customer.dispName, oldColumns, false), help: "La variation du solde client"});
		vue.screen.data.table.footer.push(total.custBalanceTotal[i]);
	}
	vue.screen.data.table.lines = [];
	for (let i = 0; i < renderZs.length; i++) {
		let z = renderZs[i];
		let line = [z.cashRegister, z.sequence, z.openDate, z.closeDate, z.openCash, z.closeCash, z.expectedCash,
			z.closeError, z.ticketCount, z.cs, z.csPeriod, z.csFYear, z.csPerpetual, z.csTaxes, z.custBalance];
		for (let j = 0; j < z.payments.length; j++) {
			line.push(z.payments[j].amount);
		}
		line.push(z.overPerceived);
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
		for (let j = 0; j < z.custBalances.length; j++) {
			line.push(z.custBalances[j].amount);
		}
		vue.screen.data.table.lines.push(line);
	}
	vue.$refs.screenComponent.$refs.zTable.restoreDefaultColumns();
	gui_hideLoading();
}

