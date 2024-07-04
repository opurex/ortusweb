function customers_show() {
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles"], function(data) {
			_customers_showCustomers(data["taxes"], data["tariffareas"], data["discountprofiles"]);
			storage_close();
		});
	});
}

function _customers_showCustomers(taxes, tariffAreas, discountProfiles) {
	CustomerDef.loadCustomizedContactFields(function(contactFields) {
		vue.screen.data = {
			"filterVisible": "visible",
			"taxes": taxes,
			"tariffAreas": tariffAreas,
			"discountProfiles": discountProfiles,
			"contactFields": contactFields
		}
		vue.screen.component = "vue-customer-list";
	});
}

function customers_showCustomer(custId) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles", "cashRegisters", "paymentmodes", "users"], function(data) {
			if (custId != null) {
				storage_get("customers", parseInt(custId), function(customer) {
					_customers_showCustomer(customer, data["taxes"], data["tariffareas"], data["discountprofiles"], data["cashRegisters"], data["paymentmodes"], data["users"]);
					storage_close();
				});
			} else {
				_customers_showCustomer(new RecordFactory(CustomerDef).create(), data["taxes"], data["tariffareas"], data["discountprofiles"], data["users"]);
				storage_close();
			}
		});
	});
}

function _customers_showCustomer(customer, taxes, tariffAreas, discountProfiles, cashRegisters, paymentModes, users) {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"modelDef": CustomerDef,
		"customer": customer,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
		"cashRegisters": cashRegisters,
		"paymentModes": paymentModes,
		"users": users,
		"image": null,
		"start": start,
		"stop": stop,
		"tickets": [],
		"customerHistory": new Table().reference("customer-history-list")
			.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("L'image du produit. Ce champ ne peut être exporté."))
			.column(new TableCol().reference("date").label("Date").visible(true).help("La date d'achat.")) // type = String for date range
			.column(new TableCol().reference("ticket").label("Ticket").visible(false).searchable(true).help("Le numéro du ticket correspondant."))
			.column(new TableCol().reference("payments").label("Paiement").visible(false).help("Le mode de paiement associé au ticket. Il est commun à toutes les lignes d'un même ticket et ne correspond pas au paiement de la ligne."))
			.column(new TableCol().reference("discountRate").label("Remise du ticket").visible(false).help("Le taux de remise appliqué à tout le ticket. La remise n'est pas prise en compte dans les champs HT et TTC."))
			.column(new TableCol().reference("line-reference").label("Reference").visible(false).searchable(true).help("La référence du produit."))
			.column(new TableCol().reference("line-label").label("Désignation").visible(true).searchable(true).help("Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."))
			.column(new TableCol().reference("line-unitPrice").label("PU HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le prix unitaire hors taxes avant remise."))
			.column(new TableCol().reference("line-unitTaxedPrice").label("PU TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le prix unitaire TTC avant remise."))
			.column(new TableCol().reference("line-taxRate").label("TVA").type(TABLECOL_TYPE.PERCENT).visible(false).help("Le taux de TVA appliqué."))
			.column(new TableCol().reference("line-quantity").label("Quantité").type(TABLECOL_TYPE.NUMBER).visible(true).help("La quantité de produit."))
			.column(new TableCol().reference("line-discountRate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(false).help("Le taux de remise accordé, inclus dans les champs HT et TTC."))
			.column(new TableCol().reference("line-finalPrice").label("HT").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Le montant de chiffre d'affaire hors taxes associé. Il comprend la remise de la ligne mais pas la remise du ticket."))
			.column(new TableCol().reference("line-finalTaxedPrice").label("TTC").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le prix de vente TTC. Il comprend la remise de la ligne mais pas la remise du ticket.")),
		"customerHistoryTickets": new Table().reference("customer-ticket-list")
			.column(new TableCol().reference("cashRegister").label("Caisse").visible(false).help("Le nom de la caisse."))
			.column(new TableCol().reference("sequence").label("Séquence").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de session de la caisse. Le numéro de séquence augmente à chaque clôture de caisse."))
			.column(new TableCol().reference("number").label("Numéro").type(TABLECOL_TYPE.NUMBER).visible(true).searchable(true).help("Le numéro du ticket de la caisse."))
			.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATETIME).visible(true).help("La date de réalisation de la vente."))
			.column(new TableCol().reference("paymentmodes").label("Encaissement").visible(true).searchable(true).help("Les modes de paiement utilisés à l'encaissement."))
			.column(new TableCol().reference("finalTaxedPrice").label("Montant").type(TABLECOL_TYPE.NUMBER2).visible(true).searchable(true).help("Le montant TTC du ticket."))
			.column(new TableCol().reference("overPerceived").label("Trop perçu").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant trop perçu pour les modes de paiement sans rendu-monnaie."))
			.column(new TableCol().reference("user").label("Opérateur").visible(false).searchable(true).help("Le nom du compte utilisateur qui a réalisé la vente."))
			.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true).help("Sélectionner le ticket. Ce champ n'est jamais exporté."))
	}
	CustomerDef.loadCustomizedContactFields(function(contactFields) {
		vue.screen.data.contactFields = contactFields;
		vue.screen.component = "vue-customer-form";
		gui_hideLoading();
	});
}

