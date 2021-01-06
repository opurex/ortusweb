function home_show() {
	vue.screen.data = {
		user: vue.login.user,
		server: vue.login.server,
	}
	if (storage_hasData()) {
		let syncDate = storage_getSyncDate();
		vue.screen.data.syncDate = {
			date: tools_dateToString(syncDate),
			time: tools_timeToString(syncDate)
		}
		vue.menu.visible = true;
	} else {
		vue.menu.visible = false;
	}
	vue.screen.component = "vue-home";
}

function home_sendSync() {
	gui_showLoading();
	srvcall_get("api/sync", home_syncCallback);
}

function home_syncCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, home_sendSync)) {
		return;
	}
	var data = JSON.parse(response);
	home_resetProgress(data);
	storage_open(function(event) {
		storage_sync(data, home_syncProgress, home_syncError, home_syncComplete);
	});
}

/** Contains for each SYNC_MODELS: {"count": number of models, "done": index loaded}.
 * "done" contains a dictionary with true/false when an index was loaded.
 * This is for preventing concurrential access on a single integer. */
var _home_progress = {};

/** Initialize home_progress. */
function home_resetProgress(data) {
	for (let i = 0; i < SYNC_MODELS.length; i++) {
		let model = SYNC_MODELS[i];
		_home_progress[model] = {"count": data[model].length + 1, "done": []};
	}
}

function home_syncProgress(model, i, event) {
	_home_progress[model]["done"][i] = true;
	home_checkProgress();
}

function home_syncError(model, i, event) {
	_home_progress[model]["done"][i] = false;
	console.error(model, i, event);
}

function home_syncComplete() {
	vue.menu.visible = true;
	gui_hideLoading();
	storage_close();
	home_show();
	gui_updateDyslexicMode();
	gui_hideLoading();
}

function home_checkProgress() {
	for (let i = 0; i < SYNC_MODELS.length; i++) {
		let model = SYNC_MODELS[i];
		if (_home_progress[model]["count"] + 1 != _home_progress[model]["done"].length) {
			return false;
		}
	}
}

