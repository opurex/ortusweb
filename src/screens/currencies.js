function currencies_show() {
	gui_showLoading();
	vue.screen.data = {currencies: []};
	storage_open(function(event) {
		storage_readStore("currencies", function(currencies) {
			vue.screen.data.currencies = currencies;
			vue.screen.component = "vue-currency-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function currencies_showCurrency(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("currencies", function(currencies) {
			if (id != null) {
				storage_get("currencies", parseInt(id), function(currency) {
					_currencies_showCurrency(currency, currencies);
					storage_close();
				});
			} else {
				_currencies_showCurrency(Currency_default(), currencies);
				storage_close();
			}
		});
	});
}
function _currencies_showCurrency(currency, currencies) {
	let wasMain = false;
	if (currency.main) {
		wasMain = true; // force by value
	}
	vue.screen.data = {
		currency: currency,
		currencies: currencies,
		wasMain: wasMain,
	}
	vue.screen.component = "vue-currency-form";
	gui_hideLoading();
}

function currency_saveCurrency() {
	let curr = vue.screen.data.currency;
	gui_showLoading();
	if ("id" in curr) {
		srvcall_post("api/currency", curr, currency_saveCallback);
	} else {
		srvcall_put("api/currency/" + encodeURIComponent(curr["reference"]), curr, currency_saveCallback);
	}
}

function currency_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, currency_saveCurrency)) {
		return;
	}
	if (status == 400) {
		if (request.statusText === "Reference is already taken") {
			gui_showError("The reference already exists. Please choose another one.");
			document.getElementById("edit-reference").focus(); // TODO: Make this Vue-friendly.
		} else {
			gui_showError("Something's wrong with the form data. " + request.statusText);
		}

		gui_hideLoading();
		return;
	}
	let curr = vue.screen.data.currency;
	if (!("id" in curr)) {
		let respCurr = JSON.parse(response);
		curr.id = respCurr["id"];
	}
	// Update in local database
	storage_open(function(event) {
		if (!vue.screen.data.wasMain && curr.main) {
			// Set main to false to the previously main currency
			let currStore = appData.db.transaction(["currencies"], "readwrite").objectStore("currencies");
			currStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					let oldCurr = cursor.value;
					if (oldCurr.main) {
						oldCurr.main = false;
						storage_write("currencies", oldCurr, function(event) {
							_currency_saveCommit(curr);
							return;
						});
					}
					cursor.continue();
				} else {
					_currency_saveCommit(curr);
				}
			};
		} else {
			_currency_saveCommit(curr);
		}
	});
}

function _currency_saveCommit(curr) {
	storage_write("currencies", curr,
		appData.localWriteDbSuccess, appData.localWriteDbError);
}
