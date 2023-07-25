function cashregisters_show() {
	gui_showLoading();
	storage_open(function(event) {
		let crStore = appData.db.transaction(["cashRegisters"], "readonly").objectStore("cashRegisters");
		let crs = [];
		vue.screen.data = {cashRegisters: []};
		storage_readStore("cashRegisters", function(cashRegisters) {
			vue.screen.data.cashRegisters = cashRegisters;
			vue.screen.component = "vue-cashregister-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function cashregisters_showCashRegister(id) {
	gui_showLoading();
	if (id != null) {
		storage_open(function(event) {
			storage_get("cashRegisters", parseInt(id), function(cashRegister) {
				_cashregisters_showCashRegister(cashRegister);
				storage_close();
			});
		});
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
	if (srvcall_callbackCatch(request, status, response, cashregister_saveCashRegister)) {
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
	storage_open(function(event) {
		storage_write("cashRegisters", cashRegister,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}
