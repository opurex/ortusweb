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
	var sortedCats = categories.sort(tools_sort("dispOrder", "reference"));
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
		for (let i = 0; i < categories.length; i++) {
			if (category["parent"] == categories[i]["id"]) {
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

function category_toggleImage() {
	let clearImage = document.getElementById("clear-image");
	let imgTag = document.getElementById("category-image");
	let imgInput = document.getElementById("edit-image");
	let deleteBtn = document.getElementById("toggle-image");
	if (clearImage.value == "0") {
		clearImage.value = "1";
		imgTag.classList.add("hidden");
		imgInput.value = "";
		imgInput.classList.add("hidden");
		deleteBtn.innerHTML = "Restaurer";
	} else {
		clearImage.value = "0";
		imgTag.classList.remove("hidden");
		imgInput.classList.remove("hidden");
		deleteBtn.innerHTML = "Supprimer";
	}
}

function category_saveCategory() {
	let cat = Category_fromForm("edit-category-form");
	gui_showLoading();
	if ("id" in cat) {
		srvcall_post("api/category", cat, category_saveCallback);
	} else {
		srvcall_put("api/category/" + cat["reference"], cat, category_saveCallback);
	}
}

function category_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
		return;
	}
	let cat = Category_fromForm("edit-category-form");
	if (!("id" in cat)) {
		cat.id = parseInt(response);
	}
	if ("image" in cat) {
		if (cat.image == null) {
			srvcall_delete("api/image/category/" + cat.id, function(request, status, response) {
				_category_saveCommit(cat);
			});
		} else {
			srvcall_patch("api/image/category/" + cat.id, cat.image, function(request, status, response) {
				_category_saveCommit(cat);
			});
		}
	} else {
		_category_saveCommit(cat);
	}
}

function _category_saveCommit(cat) {
	// Update in local database
	let catStore = appData.db.transaction(["categories"], "readwrite").objectStore("categories");
	delete cat.image;
	let req = catStore.put(cat);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}
