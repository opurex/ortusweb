let _resources_caredResources = [
	"Printer.Ticket.Logo",
	"Printer.Ticket.Header",
	"Printer.Ticket.Footer",
	"MobilePrinter.Ticket.Logo",
	"MobilePrinter.Ticket.Header",
	"MobilePrinter.Ticket.Footer"
];

function _resources_resType(label) {
	switch (label) {
		case "Printer.Ticket.Logo":
		case "MobilePrinter.Ticket.Logo":
			return Resource_TYPE_IMAGE;
		case "Printer.Ticket.Header":
		case "Printer.Ticket.Footer":
		case "MobilePrinter.Ticket.Header":
		case "MobilePrinter.Ticket.Footer":
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
		case "MobilePrinter.Ticket.Logo":
			res.dispName = "Logo de ticket (Android)";
			res.dispOrder = 3;
			break;
		case "MobilePrinter.Ticket.Header":
			res.dispName = "En-tête de ticket (Android)";
			res.textWidth = 32;
			res.dispOrder = 4;
			break;
		case "MobilePrinter.Ticket.Footer":
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
	let resStore = appData.db.transaction(["resources"], "readonly").objectStore("resources");
	let resources = [];
	resStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			if (_resources_careAbout(cursor.value)) {
				_resources_fillCustomData(cursor.value);
				resources.push(cursor.value);
			}
			cursor.continue();
		} else {
			_resources_fill(resources);
			_resources_showResources(resources);
		}
	}
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
	let resStore = appData.db.transaction(["resources"], "readonly").objectStore("resources");
	let resReq = resStore.get(resLabel);
	resReq.onsuccess = function(event) {
		let res = event.target.result;
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
	}
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
			srvcall_delete("api/resource/" + res.label, _resources_saveCallback);
		} else {
			srvcall_post("api/resource", res, _resources_saveCallback);
		}
	} else {
		if (vue.screen.data.deleteImage) {
			srvcall_delete("api/resource/" + res.label, _resources_saveCallback);
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
	let resStore = appData.db.transaction(["resources"], "readwrite").objectStore("resources");
	let req;
	if (res.type == Resource_TYPE_TEXT && res.content == "") {
		req = resStore.delete(res.label);
	} else {
		req = resStore.put(res);
	}
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
	_resources_fillCustomData(res);
}
