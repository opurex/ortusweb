Vue.component("vue-role-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=role">Ajouter un rôle</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
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
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(role)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		editUrl: function(role) {
			return "?p=role&id=" + role.id;
		},
	}
});

Vue.component("vue-role-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un rôle</h1>
		<form id="edit-category-form" onsubmit="javascript:role_saveRole(); return false;">
			<fieldset class="form-group">
				<legend>Affichage</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-label">Désignation</label></dt>
					<dd><input class="form-control" id="edit-name" type="text" v-model="data.role.name" required="true" /></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Sessions de caisse</legend>
				<dl class="dl-horizontal" v-for="sessPerm in data.permissions.session">
					<dt><label v-bind:for="'edit-session-' + sessPerm.value">{{sessPerm.name}}</label></dt>
					<dd><input class="form-control" v-bind:id="'edit-session-' + sessPerm.value" type="checkbox" v-bind:value="sessPerm.value" v-model="data.role.permissions" /></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Ventes</legend>
				<dl class="dl-horizontal" v-for="ticketsPerm in data.permissions.tickets">
					<dt><label v-bind:for="'edit-ticket-' + ticketsPerm.value">{{ticketsPerm.name}}</label></dt>
					<dd><input class="form-control" v-bind:id="'edit-ticket-' + ticketsPerm.value" type="checkbox" v-bind:value="ticketsPerm.value" v-model="data.role.permissions" /></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Modes de paiement</legend>
				<dl class="dl-horizontal" v-for="pm in data.paymentModes">
					<dt><label v-bind:for="'edit-pm-' + pm.code">{{pm.label}}</label></dt>
					<dd><input class="form-control" v-bind:id="'edit-pm-' + pm.code" type="checkbox" v-bind:value="'payment.' + pm.code" v-model="data.role.permissions" /></dd>
					</template>
				</dl>
			</fieldset>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>
</div>`,
	methods: {
	}
});
