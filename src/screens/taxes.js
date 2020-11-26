function taxes_show() {
	gui_showLoading();
	vue.screen.data = {taxes: []};
	storage_open(function(event) {
		storage_readStore("taxes", function(taxes) {
			vue.screen.data.taxes = taxes;
			vue.screen.component = "vue-tax-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function taxes_showTax(id) {
	gui_showLoading();
	if (id == null) {
		_taxes_showTax(Tax_default());
		gui_hideLoading();
	} else {
		storage_open(function(event) {
			storage_get("taxes", parseInt(id), function(tax) {
				_taxes_showTax(tax);
				storage_close();
			});
		});
	}
}
function _taxes_showTax(tax) {
	vue.screen.data = {
		tax: tax,
	}
	vue.screen.component = "vue-tax-form";
	gui_hideLoading();
}

function taxes_saveTax() {
	let tax = vue.screen.data.tax;
	gui_showLoading();
	srvcall_post("api/tax", tax, taxes_saveCallback);
}

function taxes_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, taxes_saveTax)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let tax = vue.screen.data.tax;
	if (!("id" in tax)) {
		let respTax = JSON.parse(response);
		tax.id = respTax["id"];
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("taxes", tax,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}
