function categories_show() {
	gui_showLoading();
	vue.screen.data = {categories: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			vue.screen.data.categories = categories;
			vue.screen.data.tree = true;
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
				_categories_showCategory(new RecordFactory(CategoryDef).create(), categories);
			}
		});
	});
}
function _categories_showCategory(category, categories) {
	vue.screen.data = {
		modelDef: CategoryDef,
		category: category,
		categories: categories,
		image: null,
	}
	vue.screen.component = "vue-category-form";
	gui_hideLoading();
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
		srvcall_put("api/category/" + encodeURIComponent(cat["reference"]), cat, category_saveCallback);
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
	srvcall_imageSave("category", cat, cat.id, vue.screen.data.image, _category_saveCommit);
}

function _category_saveCommit(cat) {
	if (vue.screen.data.image) {
		cat.hasImage = !vue.screen.data.image.delete;
		vue.screen.data.image = null; // Refresh form
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("categories", cat,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteOpenDbError);
}

function categories_showImport() {
	storage_open(function(event) {
		storage_readStores(["categories"], function(data) {
			vue.screen.data = {
				"categories": data.categories,
			}
			vue.screen.component = "vue-category-import";
			storage_close();
		});
	});
}

function _categories_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("categories", function(categories) {
			let parser = new CsvParser(CategoryDef, categories,
					[{modelDef: CategoryDef, "records": categories}]);
			let imported = parser.parseContent(fileContent);
			gui_hideLoading();
			storage_close();
			vue.screen.data.newCategories = imported.newRecords;
			vue.screen.data.editedCategories = imported.editedRecords;
			callback(imported);
		});
	});
}

function categories_saveCategories() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newCategories.length; i++) {
		let cat = vue.screen.data.newCategories[i];
		calls.push({id: "new-" + i, method: "PUT", target: "api/category/" + encodeURIComponent(cat.reference), data: cat});
	}
	for (let i = 0; i < vue.screen.data.editedCategories.length; i++) {
		let cat = vue.screen.data.editedCategories[i];
		let copy = {};
		for (key in cat) {
			if (key != "id")
				copy[key] = cat[key];
		}
		calls.push({id: "edit-" + i, method: "PATCH", target: "api/category/" + encodeURIComponent(cat.reference), data: copy});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, categories_saveMultipleCallback, _categories_progress);
}

function _categories_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function categories_saveMultipleCallback(results) {
	if (Object.keys(results).length > 0) {
		let res = results[Object.keys(results)[0]];
		let showMsg = function() {
			gui_hideLoading();
			gui_showWarning("Les données n'ont pas été envoyées, veuillez réitérer l'opération.");
		}
		if (srvcall_callbackCatch(res.request, res.status, res.response, showMsg)) {
			return;
		}
	}
	errors = [];
	saves = [];
	for (let reqId in results) {
		let request = results[reqId].request;
		let status = results[reqId].status;
		let response = results[reqId].response;
		if (status == 400) {
			let err = JSON.parse(response);
			if (err.error == "InvalidField") {
				errors.push("La référence " + err.value + " n'est pas unique. La catégorie n'a pas été enregistré.");
			} else {
				errors.push("Quelque chose cloche dans les données du formulaire. " + request.statusText);
			}
			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let cat = vue.screen.data.newCategories[num];
			let respCat = JSON.parse(response);
			cat.id = respCat.id;
			saves.push(cat);
		} else {
			let num = parseInt(reqId.substr(5));
			let cat = vue.screen.data.editedCategories[num];
			saves.push(cat);
		}
	}
	// Commit changes locally
	let commitSuccess = function(data) {
		gui_hideLoading();
		if (errors.length > 0) {
			if (saves.length > 0) {
				errors.push("Les autres enregistrements ont été pris en compte. Vous pouvez recharger le fichier pour retrouver les erreurs.");
			}
			gui_showError(errors);
		} else {
			gui_showMessage("Les données ont été enregistrées.");
		}
		vue.screen.data = {};
		vue.$refs.screenComponent.reset();
		categories_showImport();
	}
	if (saves.length == 0) {
		gui_hideLoading();
		if (errors.length == 0) {
			gui_showErrors("Aucune opération.");
		} else {
			gui_showErrors(errors);
		}
	} else {
		storage_open(function(event) {
			storage_write("categories", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
