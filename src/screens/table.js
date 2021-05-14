function table_saveDefaultColumns(option) {
	gui_showLoading();
	appData._tableTmpData = {
		option: option
	}
	_table_saveDefaultColumnsAction();
}

function _table_saveDefaultColumnsAction() {
	let option = appData._tableTmpData.option;
	srvcall_post("api/option", option, _table_saveDefaultColumnsCallback)
}

function _table_saveDefaultColumnsCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, _table_saveDefaultColumnsAction)) {
		return;
	}
	// Store in local cache
	let thiss = this;
	storage_open(function(event) {
		storage_write("options", appData._tableTmpData.option, function(event) {
			delete(appData._tableTmpData);
			appData.localWriteDbSuccess(event);
		}, function(event) {
			delete(appData._tableTmpData);
			appData.localWriteDbError(event);
		});
	});
}
