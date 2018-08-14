
var _salesbyproduct_data = {};

function salesbyproduct_show() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	start = tools_dateToString(start);
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	stop = tools_dateToString(stop);
	vue.screen.data = {
		"start": start,
		"stop": stop,
		"table": {
			"title": null,
			"columns": [
				{label: "Catégorie", visible: true},
				{label: "Reference", visible: true},
				{label: "Désignation", visible: true},
				{label: "Quantité", visible: true},
				{label: "HT", visible: false},
				{label: "Marge", visible: false},
			],
			"data": null,
		},
	}
	vue.screen.component = "vue-salesbyproduct";
}

function salesbyproduct_filter() {
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
		stop = new Date(stop[2], stop[1] - 1	, stop[0]);
	}
	_salesbyproduct_data = {"start": start.getTime() / 1000,
		"stop": stop.getTime() / 1000,
		"pages": 0,
		"currentPage": 0,
		"productsQty": {}};
	srvcall_get("api/ticket/search?count=1&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_countCallback);
	gui_showLoading();
}

function _salesbyproduct_countCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let count = parseInt(response);
	let pages = parseInt(count / 100);
	if (count % 100 > 0) {
		pages++;
	}
	_salesbyproduct_data.pages = pages;
	gui_showProgress(0, pages);
	srvcall_get("api/ticket/search?limit=100&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
}

function _salesbyproduct_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, salesbyproduct_filter)) {
		return;
	}
	let tickets = JSON.parse(response);
	for (let i = 0; i < tickets.length; i++) {
		let ticket = tickets[i];
		for (let j = 0; j < ticket.lines.length; j++) {
			let line = ticket.lines[j];
			if (line.product != null) {
				if (!(line.product in _salesbyproduct_data.productsQty)) {
					_salesbyproduct_data.productsQty[line.product] = 0;
				}
				_salesbyproduct_data.productsQty[line.product] += line.quantity;
			}
		}
	}
	_salesbyproduct_data.currentPage++;
	if (_salesbyproduct_data.currentPage < _salesbyproduct_data.pages) {
		gui_showProgress(_salesbyproduct_data.currentPage, _salesbyproduct_data.pages);
		srvcall_get("api/ticket/search?limit=100&offset=" + (100 * _salesbyproduct_data.currentPage) + "&dateStart=" + _salesbyproduct_data.start + "&dateStop=" + _salesbyproduct_data.stop, _salesbyproduct_filterCallback); 
	} else {
		_salesbyproduct_dataRetreived();
	}
}

function _salesbyproduct_dataRetreived() {
	gui_showLoading();
	let stores = appData.db.transaction(["cashRegisters", "categories", "products"], "readonly");
	let categories = [];
	let products = [];
	stores.objectStore("categories").openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			categories.push(cursor.value);
			cursor.continue();
		} else {
			stores.objectStore("products").openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					products.push(cursor.value);
					cursor.continue();
				} else {
					_salesbyproduct_render(categories, products);
				}
			}
		}
	}
}

function _salesbyproduct_render(categories, products) {
	// Sort for display
	let catById = [];
	for (let i = 0; i < categories.length; i++) {
		catById[categories[i].id] = categories[i];
		catById[categories[i].id].products = [];
	}
	let productsById = [];
	for (let i = 0; i < products.length; i++) {
		productsById[products[i].id] = products[i];
	}
	for (let id in _salesbyproduct_data.productsQty) {
		let prd = productsById[id];
		if (!prd) { continue; } // TODO: let produts not in sale anymore to appear
		prd.quantity = _salesbyproduct_data.productsQty[id];
		catById[prd.category].products.push(prd);
	}
	// Get non empty categories and sort their content
	let stats = [];
	for (let id in catById) {
		if (catById[id].products.length > 0) {
			catById[id].products = catById[id].products.sort(tools_sort("dispOrder", "reference"));
			stats.push(catById[id]);
		}
	}
	// Sort the categories
	stats = stats.sort(tools_sort("dispOrder", "reference"));
	// Prepare rendering
	let lines = [];
	for (let i = 0; i < stats.length; i++) {
		let cat = stats[i].label;
		for (let j = 0; j < stats[i].products.length; j++) {
			prd = stats[i].products[j];
			let line = [cat, prd.reference, prd.label, prd.quantity];
			line.push((prd.priceSell * prd.quantity).toLocaleString());
			if (prd.priceBuy > 0) {
				line.push(((prd.priceSell - prd.priceBuy) * prd.quantity).toLocaleString());
			} else {
				line.push("");
			}
			lines.push(line);
		}
	}
	vue.screen.data.table.title = "Ventes par produits du "
			+ vue.screen.data.start
			+ " au "
			+ vue.screen.data.stop;
	vue.screen.data.table.lines = lines;
	gui_hideLoading();
}

