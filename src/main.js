/** The vue.js app. */
var vue = null;
var appData = {
	db: null
};

function route(screen) {
	if (arguments.length == 0) {
		screen = "default";
	}
	if (login_getToken() == null) {
		login_show();
		return;
	}
	switch (screen) {
	case "categories":
		categories_show();
		break;
	case "products":
		products_show();
		break;
	case "tariffareas":
		tariffareas_show();
		break;
	case "customers":
		customers_show();
		break;
	case "paymentmodes":
		paymentmodes_show();
		break;
	case "sales_z":
		ztickets_show();
		break;
	case "salesbyproduct":
		salesbyproduct_show();
		break;
	case "salesdetails":
		salesdetails_show();
		break;
	case "category":
		categories_showCategory(_get("id"));
		break;
	case "product":
		products_showProduct(_get("id"), _get("category"));
		break;
	case "tariffarea":
		tariffareas_showArea(_get("id"));
		break;
	case "customer":
		customers_showCustomer(_get("id"));
		break;
	case "paymentmode":
		paymentmodes_showPaymentMode(_get("id"));
		break;
	case "floors":
		floors_show();
		break;
	case "users":
		users_show();
		break;
	case "user":
		users_showUser(_get("id"));
		break;
	case "roles":
		roles_show();
		break;
	case "role":
		roles_showRole(_get("id"));
		break;
	case "cashregisters":
		cashregisters_show();
		break;
	case "cashregister":
		cashregisters_showCashRegister(_get("id"));
		break;
	case "resources":
		resources_show();
		break;
	case "resource":
		resources_showResource(_get("label"));
		break;
	case "home":
	default:
		home_show();
		break;
	}
}


function boot() {
	vue = new Vue({
		el: "#vue-app",
		data: {
			ready: false,
			loading: {
				loading: false,
				progress: null,
				progressMax: null
			},
			message: {
				type: null,
				message: null
			},
			login: {
				loggedIn: false,
				server: null,
				user: null,
				https: "0",
				password: ''
			},
			menu: menu_init(),
			screen: {
				component: undefined,
				data: null
			}
		}
	});
	if (!storage_available) {
		gui_showError("Stockage des données non disponible. Votre navigateur est peut être obsolète.");
		return;
	}
	start();
}

function start() {
	// Initialize default dynamic values
	vue.login = {
		loggedIn: login_isLogged(),
		server: login_getServer(),
		user: login_getUser(),
		https: login_getHttps(),
		password: ''
	}
	// Open database if not already done
	if (appData.db == null) {
		storage_open(function(event) {
			appData.db = event.target.result;
			_start_done();
		}, function(event) {
			gui_showError("Impossible d'accéder aux stockage des données locales.");
			return;
		});
	} else {
		_start_done();
	}
}
function _start_done() {
	vue.ready = true;
	// Show home/config screen
	route(_get("p"));
	gui_hideLoading();
}

function _get( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return null;
  else
    return results[1];
}
