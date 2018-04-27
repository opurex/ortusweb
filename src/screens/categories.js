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
	var sortedCats = categories.sort(tools_sort("dispOrder", "reference"));
	vue.screen.data = {categories: sortedCats};
	vue.screen.component = "vue-category-list"
	gui_hideLoading();
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
				_categories_showCategory(Category_default(), categories);
			}
		}
	}
}
function _categories_showCategory(category, categories) {
	vue.screen.data = {
		category: category,
		categories: categories,
		deleteImage: false,
		deleteImageButton: "Supprimer",
		hadImage: category.hasImage // Save for later check
	}
	vue.screen.component = "vue-category-form";
	gui_hideLoading();
}

function category_toggleImage() {
	if (vue.screen.data.category.hasImage) {
		vue.screen.data.category.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restaurer";
	} else {
		vue.screen.data.category.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Supprimer"
	}
}

function category_saveCategory() {
	let cat = vue.screen.data.category;
	if (cat.parent == "") {
		cat.parent = null;
	}
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
	let cat = vue.screen.data.category;
	if (cat.parent == "") {
		cat.parent = null;
	}
	if (!("id" in cat)) {
		cat.id = parseInt(response);
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		cat.hasImage = false;
		srvcall_delete("api/image/category/" + cat.id, function(request, status, response) {
			_category_saveCommit(cat);
		});
	} else if (imgTag.files.length != 0) {
		cat.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/category/" + cat.id, imgTag.files[0], function(request, status, response) {
				_category_saveCommit(cat);
			});
		} else {
			srvcall_put("api/image/category/" + cat.id, imgTag.files[0], function(request, status, response) {
				_category_saveCommit(cat);
			});
		}
	} else {
		_category_saveCommit(cat);
	}
}

function _category_saveCommit(cat) {
	if (cat.hasImage) {
		// Force image refresh
		cat.hasImage = false;
		cat.hasImage = true;
	}
	// Update in local database
	let catStore = appData.db.transaction(["categories"], "readwrite").objectStore("categories");
	document.getElementById("edit-image").value = "";
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

