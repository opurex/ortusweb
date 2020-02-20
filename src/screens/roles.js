function roles_show() {
	gui_showLoading();
	let roleStore = appData.db.transaction(["roles"], "readonly").objectStore("roles");
	let roles = [];
	vue.screen.data = {roles: []};
	vue.screen.component = "vue-role-list"
	roleStore.openCursor().onsuccess = function(event) {
		let cursor = event.target.result;
		if (cursor) {
			roles.push(cursor.value);
			cursor.continue();
		} else {
			vue.screen.data.roles = roles;
			gui_hideLoading();
		}
	}
}

function roles_showRole(id) {
	gui_showLoading();
	let db = appData.db.transaction(["roles", "paymentmodes"], "readonly");
	let roleStore = db.objectStore("roles");
	let pmStore = db.objectStore("paymentmodes");
	let paymentModes = [];
	if (id != null) {
		let roleReq = roleStore.get(parseInt(id));
		roleReq.onsuccess = function(event) {
			let role = event.target.result;
			pmStore.openCursor().onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor) {
					paymentModes.push(cursor.value);
					cursor.continue();
				} else {
					_roles_showRole(role, paymentModes);
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
				_roles_showRole(Role_default(), paymentModes);
			}
		}
	}
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
	let roleStore = appData.db.transaction(["roles"], "readwrite").objectStore("roles");
	let req = roleStore.put(role);
	req.onsuccess = function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
	}
	req.onerror = function(event) {
		gui_hideLoading();
		gui_showError("Les modifications ont été enregistrées mais une erreur est survenue<br />" + event.target.error);
	}
}
