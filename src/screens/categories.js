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
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		cat.hasImage = false;
		srvcall_delete("api/image/category/" + encodeURIComponent(cat.id), function(request, status, response) {
			_category_saveCommit(cat);
		});
	} else if (imgTag.files.length != 0) {
		cat.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/category/" + encodeURIComponent(cat.id), imgTag.files[0], function(request, status, response) {
				_category_saveCommit(cat);
			});
		} else {
			srvcall_put("api/image/category/" + encodeURIComponent(cat.id), imgTag.files[0], function(request, status, response) {
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
	let csv = new CSV(fileContent, {header: true, cast: false});
	let rawCategories = csv.parse();
	if (rawCategories.length == 0) {
		callback({newProducts: [], editedProducts: [], unchangedProducts: [],
			unknownColumns: [], errors: []});
	}
	gui_showLoading();
	let columnMappingDef = {
		reference: "reference",
		"référence": "reference",
		label: "label",
		"désignation": "label",
		"parent": "parent",
		disporder: "dispOrder",
		"ordre": "dispOrder",
	};
	columnMapping = {};
	unknownColumns = [];
	for (let key in rawCategories[0]) {
		if (key.toLowerCase() in columnMappingDef) {
			columnMapping[key] = columnMappingDef[key.toLowerCase()];
		} else {
			unknownColumns.push(key);
		}
	}
	let newCategories = [];
	let editedCategories = [];
	let editedValues = [];
	let unchangedCategories = [];
	let errors = [];
	storage_open(function(event) {
		storage_readStores(["categories"], function(data) {
			// Map by reference for easy mapping
			let categories = data["categories"];
			let categoryByRef = [];
			let categoryByLabel = [];
			for (let i = 0; i < categories.length; i++) {
				categoryByRef[categories[i].reference] = categories[i];
				categoryByLabel[categories[i].label] = categories[i];
			}
			// Convert the incoming csv lines to category data
			function mapValues(line, mapping) {
				let ret = {};
				for (key in line) {
					if (key in mapping) {
						ret[mapping[key]] = line[key];
					}
				}
				return ret;
			}
			function convertBool(value) {
				return (value != "0" && value != 0 && value != "");
			}
			function convertNum(value) {
				let v = value.replace(",", ".");
				v = v.replace(" ", "");
				return parseFloat(v);
			}
			function convertValues(value) {
				if ("dispOrder" in value)
					value.dispOrder = parseInt(value.dispOrder);
				return value;
			}
			for (let i = 0; i < rawCategories.length; i++) {
				let value = mapValues(rawCategories[i], columnMapping);
				value = convertValues(value);
				// Find parent category id
				let parentCategoryId = null;
				if ("parent" in value && value.parent != "") {
					if (value.parent in categoryByRef) {
						categoryId = categoryByRef[value.parent].id
						value.parent = categoryId;
					} else if (value.category in categoryByLabel) {
						categoryId = categoryByLabel[value.parent].id
						value.parent = categoryId;
					} else if (value) {
						errors.push({line: i + 2, error: "Le champ parent est invalide."});
						continue;
					}
				} else {
					value.parent = null;
				}
				// Load or create a new product
				let cat = null;
				let newCategory = !(value.reference in categoryByRef);
				if (newCategory) {
					cat = Category_default();
				} else {
					cat = categoryByRef[value.reference];
				}
				// Merge values
				let editedVals = [];
				let changed = false;
				for (key in value) {
					if (isNaN(value[key])) {
						// Error
					}
					if (cat[key] != value[key]) {
						editedVals[key] = true;
						changed = true;
						cat[key] = value[key];
					}
				}
				// Put into the return values
				if (newCategory) {
					newCategories.push(cat);
				} else {
					if (changed) {
						editedCategories.push(cat)
						editedValues.push(editedVals);
					} else {
						unchangedCategories.push(cat);
					}
				}
			}
			// Done
			gui_hideLoading();
			storage_close();
			vue.screen.data.newCategories = newCategories;
			vue.screen.data.editedCategories = editedCategories;
			callback({newCategories: newCategories, editedCategories: editedCategories,
					editedValues: editedValues,
					unchangedCategories: unchangedCategories,
					unknownColumns: unknownColumns, errors: errors});
		});
	});
}

function categories_saveCategories() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newCategories.length; i++) {
		let cat = vue.screen.data.newCategories[i];
		calls.push({id: "new-" + i, method: "PUT", target: "api/category/" + cat.reference, data: cat});
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
