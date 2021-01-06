function preferences_show() {
	vue.screen.data = {
		preferDyslexicMode: storage_getOption("preferDyslexicMode", "0") == "1",
	}
	vue.screen.component = "vue-preferences";
}

function preferences_save() {
	gui_showLoading();
	let preferDyslexicMode = Option(Option_prefName("preferDyslexicMode"), vue.screen.data.preferDyslexicMode ? "1" : "0");
	srvcall_post("api/option", preferDyslexicMode, preferences_saveCallback);
}

function preferences_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, preferences_save)) {
		return;
	}
	var data = JSON.parse(response);
	storage_setOption("preferDyslexicMode", vue.screen.data.preferDyslexicMode ? "1" : "0");
	gui_updateDyslexicMode();
	gui_hideLoading();
	appData.localWriteDbSuccess();
}

