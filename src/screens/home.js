function home_show() {
	var elements = {
		"server": "",
		"user": ""
	};
	if (appData.srv != null) {
		elements.server = appData.srv.host;
		elements.user = appData.srv.user;
	}
	var html = Mustache.render(view_login, elements);
	document.getElementById('content').innerHTML = html;
}

function home_sendLogin() {
	// Register login data
	var server = document.getElementById('user_server').value;
	var user = document.getElementById('user_login').value;
	var password = document.getElementById('user_pass').value;
	appData.srv = Pasteque.Connection(server, user, password);
	// Check connection and version
	Pasteque.srv_read(appData.srv, Pasteque.Request('api/version'), home_versionSuccess, home_error);
	gui_showLoading();
}

function home_versionSuccess(data) {
	console.info(data);
}

function home_error(req, status, message) {
	console.error(req + status + ': ' + message);
}
