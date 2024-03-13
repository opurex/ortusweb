function floors_show() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("floors", function(floors) {
			_floors_showFloors(floors);
			storage_close();
		});
	});
}

function _floors_showFloors(floors) {
	vue.screen.data = {floors: floors};
	vue.screen.component = "vue-floors-edit"
	gui_hideLoading();
}

function floors_saveFloors() {
	gui_showLoading();
	srvcall_post("api/places", vue.screen.data.floors, floors_saveCallback);
}

function floors_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, floors_saveFloors)) {
		return;
	}
	// Refresh data from server for definitive ids
	let floors = JSON.parse(response);
	Vue.set(vue.screen.data, "floors", floors);
	_floors_saveCommit(vue.screen.data.floors);
}

function _floors_saveCommit(floors) {
	// Update in local database
	storage_open(function(event) {
		storage_write("floors", floors, function(event) {
			appData.localWriteDbSuccess(event);
			floors_show();
			// TODO: the selected place is not refreshed, because autoselectfloor is on Vue mount
		}, function(event) {
			appData.localWriteDbError(event);
			floors_show();
			// TODO: the selected place is not refreshed, because autoselectfloor is on Vue mount
		});
	}, appData.localWriteDbOpenError);
}

