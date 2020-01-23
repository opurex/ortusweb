/** The message box component. Use gui_showMessage/gui_showError to use it.
 * @props message The message data structure {type: (null|string) the type
 * of message to display, Null to hide,
 * message: (string) The message to display}. */
Vue.component("vue-message", {
	props: ["message"],
	template: `<div id="message-box"
	v-if="message.type" v-bind:class="message.type"
	onclick="javascript:gui_closeMessageBox();"><p v-for="msg in message.message">{{msg}}</p></div>
`
});
