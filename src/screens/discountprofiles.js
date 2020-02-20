function discountprofiles_show() {
	gui_showLoading();
	vue.screen.data = {discountProfiles: []};
	storage_readStore("discountprofiles", function(profiles) {
		vue.screen.data.discountProfiles = profiles;
		vue.screen.component = "vue-discountprofile-list"
		gui_hideLoading();
	});
}

function discountprofiles_showProfile(id) {
	gui_showLoading();
	let dpStore = appData.db.transaction(["discountprofiles"], "readonly").objectStore("discountprofiles");
	let profiles = [];
	if (id != null) {
		let dpReq = dpStore.get(parseInt(id));
		dpReq.onsuccess = function(event) {
			let dp = event.target.result;
			storage_readStore("discountprofiles", function(profiles) {
				_discountprofiles_showProfile(dp, profiles);
			});
		}
	} else {
		storage_readStore("discountprofiles", function(profiles) {
			_discountprofiles_showProfile(DiscountProfile_default(), profiles);
		});
	}
}
function _discountprofiles_showProfile(profile, profiles) {
	vue.screen.data = {
		discountProfile: profile,
		discountProfiles: profiles,
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
	storage_write("discountprofiles", profile, function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}, function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	});
}
