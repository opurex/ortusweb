function customers_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles", "customers"], function(data) {
			_customers_showCustomers(data["customers"], data["taxes"], data["tariffareas"], data["discountprofiles"]);
			storage_close();
		});
	});
}

function _customers_showCustomers(customers, taxes, tariffAreas, discountProfiles) {
	gui_hideLoading();
	var sortedCusts = customers.sort(tools_sort("dispName", "card"));
	for (let i = 0; i < sortedCusts.length; i++) {
		let cust = sortedCusts[i];
		cust.balance = cust.balance.toLocaleString();
	}
	vue.screen.data = {
		"customers": sortedCusts,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
	}
	vue.screen.component = "vue-customer-list";
}

function customers_showCustomer(custId) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "tariffareas", "discountprofiles", "cashRegisters", "paymentmodes"], function(data) {
			if (custId != null) {
				storage_get("customers", parseInt(custId), function(customer) {
					_customers_showCustomer(customer, data["taxes"], data["tariffareas"], data["discountprofiles"], data["cashRegisters"], data["paymentmodes"]);
					storage_close();
				});
			} else {
				_customers_showCustomer(Customer_default(), data["taxes"], data["tariffareas"], data["discountprofiles"]);
				storage_close();
			}
		});
	});
}

function _customers_showCustomer(customer, taxes, tariffAreas, discountProfiles, cashRegisters, paymentModes) {
	gui_hideLoading();
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"customer": customer,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
		"cashRegisters": cashRegisters,
		"paymentModes": paymentModes,
		"deleteImage": false,
		"deleteImageButton": "Supprimer",
		"hadImage": customer.hasImage, // Save for later check
		"start": start,
		"stop": stop,
		"customerHistory": {
			reference: "customer-history-list",
			columns: [
				{reference: "image", label: "Image", export: false, visible: true, help: "L'image du produit. Ce champ ne peut être exporté."},
				{reference: "date", label: "Date", visible: true, help: "La date d'achat." },
				{reference: "ticket", label: "Ticket", visible: false, help: "Le numéro du ticket correspondant." },
				{reference: "payments", label: "Paiement", visible: false, help: "Le mode de paiement associé au ticket. Il est commun à toutes les lignes d'un même ticket et ne correspond pas au paiement de la ligne."},
				{reference: "discountRate", label: "Remise du ticket", visible: false, help: "Le taux de remise appliqué à tout le ticket. La remise n'est pas prise en compte dans les champs HT et TTC."},
				{reference: "line-reference", label: "Reference", visible: false, help: "La référence du produit."},
				{reference: "line-label", label: "Désignation", visible: true, help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."},
				{reference: "line-unitPrice", label: "PU HT", visible: false, help: "Le prix unitaire hors taxes avant remise."},
				{reference: "line-unitTaxedPrice", label: "PU TTC", visible: false, help: "Le prix unitaire TTC avant remise."},
				{reference: "line-taxRate", label: "TVA", visible: false, help: "Le taux de TVA appliqué."},
				{reference: "line-quantity", label: "Quantité", visible: true, help: "La quantité de produit."},
				{reference: "line-discountRate", label: "Remise", visible: false, help: "Le taux de remise accordé, inclus dans les champs HT et TTC."},
				{reference: "line-finalPrice", label: "HT", visible: false, help: "Le montant de chiffre d'affaire hors taxes associé. Il comprend la remise de la ligne mais pas la remise du ticket."},
				{reference: "line-finalTaxedPrice", label: "TTC", visible: false, help: "Le prix de vente TTC. Il comprend la remise de la ligne mais pas la remise du ticket."},
			],
		},
	}
	vue.screen.component = "vue-customer-form";
}

function customers_toggleImage() {
	if (vue.screen.data.customer.hasImage) {
		vue.screen.data.customer.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restaurer";
	} else {
		vue.screen.data.customer.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Supprimer";
	}
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
		cust.id = respCust["id"];
	}
	if (cust.expireDate != null) {
		cust.expireDate = respCust.expireDate; // stay in sync with the server's format
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		cust.hasImage = false;
		srvcall_delete("api/image/customer/" + encodeURIComponent(cust.id), function(request, status, response) {
			_customers_saveCommit(cust);
		});
	} else if (imgTag.files.length != 0) {
		cust.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/customer/" + encodeURIComponent(cust.id), imgTag.files[0], function(request, status, response) {
				_customers_saveCommit(cust);
			});
		} else {
			srvcall_put("api/image/customer/" + encodeURIComponent(cust.id), imgTag.files[0], function(request, status, response) {
				_customers_saveCommit(cust);
			});
		}
	} else {
		_customers_saveCommit(cust);
	}
}

function _customers_saveCommit(cust) {
	if (cust.hasImage) {
		// Force image refresh
		cust.hasImage = false;
		cust.hasImage = true;
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
	let taxedTotal = 0.0;
	let lines = [];
	for (let i = 0; i < tickets.length; i++) {
		let tkt = tickets[i];
		let date = new Date(tkt.date * 1000);
		let cr = crById[tkt.cashRegister];
		let number = cr.label + "-" + tkt.number;
		let pmIds = {};
		let pms = [];
		for (let j = 0; j < tkt.payments.length; j++) {
			let payment = tkt.payments[j];
			let pm = pmById[payment.paymentMode];
			if (!(pm.id in pmIds)) {
				pmIds[pm.id] = pm.label;
			}
		}
		for (let key in pmIds) {
			pms.push(pmIds[key]);
		}
		let payments = pms.join(", ");
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
					img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken()};
				} else {
					img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken()};
				}
				ref = prd.reference;
			} else {
				img = {"type": "thumbnail", "src": login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken()};
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
			// Render
			lines.push([
				img,
				tools_dateTimeToString(date),
				number,
				payments,
				(tkt.discountRate * 100).toLocaleString(undefined, {maximumFractionDigits: 2}) + "%",
				ref,
				line.productLabel,
				price.toLocaleString(undefined, {maximumFractionDigits: 2}),
				taxedPrice.toLocaleString(undefined, {maximumFractionDigits: 2}),
				(line.taxRate * 100).toLocaleString(undefined, {maximumFractionDigits: 2}) + "%",
				line.quantity.toLocaleString(),
				(line.discountRate * 100).toLocaleString() + "%",
				finalPrice.toLocaleString(undefined, {maximumFractionDigits: 2}),
				finalTaxedPrice.toLocaleString(undefined, {maximumFractionDigits: 2})
			]);
		}
	}
	vue.screen.data.customerHistory.title = "Historique d'achat du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop),
	Vue.set(vue.screen.data.customerHistory, "lines", lines);
	Vue.set(vue.screen.data.customerHistory, "footer", ["", "", "", "", "", "", "", "", "", "", "", "Totaux", total.toLocaleString(), taxedTotal.toLocaleString()]);
	gui_hideLoading();
}
