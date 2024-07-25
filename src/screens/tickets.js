
var _tickets_data = {};

function tickets_show() {
	let start = new Date();
	start.setHours(4);
	start.setMinutes(0);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "paymentmodes", "users", "customers"], function(data) {
			if (data["cashRegisters"].length > 0) {
				cr = data["cashRegisters"][0].id;
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"cashRegisters": data["cashRegisters"],
				"taxes": data["taxes"],
				"paymentModes": data["paymentmodes"],
				"users": data["users"],
				"customers": data["customers"],
				"cashRegisterId": cr
			};
			vue.screen.component = "vue-tickets-list";
		});
	});
}

function tickets_search() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	let crId = vue.screen.data.cashRegisterId;
	_tickets_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"crId": crId,
		"pages": 0,
		"currentPage": 0,
		"tickets": []
	};
	if (crId != "") {
		srvcall_get("api/ticket/search?count=1&cashRegister=" + encodeURIComponent(crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	} else {
		srvcall_get("api/ticket/search?count=1&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_countCallback);
	}
	gui_showLoading();
}

function _tickets_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_tickets_data.pages = pages;
	gui_showProgress(0, pages);
	if (_tickets_data.crId != "") {
		srvcall_get("api/ticket/search?limit=100&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	} else {
		srvcall_get("api/ticket/search?limit=100&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
	}
}

function _tickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, tickets_search)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = tickets.length - 1; i >= 0; i--) {
		_tickets_data.tickets.push(tickets[i]);
	}
	_tickets_data.currentPage++;
	if (_tickets_data.currentPage < _tickets_data.pages) {
		gui_showProgress(_tickets_data.currentPage, _tickets_data.pages);
		if (_tickets_data.crId != "") {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&cashRegister=" + encodeURIComponent(_tickets_data.crId) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		} else {
			srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _tickets_data.currentPage) + "&dateStart=" + _tickets_data.start + "&dateStop=" + _tickets_data.stop, _tickets_filterCallback);
		}
	} else {
		_tickets_dataRetreived();
	}
}

function _tickets_dataRetreived() {
	gui_hideLoading();
	Vue.set(vue.screen.data, "tableTitle", "Tickets du " + tools_dateToString(vue.screen.data.start) + " au " + tools_dateToString(vue.screen.data.stop));
	Vue.set(vue.screen.data, "tickets", _tickets_data.tickets);
}
