
Vue.component("vue-login", {
	props: ["login"],
	data: function() {
		return {
			"dyslexicMode": false
		};
	},
	template: `<div id="login" class="login-box" v-if="login.loggedIn == false">
	<aside class="box box-body">
		<div id="login-logo">
			<img src="res/img/pasteque_logo.png" alt="Pasteque-Admin" />
		</div>
		<div class="form-group">
			<input type="checkbox" name="dyslexic_friendly" id="dyslexic-friendly" v-model="dyslexicMode">
			<label for="dyslexic-friendly" class="dyslexic-friendly">Mode dyslexique</label>
		</div>
	</aside>
	<nav class="box box-body login-box-body ">
		<h1>Connexion à votre serveur Pastèque</h1>
		<p class="form-msg"></p>
		<form name="loginform" onsubmit="javascript:login_sendLogin();return false;" id="loginform" action="." method="post" class="form-tiny">
			<div class="form-group">
				<label class="control-label required" for="user_server">Serveur</label>
				<input type="text" id="user_server" required="required" class="form-control" v-model="login.server" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_login">Identifiant</label>
				<input type="text" id="user_login" required="required" class="form-control" v-model="login.user" />
			</div>
			<div class="form-group">
				<label class="control-label required" for="user_pass">Mot de passe</label>
				<input type="password" id="user_pass" required="required" class="form-control" v-model="login.password" />
			</div>
			<div class="form-group">
				<input type="checkbox" name="https" id="user_https" v-model="login.https" />
				<label for="user_https">Connexion sécurisée <span class="tooltip">(utiliser HTTPS)</span></label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary" type="submit">Se connecter</button>
			</div>
		</form>
	</nav>
</div>
`,
	mounted: function() {
		if (login_getUser()) {
			document.getElementById("user_pass").focus();
		}
		let dysParam = storage_getSessionOption("dyslexicMode");
		if (dysParam != null) {
			this.dyslexicMode = (dysParam == "1");
		}
	},
	watch: {
		dyslexicMode: function(val) {
			gui_setDyslexicMode(val);
		}
	}
});

