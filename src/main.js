 const JSADMIN_VERSION = "8.25";

/** The vue.js app. */
var vue = null;
 var appData = {
	 db: null,
	 generalDbError: function(event) {
		 gui_showError([
			 "Unable to access local data storage (also called site data). This issue usually arises from using private browsing mode. The \"logout\" button, once logged in, allows you to clear the management interface data.",
			 "If you are using private browsing mode, try switching to normal browsing mode.",
			 "If you are not using it, check your browser's history retention settings. For Firefox, in the \"Privacy & Security\" tab, under the \"History\" section, select \"Remember history\" or \"Use custom settings for history\" and make sure \"Remember browsing and download history\" is checked."
		 ]);
		 return;
	 },
	 readDbError: function(event) {
		 console.info(event.stack);
		 gui_showError([
			 "Unable to read local data. To help resolve this issue, you can send the following information to your PastÃ¨que provider if the problem persists.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ], event.stack);
		 gui_hideLoading();
		 storage_close();
	 },
	 localWriteDbSuccess: function(event) {
		 gui_hideLoading();
		 gui_showMessage("Changes have been saved");
		 storage_close();
	 },
	 localWriteDbError: function(event) {
		 gui_hideLoading();
		 gui_showError([
			 "Changes have been saved but an error occurred. Please reload the data from the home screen to apply the changes.",
			 "If the problem persists, you can send the following information to your PastÃ¨que provider to help resolve it.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ]);
		 storage_close();
	 },
	 localWriteOpenDbError: function(event) {
		 gui_hideLoading();
		 gui_showError([
			 "Changes have been saved but an error occurred. Please reload the data from the home screen to apply the changes.",
			 "If the problem persists, you can send the following information to your PastÃ¨que provider to help resolve it.",
			 "Name: " + event.error.name,
			 "Message: " + event.error.message
		 ]);
	 }
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
	case "category":
		categories_showCategory(_get("id"));
		break;
	case "categoryImport":
		categories_showImport();
		break;
	case "products":
		products_show(_get("category"));
		break;
	case "producttags":
		producttags_show();
		break;
	case "tariffareas":
		tariffareas_show();
		break;
	case "customers":
		customers_show();
		break;
	case "customerImport":
		customers_showImport();
		break;
	case "paymentmodes":
		paymentmodes_show();
		break;
	case "sales_tickets":
		tickets_show();
		break;
	case "sales_z":
		ztickets_show();
		break;
	case "salesbyproduct":
		salesbyproduct_show();
		break;
	case "salesbycategory":
		salesbycategory_show();
		break;
	case "salesdetails":
		salesdetails_show();
		break;
	case "product":
		products_showProduct(_get("id"), _get("category"));
		break;
	case "productDuplicate":
		products_showDuplicateProduct(_get("id"));
		break;
	case "productCompo":
		products_showProduct(_get("id"), _get("category"), true);
		break;
	case "productCompoDuplicate":
		products_showDuplicateProduct(_get("id"), true);
		break;
	case "productImport":
		products_showImport();
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
	case "discountprofiles":
		discountprofiles_show();
		break;
	case "discountprofile":
		discountprofiles_showProfile(_get("id"));
		break;
	case "discountprofileImport":
		discountprofiles_showImport();
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
	case "currencies":
		currencies_show();
		break;
	case "currency":
		currencies_showCurrency(_get("id"));
		break;
	case "taxes":
		taxes_show();
		break;
	case "tax":
		taxes_showTax(_get("id"));
		break;
	case "preferences":
		preferences_show();
		break;
	case "accounting_z":
		accounting_showZ();
		break;
	case "accounting_config":
		accounting_showConfig();
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
				https: true,
				password: ''
			},
			menu: menu_init(),
			screen: {
				component: undefined,
				data: null
			}
		}
	});
	storage_available(function(event) {
		start();
	}, function(event) {
		if (event === false) {
			gui_showError("Data storage not available. Your browser may be outdated.");
		} else {
			appData.generalDbError(event);
		}
	});
}

function start() {
	// Initialize default dynamic values
	vue.login = {
		loggedIn: (login_getToken() != null),
		server: login_getServer(),
		user: login_getUser(),
		https: login_getHttps(),
		password: ''
	}
	vue.menu.visible = true;
	// Initialize the database if required and read global options
	if (appData.db == null) {
		storage_open(function(event) {
			storage_get("options", OPTION_PREFERENCES, function(option) {
				if (option != null) {
					let content = JSON.parse(option.content);
					gui_setFont(content.font);
				}
				storage_close();
				let fontParam = storage_getSessionOption("font");
				if (fontParam != null) {
					gui_setFont(fontParam);
				}
				_start_done();
			}, function(error) { storage_close(); _start_done(); });
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