function customers_saveCustomer() {
	let cust = vue.screen.data.customer;
	if (cust.expireDate != null) {
		// Override to send date as timestamp without messing with local data
		cust.expireDate.toJSON = function() { return cust.expireDate.getTime() / 1000; };
	}
	gui_showLoading();
	srvcall_post("api/customer", cust, _customers_saveCallbackClosure(customers_saveCustomer));
}

function customers_saveBalance() {
	let custId = vue.screen.data.customer.id;
	let balance = vue.screen.data.customer.balance;
	gui_showLoading();
	srvcall_patch("api/customer/" + encodeURIComponent(custId) + "/balance/" + encodeURIComponent(balance), null, _customers_saveCallbackClosure(customers_saveBalance));
}

function _customers_saveCallbackClosure(originalFunc) {
	return function(request, status, response) {
		if (srvcall_callbackCatch(request, status, response, originalFunc)) {
			return;
		}
		_customers_saveCallback(request, status, response);
	}
}

function _customers_saveCallback(request, status, response) {
	let cust = vue.screen.data.customer;
	let respCust = JSON.parse(response);
	if (!("id" in cust)) {
		Vue.set(vue.screen.data.customer, "id", respCust["id"]);
	}
	if (cust.expireDate != null) {
		cust.expireDate = respCust.expireDate; // stay in sync with the server's format
	}
	srvcall_imageSave("customer", cust, cust.id, vue.screen.data.image, _customers_saveCommit);
}

function _customers_saveCommit(cust) {
	if (vue.screen.data.image) {
		cust.hasImage = !vue.screen.data.image.delete;
		vue.screen.data.image = null; // Refresh form
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("customers", cust,
			appData.localWriteDbSuccess, appData.localWriteDbError)
	}, appData.localWriteDbOpenError);
}

function customers_filterHistory() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	let custId = vue.screen.data.customer.id;
	srvcall_get("api/ticket/search?dateStart=" + (start.getTime() / 1000) + "&dateStop=" + (stop.getTime() / 1000) + "&customer=" + custId, _customers_historyCallback);
	gui_showLoading();
}

function _customers_historyCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, customers_filterHistory)) {
		return;
	}
	let tickets = JSON.parse(response);
	storage_open(function(event) {
		storage_readStore("products", function(data) {
			_customers_showHistory(tickets, data);
			storage_close();
		});
	});
}

