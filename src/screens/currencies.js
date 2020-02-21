function currencies_show() {
	gui_showLoading();
	vue.screen.data = {currencies: []};
	storage_readStore("currencies", function(currencies) {
		vue.screen.data.currencies = currencies;
		vue.screen.component = "vue-currency-list"
		gui_hideLoading();
	});
}

function currencies_showCurrency(id) {
	gui_showLoading();
	let currStore = appData.db.transaction(["currencies"], "readonly").objectStore("currencies");
	let currencies = [];
	if (id != null) {
		let currReq = currStore.get(parseInt(id));
		currReq.onsuccess = function(event) {
			let currency = event.target.result;
			storage_readStore("currencies", function(currencies) {
				_currencies_showCurrency(currency, currencies);
			});
		}
	} else {
		storage_readStore("currencies", function(currency) {
			_currencies_showCurrency(Currency_default(), currencies);
		});
	}
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
		srvcall_put("api/currency/" + curr["reference"], curr, currency_saveCallback);
	}
}

function currency_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, currency_saveCurrency)) {
		return;
	}
	if (status == 400) {
		if (request.statusText == "Reference is already taken") {
			gui_showError("La référence existe déjà, veuillez en choisir une autre.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		} else {
			gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
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
	let currStore = appData.db.transaction(["currencies"], "readwrite").objectStore("currencies");
	if (!vue.screen.data.wasMain && curr.main) {
		// Set main to false to the previously main currency
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
}

function _currency_saveCommit(curr) {
	storage_write("currencies", curr, function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}, function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	});
}
