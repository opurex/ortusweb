function preferences_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_get("options", OPTION_DYSLEXICMODE, function(option) {
			let enabled = false
			if (option != null) {
				enabled = option.content;
			}
			vue.screen.data = {
				preferDyslexicMode: enabled == true,
			}
			vue.screen.component = "vue-preferences";
			storage_close();
			gui_hideLoading();
		});
	});
}

function preferences_save() {
	gui_showLoading();
	let preferDyslexicMode = Option(OPTION_DYSLEXICMODE, vue.screen.data.preferDyslexicMode ? "1" : "0");
	srvcall_post("api/option", preferDyslexicMode, preferences_saveCallback);
}

function preferences_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, preferences_save)) {
		return;
	}
	var data = JSON.parse(response);
	gui_setDyslexicMode(data.content == "1");
	storage_open(function(event) {
		storage_write("options", data, appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

