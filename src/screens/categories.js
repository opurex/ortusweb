function categories_show() {
	gui_showLoading();
	vue.screen.data = {categories: [], sort: "dispOrder"};
	vue.screen.component = "vue-category-list"
	storage_readStore("categories", function(categories) {
		vue.screen.data.categories = categories;
		gui_hideLoading();
	});
}

function categories_showCategory(id) {
	gui_showLoading();
	let catStore = appData.db.transaction(["categories"], "readonly").objectStore("categories");
	let categories = [];
	if (id != null) {
		let catReq = catStore.get(parseInt(id));
		catReq.onsuccess = function(event) {
			let category = event.target.result;
			storage_readStore("categories", function(categories) {
				_categories_showCategory(category, categories);
			});
		}
	} else {
		storage_readStore("categories", function(categories) {
			_categories_showCategory(Category_default(), categories);
		});
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
	let cat = vue.screen.data.category;
	if (cat.parent == "") {
		cat.parent = null;
	}
	if (!("id" in cat)) {
		let respCat = JSON.parse(response);
		cat.id = respCat["id"];
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
	storage_write("categories", cat, function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}, function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	});
}

