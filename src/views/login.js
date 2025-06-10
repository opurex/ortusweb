Vue.component("vue-login", {
	props: ["login"],
	data: function() {
		return {
			"font": "default"
		};
	},
	template: `<div id="login" class="login-box" v-if="login.loggedIn == false">
	<aside class="box box-body">
		<div id="login-logo">
			<img src="res/img/opurexlogo.png" alt="Opurex POS Admin" />
		</div>
		<fieldset>
			<legend>Font</legend>
			<div class="form-group">
				<input id="font-pt" type="radio" name="font" value="default" v-model="font" />
				<label for="font-pt" class="default-font">Default</label>
			</div>
			<div class="form-group">
				<input id="font-system" type="radio" name="font" value="system" v-model="font" />
				<label for="font-system" class="no-font">Disable font</label>
			</div>
			<div class="form-group">
				<input id="font-opendyslexic" type="radio" name="font" value="opendyslexic" v-model="font" />
				<label for="font-opendyslexic" class="dyslexic-friendly">Open Dyslexic</label>
			</div>
			<div class="form-group">
				<input id="font-atkinsonhyperlegible" type="radio" name="font" value="hyperlegible" v-model="font" />
				<label for="font-atkinsonhyperlegible" class="hyperlegible">Atkinson Hyperlegible</label>
			</div>
		</fieldset>
	</aside>
	<nav class="box box-body login-box-body">
		<h1>Login to Opurex Pos server</h1>
		<p class="form-msg"></p>
		<form name="loginform" onsubmit="javascript:login_sendLogin();return false;" id="loginform" action="" method="post" class="form-tiny">
			<div class="form-group">
				<label class="control-label required" for="user_server">Server</label>
				<input type="text" id="user_server" required="required" class="form-control" v-model="login.server" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_login">Username</label>
				<input type="text" id="user_login" required="required" class="form-control" v-model="login.user" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_pass">Password</label>
				<input type="password" id="user_pass" required="required" class="form-control" v-model="login.password" />
			</div>
			<div class="form-group">
				<input type="checkbox" name="https" id="user_https" v-model="login.https" />
				<label for="user_https">Secure connection <span class="tooltip">(use HTTPS)</span></label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary" type="submit">Log in</button>
			</div>
		</form>
	</nav>
</div>
`,
	mounted: function() {
		if (login_getUser()) {
			document.getElementById("user_pass").focus();
		}
	},
	watch: {
		font: function(val) {
			if (val != "default") {
				gui_setFont(val);
				storage_setSessionOption("font", val);
			} else {
				gui_setFont("sans");
				storage_setSessionOption("font", null);
			}
		},
		"login.loggedIn": function(val) {
			if (val == false) {
				let font = storage_getSessionOption("font");
				if (font == null) {
					font = "default";
				}
				this.font = font;
			}
		}
	}
});
