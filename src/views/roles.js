Vue.component("vue-role-list", {
	props: ["data"],
	data: function() {
		return {
			rolesTable: new Table().reference("role-list")
				.column(new TableCol().reference("name").label("Name"))
				.column(new TableCol().reference("operation").label("Action").type(TABLECOL_TYPE.HTML).exportable(false))
		};
	},
	template: `<div class="role-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Role List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<a class="btn btn-add" href="?p=role">Add a Role</a>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="rolesTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(role) {
			return "?p=role&id=" + role.id;
		},
	},
	mounted: function() {
		this.data.roles.forEach(r => {
			this.rolesTable.line([r.name, `<a class="btn btn-edit" href="${this.editUrl(r)}">Edit</a>`]);
		});
	}
});

Vue.component("vue-role-form", {
	props: ["data"],
	template: `<div class="role-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=roles">Role List</a></li>
				<li><h1>Edit a Role</h1></li>
			</ul>
		</nav>
	</header>	
	<article class="box-body">
		<form id="edit-category-form" class="form-large form-mosaic" onsubmit="javascript:role_saveRole(); return false;">
			<fieldset class="form-tiny">
				<legend>Display</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-name" type="text" v-model="data.role.name" required="true" />
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Cash Sessions</legend>
				<div class="form-group" v-for="sessPerm in data.permissions.session">
					<input v-bind:id="'edit-session-' + sessPerm.value" type="checkbox" v-bind:value="sessPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-session-' + sessPerm.value">{{sessPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Sales</legend>
				<div class="form-group" v-for="ticketsPerm in data.permissions.tickets">
					<input v-bind:id="'edit-ticket-' + ticketsPerm.value" type="checkbox" v-bind:value="ticketsPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + ticketsPerm.value">{{ticketsPerm.name}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Payment Methods</legend>
				<div class="form-group" v-for="pm in data.paymentModes">
					<input v-bind:id="'edit-pm-' + pm.reference" type="checkbox" v-bind:value="'payment.' + pm.reference" v-model="data.role.permissions" />
					<label v-bind:for="'edit-pm-' + pm.reference">{{pm.label}}</label>
				</div>
			</fieldset>
			<fieldset class="form-tiny">
				<legend>Miscellaneous</legend>
				<div class="form-group" v-for="miscPerm in data.permissions.misc">
					<input v-bind:id="'edit-ticket-' + miscPerm.value" type="checkbox" v-bind:value="miscPerm.value" v-model="data.role.permissions" />
					<label v-bind:for="'edit-ticket-' + miscPerm.value">{{miscPerm.name}}</label>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
	}
});
