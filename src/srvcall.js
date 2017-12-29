function _srvcall_send(target, method, params, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === XMLHttpRequest.DONE) {
			// Update the token.
			var token = request.getResponseHeader('Token');
			if (token != null) {
				login_updateToken(token);
			}
			if (request.status == 403) {	
				login_revokeToken();
			}
			callback(request, request.status, request.responseText);
		}
	};
	let dataStr = null;
	switch (method) {
	case "post":
	case "POST":
		var enc = function(data) {
			var str = (typeof data == 'object') ? JSON.stringify(data) : data;
			return encodeURI(str).replace('%20', '+');
		}
		dataStr = "";
		for (let key in params) {
		if (dataStr.length > 0) { dataStr += '&'; }
			dataStr += enc(key) + '=' + enc(params[key]);
		}
		request.open("POST", login_getHostUrl() + target);
		request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		break;
	case "get":
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

function srvcall_read(target, callback) {
	_srvcall_send(target, "GET", [], callback);
}
function srvcall_write	(target, data, callback) {
	_srvcall_send(target, "POST", data, callback);
}
