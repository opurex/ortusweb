Vue.component("vue-cashregister-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=cashregister">Ajouter une caisse</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<col />
			<col />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Référence</th>
					<th>Désignation</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="cashRegister in data.cashRegisters">
					<td>{{cashRegister.reference}}</td>
					<td>{{cashRegister.label}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(cashRegister)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		editUrl: function(cr) {
			return "?p=cashregister&id=" + cr.id;
		},
	}
});

Vue.component("vue-cashregister-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'une caisse</h1>
		<form id="edit-category-form" onsubmit="javascript:cashregister_saveCashRegister(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-reference">Référence</label></dt>
				<dd><input class="form-control" id="edit-reference" type="text" v-model="data.cashRegister.reference" required="true" /></dd>

				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" v-model="data.cashRegister.label" required="true" /></dd>
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
	}
});
