
var login_set = function(https, server, user, token) {
	localStorage.setItem("user", user);
	localStorage.setItem("server", server);
	if (https) { localStorage.setItem("https", "1"); }
	else { localStorage.setItem("https", "0"); }
}

var login_logout = function() {
	sessionStorage.removeItem("token");
}

var login_getUser = function() {
	return localStorage.getItem("user");
}

var login_getHttps = function() {
	return localStorage.getItem("https") == "1";
}

var login_getServer = function() {
	return localStorage.getItem("server");
}

var login_getHostUrl = function() {
	var server = login_getServer();
	var https = login_getHttps();
	if (!server.startsWith("http")) {
		if (https) { server = "https://" + server; }
		else { server = "http://" + server; }
	}
	if (!server.endsWith("/")) {
		server += "/";
	}
	return server;
}

var login_getToken = function() {
	return sessionStorage.getItem("token");
}

var login_updateToken = function(token) {
	sessionStorage.setItem("token", token);
}

var login_revokeToken = function() {
	sessionStorage.removeItem("token");
}

/** Check if a JWT token is available
 * (considering the user has already logged in once). */
var login_isLogged = function() {
	return (sessionStorage.getItem("token") != null)
}

var login_sendLogin = function() {
	// Register login data
	var server = vue.login.server;
	var https = vue.login.https;
	if (!server.startsWith("http")) {
		if (https) { server = "https://" + server; }
		else { server = "http://" + server; }
	}
	var user = vue.login.user;
	var password = vue.login.password;
	login_set(https, server, user, null);
	// Check connection and version
	srvcall_post("api/login", {"user": user, "password": password}, login_loginCallback);
	gui_showLoading();
}

function login_loginCallback(request, status, response) {
	gui_hideLoading();
	gui_closeMessageBox();
	switch (status) {
	case 200:
		if (response != "null") {
			// Register data
			var server = vue.login.server;
			var https = vue.login.https;
			var user = vue.login.user;
			login_set(https, server, user);
			// Hide login screen and let content be shown
			vue.login.loggedIn = true;
			// Next operation
			if (_login_pendingOperation == null) {
				start();
			} else {
				let nextOperation = _login_pendingOperation;
				_login_pendingOperation = null;
				nextOperation();
			}
			break;
		}
		// else nobreak
	case 403:
		gui_showMessage("Utilisateur ou mot de passe invalide.");
		break;
	default:
		gui_showError("Erreur serveur : " + status + " " + response);
		break;
	}
}

/** Set the vue app data to show the loading screen. */
var login_show = function() {
	vue.login.loggedIn = false;
	vue.login.server = login_getServer();
	vue.login.user = login_getUser();
	vue.login.https = login_getHttps();
	vue.login.password = "";
	gui_hideLoading();
}

var _login_pendingOperation = null;
var login_setPendingOperation = function(functionVar) {
	_login_pendingOperation = functionVar;
}
