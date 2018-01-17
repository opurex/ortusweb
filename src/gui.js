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
				{"target": "products", "name": "Produits", "icon": "menu_product.png"},
			]},
			{"name": "Ventes",
			"items": [
				{"target": "sales_z", "name": "Tickets Z"},
			]}
		]
	};
	var html = Mustache.render(view_menu, elements);
	document.getElementById("menu").innerHTML = html;
}

function gui_hideMenu() {
	document.getElementById("menu").innerHTML = "";
}

function gui_showMessage(message) {
	var box = document.getElementById("message-box");
	box.classList.add("message");
	box.classList.remove("error");
	box.innerHTML = message;
}
function gui_showError(message) {
	var box = document.getElementById("message-box");
	box.classList.remove("message");
	box.classList.add("error");
	box.innerHTML = message;
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
	case "products":
		_gui_currentScreen = "products";
		products_show();
		break;
	case "product":
		_gui_currentScreen = "product";
		products_showProduct(args);
		break;
	case "sales_z":
		_gui_currentScreen = "sales_z";
		ztickets_show();
		break;
	default:
		_gui_currentScreen = 'home';
	case "home":
		home_show();
		break;
	}
}
