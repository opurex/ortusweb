function gui_showLoading() {
	document.getElementById('loading').classList.remove('hidden');
}
function gui_hideLoading() {
	document.getElementById('loading').classList.add('hidden');
}

function gui_showMenu() {
	var elements = {
		"sections": [
			{"name": "Catalogue",
			"items": [
				{"target": "categories", "name": "Categories", "icon": "menu_category.png"},
				{"target": "catalog", "name": "Produits", "icon": "menu_product.png"},
				{"target": "discounts", "name": "Promotions"},
				{"target": "tariffareas", "name": "Zones tarifaires"},
				{"target": "customers", "name": "Clients"}
			]},
			{"name": "Ventes",
			"items": [
				{"target": "sales_z", "name": "Tickets Z"},
				{"target": "sales_products", "name": "Ventes par produits"}
			]},
			{"name": "Administration",
			"items": [
				{"target": "roles", "name": "Droits d'accès"},
				{"target": "users", "name": "Opérateurs"},
				{"target": "cashregisters", "name": "Caisses"},
				{"target": "paymentmodes", "name": "Modes de paiement"},
				{"target": "currencies", "name": "Devises"}
			]}
		]
	};
	var html = Mustache.render(view_menu, elements);
	document.getElementById("menu").innerHTML = html;
}

function gui_hideMenu() {
	document.getElementById("menu").innerHTML = "";
}

var _gui_currentScreen = null;

function gui_showScreen(screen, args) {
	// close current screen
	switch (_gui_currentScreen) {

	}
	// open new screen
	_gui_currentScreen = screen;
	switch (screen) {
	case "login":
		_gui_currentScreen = "login";
		login_show();
		break;
	case "categories":
		_gui_currentScreen = "categories";
		categories_show();
		break;
	case "category":
		_gui_currentScreen = "category";
		categories_showCategory(args);
		break;
	default:
		_gui_currentScreen = 'home';
	case "home":
		home_show();
		break;
	}
}
