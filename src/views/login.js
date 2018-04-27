
Vue.component("vue-login", {
	props: ["login"],
	template: `<div id="login" class="login-box" v-if="login.loggedIn == false">
	<div class="row-fluid">
		<div class="col-md-4">
			<div class="box login-logo">
				<img src="res/img/pasteque_logo.png" alt="Pasteque-Admin" />
			</div>
		</div>
		<div class="col-md-6">
			<div class="box login-box-body ">
				<p class="login-box-msg"></p>
				<form name="loginform" onsubmit="javascript:login_sendLogin();return false;" id="loginform" action="." method="post" class="form-vertical">
					<div id="login">
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
						<div class="checkbox">
							<input type="checkbox" name="https" id="user_https" v-model="login.https" />
							<label for="user_https">Connexion sécurisée</label>
						</div>
					</div>
					<div>
						<button class="btn btn-primary" type="submit">Se connecter</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
`,
	mounted: function() {
		if (login_getUser()) {
			document.getElementById("user_pass").focus();
		}
	}
});

