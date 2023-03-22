/** Set the vue app data to display the loading component. */
function gui_showLoading() {
	vue.loading.loading = true;
	vue.loading.progress = null;
	vue.loading.progressMax = null;
}
/** Set the vue app data to hide the loading component. */
function gui_hideLoading() {
	vue.loading.loading = false;
}
/** Set the vue app data to display or update the loading component with a
 * progressive loading. */
function gui_showProgress(current, total) {
	vue.loading.loading = true;
	vue.loading.progress = current;
	vue.loading.progressMax = total;
}

/** Private method to set the vue app data to display a message. */
function _gui_showMessage(messageClass, message, stack) {
	let msg = message
	if ((typeof message) != "object") {
		msg = [message];
	}
	vue.message.type = messageClass;
	vue.message.message = msg;
	if (arguments.length >= 3) {
		vue.message.stack = stack;
	}
}
/** Set the vue app data to hide the message box. */
function gui_closeMessageBox() {
	vue.message.type = null;
	vue.message.message = '';
}
/** Set the vue app data to show an info message. */
function gui_showMessage(message) {
	_gui_showMessage("message-info", message);
}
function gui_showWarning(message) {
	_gui_showMessage("message-warning", message);
}
/** Set the vue app data to show an error message. */
function gui_showError(message, stack) {
	_gui_showMessage("message-error", message, stack);
}

function gui_setFont(font) {
	let body = document.querySelector("body");
	for (let c of ["default-font", "dyslexic-friendly", "hyperlegible", "no-font"]) {
		body.classList.remove(c);
	}
	switch (font) {
		case "opendyslexic":
			body.classList.add("dyslexic-friendly");
			break;
		case "hyperlegible":
			body.classList.add("hyperlegible");
			break;
		case "system":
			body.classList.add("no-font");
			break;
		default:
			body.classList.add("default-font");
			break;
	}
}


Vue.component("vue-blank", {});
