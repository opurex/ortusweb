var login_set = function(https, server, user) {
	localStorage.setItem("user", user);
	localStorage.setItem("server", server);
	if (https) { localStorage.setItem("https", "1"); }
	else { localStorage.setItem("https", "0"); }
}

var _login_remoteLogout = function() {
	sessionStorage.removeItem("token");
	// Close the local database and restart
	appData.db.close();
	appData.db = null;
	start();
}

var login_logout = function() {
	sessionStorage.removeItem("token");
	localStorage.setItem("logout", "1");
	localStorage.removeItem("logout");
	// Drop local database and restart
	storage_drop(function() {
		appData.db = null;
		start();
	}, function() {
		console.error("Could not drop local database");
	});
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
	if (token != null) {
		sessionStorage.setItem("token", token);
		localStorage.setItem("shareToken", "1" + token); // Share with other tabs
	} else {
		vue.login.loggedIn = false;
		sessionStorage.removeItem("token");
		localStorage.setItem("shareToken", "0");
	}
	localStorage.removeItem("shareToken");
}

var login_revokeToken = function() {
	login_updateToken(null);
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
	login_set(https, server, user);
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
	case 0:
		if (response == "") {
			gui_showError("Connexion refusée, le serveur " + login_getHostUrl() + " est-il correct ?");
			break;
		}
		// else nobreak
	default:
		gui_showError("Le serveur est indisponible (" + status + " : " + response + ").");
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

/* Share the sessionStorage (token) operations between tabs */
window.addEventListener("storage", function(event) {
	let origin = event.url.split("?")[0];
	let here = window.location.href.split("?")[0];
	if (origin != here) {
		return;
	}
	switch (event.key) {
		case "requestSessionStorage":
			if (event.newValue == "hey!") {
				let token = sessionStorage.getItem("token");
				if (token != null) {
					localStorage.setItem("shareSession", token);
					localStorage.removeItem("shareSession");
				}
			}
			break;
		case "shareSession":
			if (event.newValue != null && sessionStorage.length == 0) {
				let token = event.newValue;
				sessionStorage.setItem("token", token);
			}
			break;
		case "shareToken":
			if (event.newValue != null) {
				let code = event.newValue.charAt(0);
				if (code == "1") {
					sessionStorage.setItem("token", event.newValue.substring(1));
				} else {
					vue.login.loggedIn = false;
					sessionStorage.removeItem("token");
				}
			}
			break;
		case "logout":
			if (event.newValue != null) {
				vue.login.loggedIn = false;
				sessionStorage.removeItem("token");
			}
			break;
	}
});
// Request session from other tabs
if (sessionStorage.length == 0) {
	localStorage.setItem("requestSessionStorage", "hey!");
	localStorage.removeItem("requestSessionStorage");
}
