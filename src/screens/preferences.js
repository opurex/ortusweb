function preferences_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_get("options", OPTION_PREFERENCES, function(option) {
			vue.screen.data = {
				font: "sans",
				tablePageSize: 250,
			};
			if (option != null) {
				let content = JSON.parse(option.content);
				if ("font" in content) {
					vue.screen.data.font = content.font;
				}
				if ("tablePageSize" in content) {
					vue.screen.data.tablePageSize = content.tablePageSize;
				}
			}
			vue.screen.component = "vue-preferences";
			storage_close();
			gui_hideLoading();
		});
	});
}

function preferences_save() {
	gui_showLoading();
	let preferences = Option(OPTION_PREFERENCES, JSON.stringify(vue.screen.data));
	srvcall_post("api/option", preferences, preferences_saveCallback);
}

function preferences_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, preferences_save)) {
		return;
	}
	var data = JSON.parse(response);
	storage_open(function(event) {
		storage_write("options", data, appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}

