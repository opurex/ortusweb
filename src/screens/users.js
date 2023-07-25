function users_show() {
	gui_showLoading();
	vue.screen.data = {users: [], roles: []};
	storage_open(function(event) {
		storage_readStores(["users", "roles"], function(data) {
			let rolesByIds = {};
			for (let i = 0; i < data["roles"].length; i++) {
				rolesByIds[data["roles"][i].id] = data["roles"][i];
			}
			vue.screen.data.roles = rolesByIds;
			vue.screen.data.users = data["users"];
			vue.screen.component = "vue-user-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function users_showUser(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("roles", function(roles) {
			if (id != null) {
				storage_get("users", parseInt(id), function(user) {
					_users_showUser(user, roles);
					storage_close();
				});
			} else {
				_users_showUser(User_default(), roles);
				storage_close();
			}
		});
	});
}

function _users_showUser(user, roles) {
	let roleByIds = {};
	for (let i = 0; i < roles.length; i++) {
		roleByIds[roles[i].id] = roles[i];
	}
	vue.screen.data = {
		user: user,
		roles: roleByIds,
	}
	vue.screen.component = "vue-user-form";
	gui_hideLoading();
}

function user_saveUser() {
	let user = vue.screen.data.user;
	gui_showLoading();
	srvcall_post("api/user", user, user_saveCallback);
}

function user_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, user_saveUser)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let user = vue.screen.data.user;
	if (!("id" in user)) {
		let respUser = JSON.parse(response);
		user.id = respUser["id"];
	}
	_user_saveCommit(user);
}

function _user_saveCommit(user) {
	// Update in local database
	storage_open(function(event) {
		storage_write("users", user,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

function users_updatePassword() {
	let user = vue.screen.data.user;
	let password = document.getElementById("edit-reset-password").value;
	gui_showLoading();
	srvcall_post("api/user/" + encodeURIComponent(user.id) + "/password", {"oldPassword": user.password, "newPassword": password}, user_updPwdCallback);
}

function user_updPwdCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, users_updatePassword)) {
		return;
	}
	if (status == 400) {
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let respPwd = JSON.parse(response);
	if (respPwd != true) {
		gui_showError("Le mot de passe n'a pas pu être modifié.");
		gui_hideLoading();
	} else {
		gui_showMessage("Le mot de passe a été réinitialisé.");
		gui_hideLoading();
		// Store the updated password localy even if it is not encrypted yet (until next sync)
		storage_open(function(event) {
			let user = vue.screen.data.user;
			user.password = document.getElementById("edit-reset-password").value;
			storage_write("users", user, appData.localWriteDbSuccess,
				function(event) {
					gui_hideLoading();
					gui_showError("Le mot de passe a été réinitialisé mais une erreur est survenue<br />" + event.target.error);
					storage_close();
				});
		});
	}
}
