function roles_show() {
	gui_showLoading();
	vue.screen.data = {roles: []};
	vue.screen.component = "vue-role-list"
	storage_open(function(event) {
		storage_readStore("roles", function(roles) {
			vue.screen.data.roles = roles;
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
				{value: "button.openmoney", name: "Ouvrir la caisse"},
				{value: "fr.pasteque.pos.panels.JPanelCloseMoney", name: "Fermer la caisse"},
				{value: "fr.pasteque.pos.panels.JPanelPayments", name: "Effectuer des mouvements de caisse"},
				{value: "fr.pasteque.pos.sales.JPanelTicketEdits", name: "Contrôler les ventes (Desktop)"},
				{value: "sales.EditTicket", name: "Contrôler les ventes (Android)"},
				{value: "button.print", name: "Imprimer une commande"},
				{value: "button.opendrawer", name: "Ouvrir le tiroir caisse hors encaissement (Desktop)"},
			],
			tickets: [
				{value: "fr.pasteque.pos.sales.JPanelTicketSales", name: "Prendre des commandes"},
				{value: "sales.Total", name: "Encaisser une commande"},
				{value: "sales.EditLines", name: "Annuler/réduire une commande"},
				{value: "sales.RefundTicket", name: "Rembourser un ticket"},
				{value: "sales.PrintTicket", name: "Réimprimer un ticket"},
			],
			misc: [
				{value: "fr.pasteque.pos.customers.JPanelCustomer", name: "Créer des comptes client"},
				{value: "Menu.ChangePassword", name: "Changer son mot de passe"},
				{value: "fr.pasteque.pos.config.JPanelConfiguration", name: "Accéder à l'écran de configuration (Desktop)"},
				{value: "fr.pasteque.pos.panels.JPanelPrinter", name: "Historique d'impression (Desktop)"},
			],
		},
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
		gui_showError("Quelque chose cloche dans les données du formulaire. " + request.statusText);
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
