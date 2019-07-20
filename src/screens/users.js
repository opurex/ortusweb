function users_show() {
	gui_showLoading();
	let stores = appData.db.transaction(["users", "roles"], "readonly");
	let userStore = stores.objectStore("users");
	let users = [];
	let roles = []
	vue.screen.data = {users: [], roles: []};
	vue.screen.component = "vue-user-list"
	userStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			users.push(cursor.value);
			cursor.continue();
		} else {
			let roleStore = stores.objectStore("roles");
			roleStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					roles.push(cursor.value);
					cursor.continue();
				} else {
					let roleByIds = {};
					for (let i = 0; i < roles.length; i++) {
						roleByIds[roles[i].id] = roles[i];
					}
					vue.screen.data.roles = roleByIds;
					vue.screen.data.users = users;
					gui_hideLoading();
				}
			}
		}
	}
}

function users_showUser(id) {
	gui_showLoading();
	let db = appData.db.transaction(["users", "roles"], "readonly");
	let userStore = db.objectStore("users");
	let roleStore = db.objectStore("roles");
	let roles = [];
	if (id != null) {
		let userReq = userStore.get(parseInt(id));
		userReq.onsuccess = function(event) {
			let user = event.target.result;
			roleStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					roles.push(cursor.value);
					cursor.continue();
				} else {
					_users_showUser(user, roles);
				}
			}
		}
	} else {
		roleStore.openCursor().onsuccess = function(event) {
			let cursor = event.target.result;
			if (cursor) {
				roles.push(cursor.value);
				cursor.continue();
			} else {
				_users_showUser(User_default(), roles);
			}
		}
	}
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
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
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
	let userStore = appData.db.transaction(["users"], "readwrite").objectStore("users");
	let req = userStore.put(user);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}

function users_updatePassword() {
	let user = vue.screen.data.user;
	let password = document.getElementById("edit-reset-password").value;
	gui_showLoading();
	srvcall_post("api/user/" + user.id + "/password", {"oldPassword": user.password, "newPassword": password}, user_updPwdCallback);
}

function user_updPwdCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
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
		let user = vue.screen.data.user;
		user.password = document.getElementById("edit-reset-password").value;
		let userStore = appData.db.transaction(["users"], "readwrite").objectStore("users");
		let req = userStore.put(user);
		req.onsuccess = function(event) {
		}
		req.onerror = function(event) {
			gui_hideLoading();
			gui_showError("Le mot de passe a été réinitialisé mais une erreur est survenue<br />" + event.target.error);
		}
	}
}
