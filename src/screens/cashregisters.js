function cashregisters_show() {
	gui_showLoading();
	let crStore = appData.db.transaction(["cashRegisters"], "readonly").objectStore("cashRegisters");
	let crs = [];
	vue.screen.data = {cashRegisters: []};
	vue.screen.component = "vue-cashregister-list"
	crStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			crs.push(cursor.value);
			cursor.continue();
		} else {
			vue.screen.data.cashRegisters = crs;
			gui_hideLoading();
		}
	}
}

function cashregisters_showCashRegister(id) {
	gui_showLoading();
	let crStore = appData.db.transaction(["cashRegisters"], "readonly").objectStore("cashRegisters");
	if (id != null) {
		let crReq = crStore.get(parseInt(id));
		crReq.onsuccess = function(event) {
			let cashRegister = event.target.result;
			_cashregisters_showCashRegister(cashRegister);
		}
	} else {
		_cashregisters_showCashRegister(CashRegister_default());
	}
}
function _cashregisters_showCashRegister(cashRegister) {
	vue.screen.data = {
		cashRegister: cashRegister,
	}
	vue.screen.component = "vue-cashregister-form";
	gui_hideLoading();
}

function cashregister_saveCashRegister() {
	let cashRegister = vue.screen.data.cashRegister;
	gui_showLoading();
	srvcall_post("api/cashregister", cashRegister, cashregister_saveCallback);
}

function cashregister_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let cashRegister = vue.screen.data.cashRegister;
	if (!("id" in cashRegister)) {
		let respCr = JSON.parse(response);
		cashRegister.id = respCr["id"];
	}
	_cashregister_saveCommit(cashRegister);
}

function _cashregister_saveCommit(cashRegister) {
	// Update in local database
	let crStore = appData.db.transaction(["cashRegisters"], "readwrite").objectStore("cashRegisters");
	let req = crStore.put(cashRegister);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}
