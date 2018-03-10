function _srvcall_send(target, method, data, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === XMLHttpRequest.DONE) {
			// Update the token.
			var token = request.getResponseHeader('Token');
			if (token != null && token != "") {
				login_updateToken(token);
			} else {
				login_revokeToken();
			}
			callback(request, request.status, request.responseText);
		}
	};
	let dataStr = null;
	if (data != null) {
		dataStr = JSON.stringify(data);
	}
	switch (method) {
	case "PUT":
	case "POST":
	case "PATCH":
		request.open(method.toUpperCase(), login_getHostUrl() + target);
		request.setRequestHeader("Content-type", "application/json");
		break;
	case "GET":
	default:
		request.open("GET", login_getHostUrl() + target);
		break;
	}
	var token = login_getToken();
	if (token != null) {
		request.setRequestHeader("Token", token);
	}
	try {
		request.send(dataStr);
	} catch (error) {
		callback(request, request.status, error);
	}
}

function srvcall_get(target, callback) {
	_srvcall_send(target, "GET", null, callback);
}
function srvcall_post(target, data, callback) {
	_srvcall_send(target, "POST", data, callback);
}
function srvcall_put(target, data, callback) {
	_srvcall_send(target, "PUT", data, callback);
}
function srvcall_patch(target, data, callback) {
	_srvcall_send(target, "PATCH", data, callback);
}
function srvcall_delete(target, callback) {
	_srvcall_send(target, "DELETE", null, callback);
}

/** Helper class to get the default behaviour for faulty responses.
 * @return False if the response is ok to be used (it has not been catched).
 * True if the response has been catched and has already been proceeded. */
function srvcall_callbackCatch(request, status, response, pendingOperation) {
	switch (status) {
	case 200:
		return false;
		break;
	case 403:
		login_setPendingOperation(pendingOperation);
		login_show();
		gui_showMessage("La session a expiré");
		return true;
	default:
		login_show();
		gui_showError("Erreur serveur: " + status + " " + response);
		return true;
	}
}

