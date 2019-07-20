Vue.component("vue-user-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=user">Ajouter un utilisateur</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<col />
			<col style="width:15%; min-width: 5em;" />
			<col style="width:15%; min-width: 5em;" />
			<col style="width:15%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Nom</th>
					<th>Rôle</th>
					<th>Carte</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="user in data.users">
					<td><img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(user)" />{{user.name}}</td>
					<td>{{data.roles[user.role].name}}</td>
					<td>{{user.card}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(user)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(user) {
			if (user.hasImage) {
				return login_getHostUrl() + "/api/image/user/" + user.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/user/default?Token=" + login_getToken();
			}
		},
		roleName: function(user) {
console.info(user.role);
			return this.data.roles[user.role].name;
		},
		editUrl: function(user) {
			return "?p=user&id=" + user.id;
		},
	}
});

Vue.component("vue-user-form", {
	props: ["data"],
	data: function() { return {"passwordFieldType": "password"}; },
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un utilisateur</h1>
		<form id="edit-category-form" onsubmit="javascript:user_saveUser(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-name">Nom</label></dt>
				<dd><input class="form-control" id="edit-name" type="text" v-model="data.user.name" required="true" /></dd>

				<dt><label for="edit-image">Image</label></dt>
				<dd>
					<img v-if="data.user.hasImage" id="user-image" class="img img-thumbnail" v-bind:src="imageSrc(data.user)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:user_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</dd>

				<dt><label for="edit-parent">Rôle</label></dt>
				<dd>
					<select class="form-control" id="edit-parent" v-model="data.user.role">
						<option disabled value="">Selectionner</option>
						<option v-for="role in data.roles" :key="role.id" v-bind:value="role.id">{{role.name}}</option>
					</select>
				</dd>

				<dt><label for="edit-card">Carte</label></dt>
				<dd><input class="form-control" id="edit-card" type="text" v-model="data.user.card" /></dd>

				<dt v-if="!data.user.id"><label for="edit-password">Mot de passe</label></dt>
				<dd v-if="!data.user.id"><input class="form-control" id="edit-password" :type="passwordFieldType" v-model="data.user.password" /><button class="btn" type="button" v-on:click="togglePasswordVisibility">Afficher/masquer</button></dd>

				<dt><label for="edit-dispOrder">Actif</label></dt>
				<dd><input class="form-control" id="edit-active" type="checkbox" v-model="data.user.active"></dd>

			</dl>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
	<div class="box" style="margin-top:1ex" v-if="data.user.id">
	<div class="box-body">
		<h2>Réinitialiser le mot de passe</h2>
		<form id="edit-reset-user-password" onsubmit="javascript:users_updatePassword(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-reset-password">Nouveau mot de passe</label></dt>
				<dd><input :type="passwordFieldType" id="edit-reset-password" class="form-control" /><button class="btn" type="button" v-on:click="togglePasswordVisibility">Afficher/masquer</button></dd>
			</dl>
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
</div>
</div>
</div>`,
	methods: {
		imageSrc: function(user) {
			if (user.hasImage) {
				return login_getHostUrl() + "/api/image/user/" + user.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/user/default?Token=" + login_getToken();
			}
		},
		togglePasswordVisibility() {
			if (this.passwordFieldType == "password") {
				this.passwordFieldType = "text";
			} else {
				this.passwordFieldType = "password";
			}
			return false;
		},
	}
});
