var appData = {
	db: null
};

function route(screen) {
	if (arguments.length == 0) {
		screen = "default";
	}
	if (login_getToken() == null) {
		gui_showScreen("login");
		return;
	}
	switch (screen) {
	case "home":
	case "categories":
	case "products":
	case "sales_z":
		gui_showScreen(screen);
		break;
	case "category":
	case "product":
		gui_showScreen(screen, _get("id"));
		break;
	default:
		gui_showScreen("home");
		break;
	}
	gui_showMenu();
}


function boot() {
	storage_open(function(event) {
		appData.db = event.target.result;
		start();
	}, function(event) {
		console.error("Failed to open local database");
	});
}

function start() {
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
