function paymentmodes_show() {
	gui_showLoading();
	let pmStore = appData.db.transaction(["paymentmodes"], "readonly").objectStore("paymentmodes");
	let paymentModes = [];
	vue.screen.data = {paymentModes: [], sort: "dispOrder"};
	vue.screen.component = "vue-paymentmode-list"
	pmStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			paymentModes.push(cursor.value);
			cursor.continue();
		} else {
			vue.screen.data.paymentModes = paymentModes.sort(tools_sort("dispOrder", "reference"));
			gui_hideLoading();
		}
	}
}

function paymentmodes_showPaymentMode(id) {
	gui_showLoading();
	let pmStore = appData.db.transaction(["paymentmodes"], "readonly").objectStore("paymentmodes");
	let paymentModes = [];
	if (id != null) {
		let pmReq = pmStore.get(parseInt(id));
		pmReq.onsuccess = function(event) {
			let paymentMode = event.target.result;
			pmStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					paymentModes.push(cursor.value);
					cursor.continue();
				} else {
					_paymentmodes_showPaymentMode(paymentMode, paymentModes);
				}
			}
		}
	} else {
		pmStore.openCursor().onsuccess = function(event) {
			let cursor = event.target.result;
			if (cursor) {
				paymentModes.push(cursor.value);
				cursor.continue();
			} else {
				_paymentmodes_showPaymentMode(PaymentMode_default(), paymentModes);
			}
		}
	}
}
function _paymentmodes_showPaymentMode(paymentMode, paymentModes) {
	vue.screen.data = {
		paymentMode: paymentMode,
		paymentModes: paymentModes,
		deleteImage: false,
		deleteImageButton: "Supprimer",
		hadImage: paymentMode.hasImage // Save for later check
	}
	vue.screen.component = "vue-paymentmode-form";
	gui_hideLoading();
}

function paymentmodes_toggleImage() {
	if (vue.screen.data.paymentMode.hasImage) {
		vue.screen.data.paymentMode.hasImage = false;
		vue.screen.data.deleteImage = true;
		document.getElementById("edit-image").value = "";
		vue.screen.data.deleteImageButton = "Restaurer";
	} else {
		vue.screen.data.paymentMode.hasImage = true;
		vue.screen.data.deleteImage = false;
		vue.screen.data.deleteImageButton = "Supprimer"
	}
}

function paymentmodes_savePaymentMode() {
	let pm = vue.screen.data.paymentMode;
	gui_showLoading();
	if ("id" in pm) {
		srvcall_post("api/paymentmode", pm, paymentmodes_saveCallback);
	} else {
		srvcall_put("api/paymentmode/" + pm["reference"], pm, paymentmodes_saveCallback);
	}
}

function paymentmodes_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, paymentmodes_savePaymentMode)) {
		return;
	}
	if (status == 400) {
		if (request.statusText == "Reference is already taken") {
			gui_showError("La référence existe déjà, veuillez en choisir une autre.");
			document.getElementById("edit-reference").focus(); // TODO: make this Vuejsy.
		} else {
			gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
		}
		gui_hideLoading();
		return;
	}
	let pm = vue.screen.data.paymentMode;
	if (!("id" in pm)) {
		let respPM = JSON.parse(response);
		pm.id = respPM["id"];
	}
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		pm.hasImage = false;
		srvcall_delete("api/image/paymentmode/" + pm.id, function(request, status, response) {
			_paymentmodes_saveCommit(pm);
		});
	} else if (imgTag.files.length != 0) {
		pm.hasImage = true;
		if (vue.screen.data.hadImage) {
			srvcall_patch("api/image/paymentmode/" + pm.id, imgTag.files[0], function(request, status, response) {
				_paymentmodes_saveCommit(pm);
			});
		} else {
			srvcall_put("api/image/paymentmode/" + pm.id, imgTag.files[0], function(request, status, response) {
				_paymentmodes_saveCommit(pm);
			});
		}
	} else {
		_paymentmodes_saveCommit(pm);
	}
}

function _paymentmodes_saveCommit(pm) {
	if (pm.hasImage) {
		// Force image refresh
		pm.hasImage = false;
		pm.hasImage = true;
	}
	// Update in local database
	let pmStore = appData.db.transaction(["paymentmodes"], "readwrite").objectStore("paymentmodes");
	document.getElementById("edit-image").value = "";
	let req = pmStore.put(pm);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}
