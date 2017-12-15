function categories_show() {
	gui_showLoading();
	let catStore = appData.db.transaction(["categories"], "readonly").objectStore("categories");
	let categories = [];
	catStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			categories.push(cursor.value);
			cursor.continue();
		} else {
			_categories_showCategories(categories);
		}
	}
}
function _categories_showCategories(categories) {
	gui_hideLoading();
	var sortedCats = categories.sort(function(a, b) { return a.dispOrder - b.dispOrder; });
	var elements = {
		"categories": sortedCats,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/category/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_categories, elements);
	document.getElementById('content').innerHTML = html;	
}

function categories_showCategory(id) {
	gui_showLoading();
	let catStore = appData.db.transaction(["categories"], "readonly").objectStore("categories");
	let categories = [];
	if (id != null) {
		let catReq = catStore.get(parseInt(id));
		catReq.onsuccess = function(event) {
			let category = event.target.result;
			catStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					categories.push(cursor.value);
					cursor.continue();
				} else {
					_categories_showCategory(category, categories);
				}
			}
		}
	} else {
		catStore.openCursor().onsuccess = function(event) {
			let cursor = event.target.result;
			if (cursor) {
				categories.push(cursor.value);
				cursor.continue();
			} else {
				_categories_showCategory(null, categories);
			}
		}
	}
}
function _categories_showCategory(category, categories) {
	gui_hideLoading();
	if (category != null && category["parent"] != null) {
		for (let i = 0; i < categories.length(); i++) {
			if (category["parent"] == categories[i][id]) {
				categories[i]["selected"] = true;
			}
		}
	}
	var elements = {
		"category": category,
		"categories": categories,
		"imgUrl": function() {
			return function (text, render) {
				return login_getHostUrl() + "/api/image/category/" + render(text) + "?Token=" + login_getToken();
			}
		}
	};
	var html = Mustache.render(view_category, elements);
	document.getElementById('content').innerHTML = html;		
}

function category_send(form) {
	let cat = Category.fromForm(form);
	app.srv.srv_write("api/category/write", cat);
}
