/** The vue.js app. */
var vue = null;
var appData = {
	db: null,
	generalDbError: function(event) {
		gui_showError(["Impossible d'accéder aux stockage des données locales (aussi appelé données de site). Ce problème provient la plupart du temps du mode de navigation privée. Le bouton \"déconnexion\" une fois connecté·e permet de vider les données de l'interface de gestion.",
			"Si vous l'utilisez le mode de navigation privée, essayez avec le mode de navigation normal.",
			"Si vous ne l'utilisez pas, vérifiez les paramètres de conservation de l'historique dans les préférences du navigateur. Pour Firefox, dans l'onglet \"Vie privée et sécurité\", section \"Historique\", sélectionnez \"Conserver l'historique\" ou \"Utiliser les paramètres personnalisés pour l'historique\" en cochant au moins \"Conserver l'historique de navigation et des téléchargements\"."]);
		return;
	},
	readDbError: function(event) {
console.info(event.stack);
		gui_showError(["Impossible de lire les données locales. Pour aider à résoudre ce problème, vous pouvez envoyer les informations suivantes à votre prestataire Pastèque si le problème persiste.",
			"Nom : " + event.error.name,
			"Message : " + event.error.message], event.stack);
		gui_hideLoading();
		storage_close();
	},
	localWriteDbSuccess: function(event) {
		gui_hideLoading();
		gui_showMessage("Les modifications ont été enregistrées");
		storage_close();
	},
	localWriteDbError: function(event) {
		gui_hideLoading();
		gui_showError(["Les modifications ont été enregistrées mais une erreur est survenue. Veuillez recharger les données depuis l'écran d'accueil pour prendre en compte les changements.",
			"Si le problème est recurrent, vous pouvez envoyer les informations suivantes à votre prestataire Pastèque pour aider à résoudre le problème.",
			"Nom : " + event.error.name,
			"Message : "  + event.error.message]);
		storage_close();
	},
	localWriteOpenDbError: function(event) {
		gui_hideLoading();
		gui_showError(["Les modifications ont été enregistrées mais une erreur est survenue. Veuillez recharger les données depuis l'écran d'accueil pour prendre en compte les changements.",
			"Si le problème est recurrent, vous pouvez envoyer les informations suivantes à votre prestataire Pastèque pour aider à résoudre le problème.",
			"Nom : " + event.error.name,
			"Message : "  + event.error.message]);
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
			gui_showError("Stockage des données non disponible. Votre navigateur est peut être obsolète.");
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
	let dyslexicMode = storage_getSessionOption("dyslexicMode");
	if (dyslexicMode != null) {
		dyslexicMode = (dyslexicMode == "1");
	}
	vue.sessionParams = {
		dyslexicMode: dyslexicMode,
	}
	gui_updateDyslexicMode();
	vue.menu.visible = true;
	// Initialize the database if required
	if (appData.db == null) {
		storage_open(function(event) {
			storage_close();
			_start_done();
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
