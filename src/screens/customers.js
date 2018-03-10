function customers_show() {
	gui_showLoading();
	let html = Mustache.render(view_customers, {});
	document.getElementById('content').innerHTML = html;
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
	var elements = {
		"customers": sortedCusts,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/customer/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	for (let i = 0; i < elements["customers"].length; i++) {
		let cust = elements["customers"][i];
		cust.balance = cust.balance.toLocaleString();
	}
	var html = Mustache.render(view_customer_list, elements);
	document.getElementById('customer-list').innerHTML = html;
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
			_customers_showCustomer(null, data["taxes"], data["tariffareas"], data["discountprofiles"]);
		}
	});
}

function _customers_showCustomer(customer, taxes, tariffAreas, discountProfiles) {
	gui_hideLoading();
	if (customer != null) {
		for (let i = 0; i < taxes.length; i++) {
			if (customer["tax"] == taxes[i]["id"]) {
				taxes[i]["selected"] = true;
				break;
			}
		}
		for (let i = 0; i < tariffAreas.length; i++) {
			if (customer["tariffArea"] == tariffAreas[i]["id"]) {
				tariffAreas[i]["selected"] = true;
				break;
			}
		}
		for (let i = 0; i < discountProfiles.length; i++) {
			if (customer["discountProfile"] == discountProfiles[i]["id"]) {
				discountProfiles[i]["selected"] = true;
				break;
			}
		}
		if (customer.expireDate != null) {
			customer.expireDate = tools_dateToString(new Date(customer.expireDate * 1000));
		}
	}
	var elements = {
		"customer": customer,
		"taxes": taxes,
		"tariffAreas": tariffAreas,
		"discountProfiles": discountProfiles,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/customer/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_customer_form, elements);
	document.getElementById('content').innerHTML = html;
}

function customers_saveCustomer() {
	let cust = Customer_fromForm("edit-customer-form");
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
	let custId = parseInt(document.getElementById("customer-balance-id").value);
	let balance = parseFloat(document.getElementById("edit-balance").value);
	gui_showLoading();
	// Update balance input
	document.getElementById("show-balance").value = balance;
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
	let cust = Customer_fromForm("edit-customer-form");
	if (!("id" in cust)) {
		cust.id = parseInt(response);
	}
	if (cust.expireDate != null) {
		cust.expireDate = cust.expireDate.getTime() / 1000
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

