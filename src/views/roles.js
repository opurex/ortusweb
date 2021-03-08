Vue.component("vue-role-list", {
	props: ["data"],
	template: `<div class="role-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des rôles</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<a class="btn btn-add" href="?p=role">Ajouter un rôle</a>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
			<col />
			<col style="width:15%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Nom</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="role in data.roles">
					<td>{{role.name}}</td>
					<td><a class="btn btn-edit" v-bind:href="editUrl(role)">Modifier</a></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(role) {
			return "?p=role&id=" + role.id;
		},
	}
});

Vue.component("vue-role-form", {
	props: ["data"],
	template: `<div class="role-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=roles">Liste des rôles</a></li>
				<li><h1>Édition d'un rôle</h1></li>
			</ul>
		</nav>
	</header>	
	<article class="box-body">
		<form id="edit-category-form" class="form-large form-mosaic" onsubmit="javascript:role_saveRole(); return false;">
			<fieldset class="form-tiny">
				<legend>Affichage</legend>
				<div class="form-group">
					<label for="edit-label">Désignation</label>
					<input id="edit-name" type="text" v-model="data.role.name" required="true" />
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Sessions de caisse</legend>
				<div class="form-group" v-for="sessPerm in data.permissions.session">
					<input v-bind:id="'edit-session-' + sessPerm.value" type="checkbox" v-bind:value="sessPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-session-' + sessPerm.value">{{sessPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Ventes</legend>
				<div class="form-group" v-for="ticketsPerm in data.permissions.tickets">
					<input v-bind:id="'edit-ticket-' + ticketsPerm.value" type="checkbox" v-bind:value="ticketsPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + ticketsPerm.value">{{ticketsPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Modes de paiement</legend>
				<div class="form-group" v-for="pm in data.paymentModes">
					<input v-bind:id="'edit-pm-' + pm.reference" type="checkbox" v-bind:value="'payment.' + pm.reference" v-model="data.role.permissions" />
					<label v-bind:for="'edit-pm-' + pm.reference">{{pm.label}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Divers</legend>
				<div class="form-group" v-for="miscPerm in data.permissions.misc">
					<input v-bind:id="'edit-ticket-' + miscPerm.value" type="checkbox" v-bind:value="miscPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + miscPerm.value">{{miscPerm.name}}</label>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
	}
});
