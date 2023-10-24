let _resources_caredResources = [
	"Printer.Ticket.Logo",
	"Printer.Ticket.Header",
	"Printer.Ticket.Footer",
	"MobilePrinter.Logo",
	"MobilePrinter.Header",
	"MobilePrinter.Footer"
];

function _resources_resType(label) {
	switch (label) {
		case "Printer.Ticket.Logo":
		case "MobilePrinter.Logo":
			return Resource_TYPE_IMAGE;
		case "Printer.Ticket.Header":
		case "Printer.Ticket.Footer":
		case "MobilePrinter.Header":
		case "MobilePrinter.Footer":
			return Resource_TYPE_TEXT;
	}
}

function _resources_careAbout(res) {
	let lbl = res.label;
	for (let i = 0; i < _resources_caredResources.length; i++) {
		if (res.label == _resources_caredResources[i]) {
			return true;
		}
	}
	return false;
}

function _resources_fill(resources) {
	let missingResources = [];
	for (let i = 0; i < _resources_caredResources.length; i++) {
		let missing = true;
		for (let j = 0; j < resources.length; j++) {
			if (_resources_caredResources[i] == resources[j].label) {
				missing = false;
				break;
			}
		}
		if (missing) {
			let res = Resource_default();
			res.label = _resources_caredResources[i];
			res.type = _resources_resType(res.label);
			_resources_fillCustomData(res);
			missingResources.push(res);
		}
	}
	for (let i = 0; i < missingResources.length; i++) {
		resources.push(missingResources[i]);
	}
}

function _resources_fillCustomData(res) {
	let lbl = res.label;
	switch (lbl) {
		case "Printer.Ticket.Logo":
			res.dispName = "Logo de ticket (Desktop)";
			res.dispOrder = 0;
			break;
		case "Printer.Ticket.Header":
			res.dispName = "En-tête de ticket (Desktop)";
			res.textWidth = 42;
			res.dispOrder = 1;
			break;
		case "Printer.Ticket.Footer":
			res.dispName = "Pied de ticket (Desktop)";
			res.textWidth = 42;
			res.dispOrder = 2;
			break;
		case "MobilePrinter.Logo":
			res.dispName = "Logo de ticket (Android)";
			res.dispOrder = 3;
			break;
		case "MobilePrinter.Header":
			res.dispName = "En-tête de ticket (Android)";
			res.textWidth = 32;
			res.dispOrder = 4;
			break;
		case "MobilePrinter.Footer":
			res.dispName = "Pied de ticket (Android)";
			res.textWidth = 32;
			res.dispOrder = 5;
			break;
	}
}

function _resource_unsetCustomData(res) {
	delete res.dispName;
	delete res.textWidth;
}

function resources_show() {
	gui_showLoading();
	storage_open(function(event) {
		let res = []
		storage_readStore("resources", function(resources) {
			for (let i = 0; i < resources.length; i++) {
				if (_resources_careAbout(resources[i])) {
					_resources_fillCustomData(resources[i]);
					res.push(resources[i]);
				}
			}
			_resources_fill(res);
			_resources_showResources(res);
			storage_close();
		});
	});
}

function _resources_showResources(resources) {
	gui_hideLoading();
	let sortedRes = resources.sort(tools_sort("dispOrder"));
	vue.screen.data = {
		"resources": sortedRes
	}
	vue.screen.component = "vue-resources-list";
}

function resources_showResource(resLabel) {
	gui_showLoading();
	if (resLabel == "option.customer.customFields") {
		storage_open(function(event) {
			storage_get("options", OPTION_CUSTOMER_FIELDS, function(opt) {
				if (typeof(opt) == "undefined") {
					opt = new Option(OPTION_CUSTOMER_FIELDS, "");
				}
				vue.screen.data = {
					option: opt
				};
				vue.screen.component="vue-customercontact";
			});
		});
		return;
	}
	storage_open(function(event) {
		storage_get("resources", resLabel, function(res) {
			if (typeof(res) == "undefined") {
				res = Resource_default();
				res.label = resLabel;
				res.type = _resources_resType(res.label);
			}
			_resources_fillCustomData(res);
			vue.screen.data = {
				resource: res,
				deleteImage: false,
				resTypes: {"Resource_TYPE_TEXT": Resource_TYPE_TEXT}, // Phoque
				hasImage: res.content != null,
				hadImage: res.content != null,
				deleteContentButton: "Supprimer",
			};
			if (res.type == Resource_TYPE_IMAGE) {
			}
			vue.screen.component = "vue-resource-form";
			gui_hideLoading();
			storage_close();
		});
	});
}

function resources_toggleImage() {
	if (vue.screen.data.hasImage) {
		vue.screen.data.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteContentButton = "Restaurer";
	} else {
		vue.screen.data.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteContentButton = "Supprimer";
	}
}

function resources_saveResource() {
	let res = vue.screen.data.resource;
	_resource_unsetCustomData(res);
	gui_showLoading();
	if (res.type == Resource_TYPE_TEXT) {
		if (res.content == "") {
			srvcall_delete("api/resource/" + encodeURIComponent(res.label), _resources_saveCallback);
		} else {
			srvcall_post("api/resource", res, _resources_saveCallback);
		}
	} else {
		if (vue.screen.data.deleteImage) {
			srvcall_delete("api/resource/" + encodeURIComponent(res.label), _resources_saveCallback);
		} else {
			let imgTag = document.getElementById("edit-image");
			if (imgTag.files.length != 0) {
				let reader = new FileReader();
				reader.onload = function(event) {
					let fileContent = btoa(event.target.result);
					res.content = fileContent;
					srvcall_post("api/resource", res, _resources_saveCallback);
				};
				reader.onerror = function(event) {
					gui_hideLoading();
					gui_showError("Le fichier n'a pu être envoyé");
				}
				reader.readAsBinaryString(imgTag.files[0]);
			} else {
				gui_hideLoading();
				gui_showMessage("Les modifications ont été enregistrées");
			}
		}
	}
}

function _resources_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, resources_saveResource)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	_resources_saveCommit(vue.screen.data.resource);
}

function _resources_saveCommit(res) {
	if (res.hasImage) {
		// Force image refresh
		res.hasImage = false;
		res.hasImage = true;
	}
	// Update in local database
	storage_open(function(event) {
		if (res.type == Resource_TYPE_TEXT && res.content == "") {
			storage_delete("resources", res.label,
				appData.localWriteDbSuccess, appData.localWriteDbError);
		} else {
			storage_write("resources", res, function(event) {
				appData.localWriteDbSuccess(event);
				_resources_fillCustomData(res);
			}, appData.localWriteDbError);
		}
	}, appData.localWriteDbOpenError);
}

function resources_saveCustomFields(option) {
	if (arguments.length == 0) {
		option = vue.screen.data.option;
	} else {
		vue.screen.data.option = option;
	}
	srvcall_post("api/option", option, _resources_saveCustomFieldsCallback);
}

function _resources_saveCustomFieldsCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, resources_saveCustomFields)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	_resources_saveCustomFieldsCommit(vue.screen.data.option);
}

function _resources_saveCustomFieldsCommit(option) {
	// Update in local database
	storage_open(function(event) {
		storage_write("options", option, function(event) {
			appData.localWriteDbSuccess(event);
		}, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
