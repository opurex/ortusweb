function customers_show() {
	gui_showLoading();
	let custStore = appData.db.transaction(["customers"], "readonly").objectStore("customers");
	let customers = [];
	custStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			customers.push(cursor.value);
			cursor.continue();
		} else {
			_customers_showCustomers(customers);
		}
	}
}
function _customers_showCustomers(customers) {
	gui_hideLoading();
	var sortedCusts = customers.sort(tools_sort("dispName", "card"));
	for (let i = 0; i < sortedCusts.length; i++) {
		let cust = sortedCusts[i];
		cust.balance = cust.balance.toLocaleString();
	}
	vue.screen.data = {
		"customers": sortedCusts
	}
	vue.screen.component = "vue-customer-list";
}

function customers_showCustomer(custId) {
	gui_showLoading();
	storage_readStores(["taxes", "tariffareas", "discountprofiles"], function(data) {
		if (custId != null) {
			let custStore = appData.db.transaction(["customers"], "readonly").objectStore("customers");
			custStore.get(parseInt(custId)).onsuccess = function(event) {
				_customers_showCustomer(event.target.result, data["taxes"], data["tariffareas"], data["discountprofiles"]);
			}
		} else {
			_customers_showCustomer(Customer_default(), data["taxes"], data["tariffareas"], data["discountprofiles"]);
		}
	});
}

function _customers_showCustomer(customer, taxes, tariffAreas, discountProfiles) {
	gui_hideLoading();
	if (customer != null) {
		if (customer.expireDate != null) {
			customer.expireDate = tools_dateToString(new Date(customer.expireDate * 1000));
		}
	}
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	vue.screen.data = {
		"customer": customer,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
		"deleteImage": false,
		"deleteImageButton": "Supprimer",
		"hadImage": customer.hasImage, // Save for later check
		"start": tools_dateToString(start),
		"stop": tools_dateToString(stop),
		"customerHistory": null
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
	if (cust.expireDate == null && document.getElementById("edit-expireDate").value != "") {
		gui_showError("Date d'expiration invalide");
		return;
	}
	if (cust.expireDate != null) {
		cust.expireDate = tools_dateToDataString(cust.expireDate);
	}
	gui_showLoading();
	srvcall_post("api/customer", cust, _customers_saveCallbackClosure(customers_saveCustomer));
}

function customers_saveBalance() {
	let custId = vue.screen.data.customer.id;
	let balance = vue.screen.data.customer.balance;
	gui_showLoading();
	srvcall_patch("api/customer/" + custId + "/balance/" + balance, null, _customers_saveCallbackClosure(customers_saveBalance));
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
	if (!("id" in cust)) {
		cust.id = parseInt(response);
	}
	if (cust.expireDate != null) {
		cust.expireDate = cust.expireDate.getTime() / 1000
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		cust.hasImage = false;
		srvcall_delete("api/image/customer/" + cust.id, function(request, status, response) {
			_customers_saveCommit(cust);
		});
	} else if (imgTag.files.length != 0) {
		cust.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/customer/" + cust.id, imgTag.files[0], function(request, status, response) {
				_customers_saveCommit(cust);
			});
		} else {
			srvcall_put("api/image/customer/" + cust.id, imgTag.files[0], function(request, status, response) {
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
	let custStore = appData.db.transaction(["customers"], "readwrite").objectStore("customers");
	let req = custStore.put(cust);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}

}

function customers_filterHistory() {
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
		stop = new Date(stop[2], stop[1] - 1, stop[0]);
	}
	let custId = vue.screen.data.customer.id;
	srvcall_get("api/ticket/search?dateStart=" + (start.getTime() / 1000) + "&dateStop=" + (stop.getTime() / 1000) + "&customer=" + custId, _customers_historyCallback);
	gui_showLoading();
}

function _customers_historyCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, customers_filterHistory)) {
		return;
	}
	let tickets = JSON.parse(response);
	let lines = [];
	for (let i = 0; i < tickets.length; i++) {
		let tkt = tickets[i];
		let date = new Date(tkt.date * 1000);
		for (let j = 0; j < tkt.lines.length; j++) {
			lines.push({"date": tools_dateTimeToString(date),
				"product": tkt.lines[j].productLabel,
				"quantity": tkt.lines[j].quantity
			});
		}
	}
	vue.screen.data.customerHistory = lines;
	gui_hideLoading();
}
