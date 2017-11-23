var view_login = `
<div id="login" style="margin: auto; width: 30ex; padding-top: 8%;">
	<h1>Pastèque<br />Login</h1>
	<form name="loginform" onsubmit="javascript:home_sendLogin();return false;" id="loginform" action="." method="post" style="background-color: #fff; box-shadow: 0 1px 3px #777; padding: 1ex;">
		<p>
			<label for="user_server">Serveur</label><br />
			<input type="text" name="server" id="user_server" class="input" value="{{server}}" size="20" />
		</p>
		<p>
			<label for="user_login">Identifiant</label><br />
			<input type="text" name="login" id="user_login" class="input" value="{{user}}" size="20" />
		</p>
		<p>
			<label for="user_pass">Mot de passe</label><br />
			<input type="password" name="password" id="user_pass" class="input" value="" size="20" /></label>
		</p>
		<p class="submit">
			<input type="submit" name="submit" id="submit" class="button" value="Se connecter" />
		</p>
	</form>
</div>`;
