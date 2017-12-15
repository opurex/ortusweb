
var login_set = function(https, server, user, token) {
	localStorage.setItem("user", user);
	localStorage.setItem("server", server);
	if (https) { localStorage.setItem("https", "1"); }
	else { localStorage.setItem("https", "0"); }
	localStorage.setItem("token", token); // TODO use cookie
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
	return server;
}

var login_getToken = function() {
	return localStorage.getItem("token");
}

var login_updateToken = function(token) {
	sessionStorage.setItem("token", token);
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
	appData.srv = Pasteque.Connection(server, user, password);
	// Check connection and version
	Pasteque.srv_read(appData.srv, Pasteque.Request('api/version'), login_versionSuccess, login_error);
	gui_showLoading();
}

function login_versionSuccess(data, token) {
	// Register data
	var server = document.getElementById('user_server').value;
	var https = document.getElementById("user_https").checked;
	login_set(https, server, document.getElementById("user_login").value, token);
	// Check compatibility
	// TODO
	// restart
	start();
}

function login_error(req, status, message) {
	console.error(req + status + ': ' + message);
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

