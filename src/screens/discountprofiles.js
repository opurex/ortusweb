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
