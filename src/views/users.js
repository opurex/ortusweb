Vue.component("vue-user-list", {
	props: ["data"],
	template: `<div class="user-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des utilisateurs</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=user">Ajouter un utilisateur</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
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
					<td><img class="thumbnail thumbnail-text" v-bind:src="imageSrc(user)" />{{user.name}}</td>
					<td>{{data.roles[user.role].name}}</td>
					<td>{{user.card}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(user)">Modifier</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(user) {
			return srvcall_imageUrl("user", user);
		},
		roleName: function(user) {
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
	template: `<div class="user-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=users">Liste des utilisateurs</a></li>
				<li><h1>Édition d'un utilisateur</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:user_saveUser(); return false;">
			<div class="form-group">
				<label for="edit-name">Nom</label>
				<input id="edit-name" type="text" v-model="data.user.name" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-image">Image</label>
				<img v-if="data.user.hasImage" id="user-image" class="img img-thumbnail" v-bind:src="imageSrc(data.user)" />
				<input id="edit-image" type="file" accept="image/*" />
				<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:user_toggleImage();return false;" >{{data.deleteImageButton}}</a>
			</div>
			<div class="form-group">
				<label for="edit-role">Rôle</label>
				<select id="edit-role" v-model="data.user.role">
					<option disabled value="">Selectionner</option>
					<option v-for="role in data.roles" :key="role.id" v-bind:value="role.id">{{role.name}}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="edit-card">Carte</label>
				<input id="edit-card" type="text" v-model="data.user.card" />
			</div>
			<div class="form-group" v-if="!data.user.id">
				<label for="edit-password">Mot de passe</label>
				<input id="edit-password" :type="passwordFieldType" v-model="data.user.password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Afficher/masquer</button>
			</div>
			<div class="form-group">
				<input class="form-control" id="edit-active" type="checkbox" v-model="data.user.active">
				<label for="edit-dispOrder">Actif</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>

<section class="box box-tiny" v-if="data.user.id">
	<header>
		<h2>Réinitialiser le mot de passe</h2>
	</header>
	<article class="box-body">
		<form id="edit-reset-user-password" class="form-tiny" onsubmit="javascript:users_updatePassword(); return false;">
			<div class="form-group">
				<label for="edit-reset-password">Nouveau mot de passe</label>
				<input :type="passwordFieldType" id="edit-reset-password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Afficher/masquer</button>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
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
