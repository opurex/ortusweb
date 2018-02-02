
var login_set = function(https, server, user, token) {
	localStorage.setItem("user", user);
	localStorage.setItem("server", server);
	if (https) { localStorage.setItem("https", "1"); }
	else { localStorage.setItem("https", "0"); }
}

var login_logout = function() {
	localStorage.removeItem("token");
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
	return localStorage.getItem("token");
}

var login_updateToken = function(token) {
	localStorage.setItem("token", token);
}

var login_revokeToken = function() {
	localStorage.removeItem("token");
}

/** Check if a JWT token is available
 * (considering the user has already logged in once). */
var login_isLogged = function() {
	return (sessionStorage.getItem("token") != null)
}

var login_sendLogin = function() {
	// Register login data
	var server = document.getElementById('user_server').value;
	var https = document.getElementById("user_https").checked;
	if (!server.startsWith("http")) {
		if (https) { server = "https://" + server; }
		else { server = "http://" + server; }
	}
	var user = document.getElementById('user_login').value;
	var password = document.getElementById('user_pass').value;
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
			var server = document.getElementById('user_server').value;
			var https = document.getElementById("user_https").checked;
			var user = document.getElementById('user_login').value;
			login_set(https, server, user);
			// Check compatibility
			// TODO
			// restart
			start();
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

var login_show = function() {
	var elements = {
		"server": login_getServer(),
		"user": login_getUser(),
		"https": login_getHttps()
	};
	if (appData.srv != null) {
		elements.server = appData.srv.host;
		elements.user = appData.srv.user;
	}
	var html = Mustache.render(view_login, elements);
	document.getElementById('content').innerHTML = html;
	if (login_getUser()) {
		document.getElementById("user_pass").focus();
	}
}