function _customers_showHistory(tickets, products) {
	let prdById = {};
	let crById = {};
	let pmById = {};
	vue.screen.data.tickets = tickets;
	vue.screen.data.customers = [vue.screen.data.customer];
	for (let i = 0; i < products.length; i++) {
		let prd = products[i];
		prdById[prd.id] = prd;
	}
	for (let i = 0; i < vue.screen.data.cashRegisters.length; i++) {
		let cr = vue.screen.data.cashRegisters[i];
		crById[cr.id] = cr;
	}
	for (let i = 0; i < vue.screen.data.paymentModes.length; i++) {
		let pm = vue.screen.data.paymentModes[i];
		pmById[pm.id] = pm;
	}
	let total = 0.0;
	let tktsTotal = 0.0;
	let overPerceivedTotal = 0.0;
	let taxedTotal = 0.0;
	let consolidatedLineNum = {};
	let lines = [];
	let tktLines = [];
	for (let i = 0; i < tickets.length; i++) {
		let tkt = tickets[i];
		let date = (vue.screen.data.consolidate) ? null : new Date(tkt.date * 1000);
		let cr = crById[tkt.cashRegister];
		let number = (vue.screen.data.consolidate) ? "" : cr.label + "-" + tkt.number;
		let pmIds = {};
		let pms = [];
		let pmTotal = 0.0;
		for (let j = 0; j < tkt.payments.length; j++) {
			let payment = tkt.payments[j];
			let pm = pmById[payment.paymentMode];
			if (!(pm.id in pmIds)) {
				pmIds[pm.id] = pm.label;
			}
			pmTotal += tkt.payments[j].amount;
			tktsTotal += tkt.payments[j].amount;
		}
		for (let key in pmIds) {
			pms.push(pmIds[key]);
		}
		let payments = pms.join(", ");
		let overPerceived = pmTotal - tkt.finalTaxedPrice;
		overPerceivedTotal += overPerceived;
		let tktDate = new Date(tkt.date * 1000);
		let user = "";
		for (let j = 0; j < vue.screen.data.users.length; j++) {
			if (vue.screen.data.users[j].id == tkt.user) {
				user = vue.screen.data.users[j].name;
				break;
			}
		}
		tktLines.push([cr.label, tkt.sequence, tkt.number, tktDate, payments,
			tkt.finalTaxedPrice, overPerceived, user,
			"<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:_tickets_selectTicket(vue.screen.data.tickets[" + i + "]);\">Sélectionner</a></div>"]);
		for (let j = 0; j < tkt.lines.length; j++) {
			let line = tkt.lines[j];
			// Set product data if any
			let prd = null;
			if (line.product != null && (line.product in prdById)) {
				prd = prdById[line.product];
			}
			let img;
			let ref = "";
			if (prd != null) {
				if (prd.hasImage) {
					img = login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken();
				} else {
					img = login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
				}
				ref = prd.reference;
			} else {
				img = login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
			}
			// Compute prices
			let finalTaxedPrice = line.finalTaxedPrice;
			let finalPrice = line.finalPrice;
			let price;
			let taxedPrice;
			if (line.finalTaxedPrice != null) {
				finalPrice = finalTaxedPrice / (1.0 + line.taxRate);
				taxedPrice = Math.round(line.taxedPrice / line.quantity * 100) / 100.0;
				price = taxedPrice / (1.0 + line.taxRate);
			} else {
				finalTaxedPrice = finalPrice * (1.0 + line.taxRate);
				price = line.price / line.quantity;
				taxedPrice = price * (1.0 + line.taxRate);
			}
			total += Math.round(finalPrice * 100) / 100.0;
			taxedTotal += Math.round(finalTaxedPrice * 100) / 100.0;
			let consolidated = false;
			if (vue.screen.data.consolidate) {
				let lineRef = ref;
				if (lineRef == "") { // Custom product
					lineRef = "custom." + line.productLabel;
				}
				let lineId = lineRef + "-" + line.taxRate + "-" + line.price + "-" + line.discountRate + "-" + tkt.discountRate + "-" + pms;
				if (lineId in consolidatedLineNum) {
					// Consolidate quantities
					lines[consolidatedLineNum[lineId]][10] += line.quantity;
					lines[consolidatedLineNum[lineId]][12] += finalPrice;
					lines[consolidatedLineNum[lineId]][13] += finalTaxedPrice;
					consolidated = true;
				} else {
					consolidatedLineNum[lineId] = lines.length;
				}
			}
			if (!consolidated) {
				// Add new line
				lines.push([
					img,
					date,
					number,
					payments,
					tkt.discountRate,
					ref,
					line.productLabel,
					price,
					taxedPrice,
					line.taxRate,
					line.quantity,
					line.discountRate,
					finalPrice,
					finalTaxedPrice
				]);
			}
		}
	}
	// Convert number fo display
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		if (vue.screen.data.consolidate) {
			line[1] = tools_dateToString(vue.screen.data.start) + " - " + tools_dateToString(vue.screen.data.stop);
		} else {
			line[1] = tools_dateTimeToString(line[1]);
		}
	}
	vue.screen.data.customerHistory.title("Historique d'achat du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop));
	vue.screen.data.customerHistory.resetContent(lines, ["", "", "", "", "", "", "", "", "", "", "", "Total", total.toLocaleString(), taxedTotal.toLocaleString()]);
	vue.screen.data.customerHistoryTickets.title("Historique des tickets du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop));
	vue.screen.data.customerHistoryTickets.resetContent(tktLines, ["", "", "", "", "Total", tktsTotal.toLocaleString(), overPerceivedTotal.toLocaleString(), "", ""]);
	if (vue.screen.data.tickets.length > 0) {
		_tickets_selectTicket(vue.screen.data.tickets[0]);
	} else {
		_tickets_selectTicket(null);
	}
	gui_hideLoading();
}

function customers_showImport() {
	storage_open(function(event) {
		storage_readStores(["customers", "discountprofiles", "tariffareas", "taxes"], function(data) {
			vue.screen.data = {
				"customers": data.customers,
				"discountProfiles": data.discountprofiles,
				"tariffAreas": data.tariffareas,
				"taxes": data.taxes,
			}
			storage_close();
			CustomerDef.loadCustomizedContactFields(function(contactFields) {
				vue.screen.data.contactFields = contactFields;
				vue.screen.component = "vue-customer-import";
			});
		});
	});
}

function _customers_parseCsv(fileContent, callback) {
	gui_showLoading();
	CustomerDef.contactFieldList.forEach(f => {
		if (f in vue.screen.data.contactFields) {
			let customLabel = vue.screen.data.contactFields[f].value
			if (customLabel) {
				columnMappingDef[customLabel.toLowerCase()] = f;
			}
		}
	});
	storage_open(function(event) {
		storage_readStores(["customers", "discountprofiles", "tariffareas", "taxes"], function(data) {
			let parser = new CsvParser(CustomerDef, data.customers,
					[{modelDef: DiscountProfileDef, "records": data.discountprofiles},
					{modelDef: TariffAreaDef, "records": data.tariffareas},
					{modelDef: TaxDef, "records": data.taxes}]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newCustomers = imported.newRecords;
			vue.screen.data.editedCustomers = imported.editedRecords;
			callback(imported);
		});
	});
}

function customers_saveCustomers() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newCustomers.length; i++) {
		let cust = vue.screen.data.newCustomers[i];
		calls.push({id: "new-" + i, method: "POST", target: "api/customer", data: cust});
	}
	for (let i = 0; i < vue.screen.data.editedCustomers.length; i++) {
		let cust = vue.screen.data.editedCustomers[i];
		calls.push({id: "edit-" + i, method: "POST", target: "api/customer", data: cust});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, customers_saveMultipleCallback, _customers_progress);
}

function _customers_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function customers_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("Les données n'ont pas été envoyées, veuillez réitérer l'opération.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			errors.push("Quelque chose cloche dans les données du formulaire. " + request.statusText);
			continue;
		}
		let respCust = JSON.parse(response);
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let cust = vue.screen.data.newCustomers[num];
			if (cust.expireDate != null) {
				cust.expireDate = respCust.expireDate; // stay in sync with the server's format
			}
			cust.id = respCust.id;
			saves.push(cust);
		} else {
			let num = parseInt(reqId.substr(5));
			let cust = vue.screen.data.editedCustomers[num];
			if (cust.expireDate != null) {
				cust.expireDate = respCust.expireDate; // stay in sync with the server's format
			}
			saves.push(cust);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("Les autres enregistrements ont été pris en compte. Vous pouvez recharger le fichier pour retrouver les erreurs.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("Les données ont été enregistrées.");
		}
		vue.screen.data = {};
		vue.$refs.screenComponent.reset();
		customers_showImport();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("Aucune opération.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("customers", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
