function categories_show() {
	gui_showLoading();
	vue.screen.data = {categories: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			vue.screen.data.categories = categories;
			vue.screen.component = "vue-category-list"
			storage_close();
			gui_hideLoading();
		});
	});
}

function categories_showCategory(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			if (id != null) {
				storage_get("categories", parseInt(id), function(category) {
					_categories_showCategory(category, categories);
					storage_close();
				});
			} else {
				storage_close();
				_categories_showCategory(Category_default(), categories);
			}
		});
	});
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
	storage_open(function(event) {
		storage_write("categories", cat,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}

