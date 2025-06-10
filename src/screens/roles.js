function roles_show() {
	gui_showLoading();

	storage_open(function(event) {
		storage_readStore("roles", function(roles) {
			vue.screen.data = {roles: roles};
			vue.screen.component = "vue-role-list"
			gui_hideLoading();
			storage_close();
		});
	});
}

function roles_showRole(id) {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStore("paymentmodes", function(paymentModes) {
			if (id != null) {
				storage_get("roles", parseInt(id), function(role) {
					_roles_showRole(role, paymentModes);
					storage_close();
				});
			} else {
				_roles_showRole(Role_default(), paymentModes);
				storage_close();
			}
		});
	});
}

function _roles_showRole(role, paymentModes) {
	vue.screen.data = {
		role: role,
		paymentModes: paymentModes,
		permissions: {
			session: [
				{value: "button.openmoney", name: "Open the cash register"},
				{value: "fr.pasteque.pos.panels.JPanelCloseMoney", name: "Close the cash register"},
				{value: "fr.pasteque.pos.panels.JPanelPayments", name: "Perform cash register operations"},
				{value: "fr.pasteque.pos.sales.JPanelTicketEdits", name: "Control sales (Desktop)"},
				{value: "sales.EditTicket", name: "Control sales (Android)"},
				{value: "button.print", name: "Print an order"},
				{value: "button.opendrawer", name: "Open cash drawer outside payment (Desktop)"},
			],
			tickets: [
				{value: "fr.pasteque.pos.sales.JPanelTicketSales", name: "Take orders"},
				{value: "sales.Total", name: "Process payment for an order"},
				{value: "sales.EditLines", name: "Cancel/reduce an order"},
				{value: "sales.RefundTicket", name: "Refund a ticket"},
				{value: "sales.PrintTicket", name: "Reprint a ticket"},
			],
			misc: [
				{value: "fr.pasteque.pos.customers.JPanelCustomer", name: "Create customer accounts"},
				{value: "Menu.ChangePassword", name: "Change own password"},
				{value: "fr.pasteque.pos.config.JPanelConfiguration", name: "Access configuration screen (Desktop)"},
				{value: "fr.pasteque.pos.panels.JPanelPrinter", name: "Print history (Desktop)"},
			],
		}

	}
	vue.screen.component = "vue-role-form";
	gui_hideLoading();
}

function role_saveRole() {
	let role = vue.screen.data.role;
	gui_showLoading();
	srvcall_post("api/role", role, role_saveCallback);
}

function role_saveCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, category_saveCategory)) {
		return;
	}
	if (status == 400) {
		gui_showError("Something's wrong with the form data. " + request.statusText);
		gui_hideLoading();
		return;
	}
	let role = vue.screen.data.role;
	if (!("id" in role)) {
		let respRole = JSON.parse(response);
		role.id = respRole["id"];
	}
	_role_saveCommit(role);
}

function _role_saveCommit(role) {
	// Update in local database
	storage_open(function(event) {
		storage_write("roles", role,
			appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
