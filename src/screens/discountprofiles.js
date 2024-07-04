function discountprofiles_show() {
	gui_showLoading();
	vue.screen.data = {discountProfiles: []};
	storage_open(function(event) {
		storage_readStore("discountprofiles", function(profiles) {
			vue.screen.data.discountProfiles = profiles;
			vue.screen.component = "vue-discountprofile-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function discountprofiles_showProfile(id) {
	gui_showLoading();
	if (id != null) {
		storage_open(function(event) {
			storage_get("discountprofiles", parseInt(id), function(dp) {
				_discountprofiles_showProfile(dp);
				storage_close();
			});
		});
	} else {
		_discountprofiles_showProfile(DiscountProfile_default());
	}
}

function _discountprofiles_showProfile(profile) {
	vue.screen.data = {
		discountProfile: profile,
	}
	vue.screen.component = "vue-discountprofile-form";
	gui_hideLoading();
}

function discountprofile_saveProfile() {
	let profile = vue.screen.data.discountProfile;
	gui_showLoading();
	srvcall_post("api/discountprofile", profile, discountprofile_saveCallback);
}

function discountprofile_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, discountprofile_saveProfile)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let profile = vue.screen.data.discountProfile;
	if (!("id" in profile)) {
		let respProfile = JSON.parse(response);
		profile.id = respProfile["id"];
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("discountprofiles", profile,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function discountprofiles_showImport() {
	vue.screen.data = {};
	vue.screen.component = "vue-discountprofile-import";
}

function _discountprofiles_parseCsv(fileContent, callback) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("discountprofiles", function(discountProfiles) {
			let parser = new CsvParser(DiscountProfileDef, discountProfiles, []);
			let imported = parser.parseContent(fileContent);
			storage_close();
			gui_hideLoading();
			vue.screen.data.newProfiles = imported.newRecords;
			vue.screen.data.editedProfiles = imported.editedRecords;
			callback(imported);
		});
	});
}

function discountprofiles_saveDiscountProfiles() {
	let calls = [];
	for (let i = 0; i < vue.screen.data.newProfiles.length; i++) {
		let profile = vue.screen.data.newProfiles[i];
		calls.push({id: "new-" + i, method: "POST", target: "api/discountprofile", data: profile});
	}
	for (let i = 0; i < vue.screen.data.editedProfiles.length; i++) {
		let profile = vue.screen.data.editedProfiles[i];
		calls.push({id: "edit-" + i, method: "POST", target: "api/discountprofile", data: profile});
	}
	vue.screen.data.progress = 0;
	vue.screen.data.progressTotal = calls.length;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
	srvcall_multicall(calls, discountprofiles_saveMultipleCallback, _discountprofiles_progress);
}

function _discountprofiles_progress() {
	vue.screen.data.progress++;
	gui_showProgress(vue.screen.data.progress, vue.screen.data.progressTotal);
}

function discountprofiles_saveMultipleCallback(results) {
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
			errors.push("Quelque chose cloche dans les données du formulaire. " + request.statusText);
			continue;
		}
		if (reqId.substr(0, 4) == "new-") {
			let num = parseInt(reqId.substr(4));
			let profile = vue.screen.data.newProfiles[num];
			let respProfile = JSON.parse(response);
			profile.id = respProfile.id;
			saves.push(profile);
		} else {
			let num = parseInt(reqId.substr(5));
			let profile = vue.screen.data.editedProfiles[num];
			saves.push(profile);
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
		discountprofiles_showImport();
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
			storage_write("discountprofiles", saves,
				commitSuccess, appData.localWriteDbError);
		}, appData.localWriteDbOpenError);
	}
}
