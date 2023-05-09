function paymentmodes_show() {
	gui_showLoading();
	vue.screen.data = {paymentModes: [], sort: "dispOrder"};
	storage_open(function(event) {
		storage_readStores(["paymentmodes", "roles"], function(data) {
			vue.screen.data.paymentModes = data.paymentmodes.sort(tools_sort("dispOrder", "reference"));
			vue.screen.data.paymentModes.forEach(pm => {
				pm.roles = [];
				data.roles.forEach(role => {
					if (role.permissions.indexOf("payment." + pm.reference) != -1) {
						pm.roles.push(role.name);
					}
				});
			});
			vue.screen.component = "vue-paymentmode-list";
			gui_hideLoading();
			storage_close();
			let cashWarning = (!data.paymentmodes.find(pm => pm.reference == "cash"));
			vue.screen.data.cashWarning = cashWarning;
		});
	});
}

function paymentmodes_showPaymentMode(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("paymentmodes", function(paymentModes) {
			if (id!= null) {
				storage_get("paymentmodes", parseInt(id), function(paymentMode) {
					_paymentmodes_showPaymentMode(paymentMode, paymentModes);
					storage_close();
				});
			} else {
				_paymentmodes_showPaymentMode(PaymentMode_default(), paymentModes);
				storage_close();
			}
		});
	});
}

function _paymentmodes_showPaymentMode(paymentMode, paymentModes) {
	let hadValueImage = {};
	let deleteValueImage = {};
	let deleteValueImageButton = {};
	for (let i = 0; i < paymentMode.values.length; i++) {
		let pmValue = paymentMode.values[i];
		hadValueImage[pmValue.value] = pmValue.hasImage;
		deleteValueImage[pmValue.value] = false;
		deleteValueImageButton[pmValue.value] = "Supprimer";
	}
	vue.screen.data = {
		paymentMode: paymentMode,
		paymentModes: paymentModes,
		deleteImage: false,
		deleteImageButton: "Supprimer",
		hadImage: paymentMode.hasImage, // Save for later check
		hadValueImage: hadValueImage,
		deleteValueImage: deleteValueImage,
		deleteValueImageButton: deleteValueImageButton,
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

function paymentmodes_toggleValueImage(pmValue) {
	if (pmValue.hasImage) {
		pmValue.hasImage = false;
		vue.screen.data.deleteValueImage[pmValue.value] = true;
		let imgTag = document.getElementById("edit-image-" + pmValue.value);
		if (imgTag != null) {
			imgTag.value = "";
		}
		vue.screen.data.deleteValueImageButton[pmValue.value] = "Restaurer";
	} else {
		pmValue.hasImage = true;
		vue.screen.data.deleteValueImage[pmValue.value] = false;
		vue.screen.data.deleteValueImageButton[pmValue.value] = "Supprimer"
	}
}

function paymentmodes_removeValue(index) {
	vue.screen.data.paymentMode.values.splice(index, 1);
}

function paymentmodes_removeReturn(index) {
	vue.screen.data.paymentMode.returns.splice(index, 1);
}

function paymentmodes_savePaymentMode() {
	let pm = vue.screen.data.paymentMode;
	gui_showLoading();
	for (let i = 0; i < pm.returns.length; i++) {
		delete pm.returns[i]['id'];
	}
	for (let i = 0; i < pm.values.length; i++) {
		delete pm.values[i]['id'];
	}
	if ("id" in pm) {
		srvcall_post("api/paymentmode", pm, paymentmodes_saveCallback);
	} else {
		// Remove self-referencing payment mode return id before sending to the API
		pm.returns.forEach(function(ret) {
			if (ret.returnMode == -1) {
				delete ret.returnMode;
			}
		});
		srvcall_put("api/paymentmode/" + encodeURIComponent(pm["reference"]), pm, paymentmodes_saveCallback);
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
		// Assign id to payment mode
		let respPM = JSON.parse(response);
		pm.id = respPM["id"];
		// Assign id to self-referencing returns
		pm.returns.forEach(function(ret) {
			if (typeof ret.returnMode === "undefined") {
				ret.returnMode = pm.id;
			}
		});
	}
	// Send image update requests
	let calls = [];
	let imgTag = document.getElementById("edit-image");
	if (vue.screen.data.deleteImage) {
		pm.hasImage = false;
		calls.push({id: "pmImg", method: "DELETE", target: "api/image/paymentmode/" + encodeURIComponent(pm.id)});
	} else if (imgTag.files.length != 0) {
		pm.hasImage = true;
		if (vue.screen.data.hadImage) {
			calls.push({id: "pmImg",
					method: "PATCH",
					target: "api/image/paymentmode/" + encodeURIComponent(pm.id), data: imgTag.files[0]
			});
		} else {
			calls.push({id: "pmImg",
					method: "PUT",
					target: "api/image/paymentmode/" + encodeURIComponent(pm.id),
					data: imgTag.files[0]
			});
		}
	}
	for (let i = 0; i < pm.values.length; i++) {
		let pmValue = pm.values[i];
		let imgValueTag = document.getElementById("edit-value-image-" + pmValue.value);
		if (pmValue.value in vue.screen.data.deleteValueImage && vue.screen.data.deleteValueImage[pmValue.value]) {
			pmValue.hasImage = false;
			calls.push({id: "pmValueImg-" + pmValue.value,
					method: "DELETE",
					target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value)
			});
		} else if (imgValueTag.files.length != 0) {
			pmValue.hasImage = true;
			if (pmValue.value in vue.screen.data.hadValueImage && vue.screen.data.hadValueImage[pmValue.value]) {
				calls.push({id: "pmValueImg-" + pmValue.value,
						method: "PATCH",
						target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value),
						data: imgValueTag.files[0]
				});
			} else {
				calls.push({id: "pmValueImg-" + pmValue.value,
						method: "PUT",
						target: "api/image/paymentmodevalue/" + encodeURIComponent(pm.id) + "-" + encodeURIComponent(pmValue.value),
						data: imgValueTag.files[0]
				});
			}
		}
	}
	if (calls.length > 0) {
		srvcall_multicall(calls, _paymentmodes_savePreCommit);
	}
 else {
		_paymentmodes_saveCommit(pm);
	}
}

function _paymentmodes_savePreCommit(calls) {
	_paymentmodes_saveCommit(vue.screen.data.paymentMode);
}

function _paymentmodes_saveCommit(pm) {
	document.getElementById("edit-image").value = "";
	if (pm.hasImage) {
		// Force image refresh
		pm.hasImage = false;
		pm.hasImage = true;
	}
	for (let i = 0; i < pm.values.length; i++) {
		let pmValue = pm.values[i];
		if (pmValue.hasImage) {
			pmValue.hasImage = false;
			pmValue.hasImage = true;
		}
		let imgValueTag = document.getElementById("edit-value-image-" + pmValue.value);
		imgValueTag.value = "";
	}
	// Update in local database
	storage_open(function(event) {
		storage_write("paymentmodes", pm,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
