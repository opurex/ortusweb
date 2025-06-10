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
	let dataSend = null;
	let dataType = null;
	if (data instanceof File) {
		dataType = "application/octet-stream";
	} else if (data != null) {
		dataType = "application/json";
		dataSend = JSON.stringify(data);
	}
	switch (method) {
	case "PUT":
	case "POST":
	case "PATCH":
	case "DELETE":
		request.open(method.toUpperCase(), login_getHostUrl() + target);
		break;
	case "GET":
	default:
		request.open("GET", login_getHostUrl() + target);
		break;
	}
	if (dataType != null) {
		request.setRequestHeader("Content-type", dataType);
	}
	var token = login_getToken();
	if (token != null) {
		request.setRequestHeader("Token", token);
	}
	try {
		if (data instanceof File) {
			let reader = new FileReader();
			reader.onload = function() {
				request.send(reader.result);
			}
			reader.readAsArrayBuffer(data)
		} else {
			request.send(dataSend);
		}
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

function srvcall_multicall(calls, callback, progressCallback) {
	if (arguments.length < 3) {
		progressCallback = null;
	}
	let results = {};
	let finished = [];
	let callbackCalled = false;
	for (let i = 0; i < calls.length; i++) {
		results[calls[i].id] = {request: null, status: null, response: null};
		finished.push(false);
	}
	let callCallback = function(id, index) {
		return function(request, status, response) {
				if (progressCallback != null) {
					progressCallback();
				}
				let result = results[id];
				result.request = request;
				result.status = status;
				result.response = response;
				finished[index] = true;
				for (let k = 0; k < finished.length; k++) {
					if (finished[k] == false) {
						return;
					}
				}
				if (callbackCalled == false) {
					callbackCalled = true;
					callback(results);
				}
		};
	}
	for (let i = 0; i < calls.length; i++) {
		let singleCall = calls[i];
		switch (singleCall.method.toUpperCase()) {
			case "GET":
				srvcall_get(singleCall.target, callCallback(singleCall.id, i));
				break;
			case "POST":
				srvcall_post(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "PUT":
				srvcall_put(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "PATCH":
				srvcall_patch(singleCall.target, singleCall.data, callCallback(singleCall.id, i));
				break;
			case "DELETE":
				srvcall_delete(singleCall.target, callCallback(singleCall.id, i));
				break;
			default:
				console.error("Unkown method call " + singleCall.method);
		}
	}
}

function srvcall_imageUrl(modelClass, model) {
	if (arguments.length == 2 && model.hasImage) {
		return login_getHostUrl() + "/api/image/" + modelClass + "/" + model.id + "?Token=" + login_getToken();
	} else {
		return login_getHostUrl() + "/api/image/" + modelClass + "/default?Token=" + login_getToken();
	}
}

/** Send a request to write/update/delete an image from a vue-input-image component.
 * @param modelName The model name that is put in the url, for example "category".
 * @param record The record to update it's image. It must have hasImage set to it's previous state.
 * I.e. false if a new image is set, true if the image is updated or deleted.
 * @param modelId The id that is put in the url. Generaly record.id but subrecords have a different modelId.
 * @param newImage An object retreived from a vue-input-image component.
 * @param callback The function called after the api call, with the untouched record as parameter.
 */
function srvcall_imageSave(modelName, record, modelId, newImage, callback) {
	let hadImage = record.hasImage;
	if (hadImage && newImage && newImage.delete) {
		srvcall_delete("api/image/" + modelName + "/" + encodeURIComponent(modelId), function(request, status, response) {
			callback(record);
		});
	} else if (newImage && newImage.file) {
		if (hadImage) {
			srvcall_patch("api/image/" + modelName + "/" + encodeURIComponent(modelId), newImage.file, function(request, status, response) {
				callback(record);
			});
		} else {
			srvcall_put("api/image/" + modelName + "/" + encodeURIComponent(modelId), newImage.file, function(request, status, response) {
				callback(record);
			});
		}
	} else {
		callback(record);
	}
}

/** Helper class to get the default behaviour for faulty responses.
 * @return False if the response is ok to be used (it has not been catched).
 * True if the response has been catched and has already been proceeded. */
function srvcall_callbackCatch(request, status, response, pendingOperation) {
	switch (status) {
	case 200:
	case 400:
		return false;
		break;
	case 403:
		login_setPendingOperation(pendingOperation);
		login_show();
		gui_showMessage("The session has expired. Please resend your credentials to confirm the current operation.");
		return true;
	default:
		login_show();
		gui_showError("Server error: " + status + " " + response);
		return true;
	}
}

