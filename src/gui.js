function gui_showLoading() {
	document.getElementById('loading').classList.remove('hidden');
}
function gui_hideLoading() {
	document.getElementById('loading').classList.add('hidden');
}

var _gui_currentScreen = null;

function gui_showScreen(screen) {
	// close current screen
	switch (_gui_currentScreen) {

	}
	// open new screen
	_gui_currentScreen = screen;
	switch (screen) {
	default:
		_gui_currentScreen = 'home';
	case 'home':
		home_show();
		break;
	}
}
