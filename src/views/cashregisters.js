Vue.component("vue-cashregister-list", {
	props: ["data"],
	template: `<div class="cashregister-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des caisses</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=cashregister">Ajouter une caisse</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
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
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(cashRegister)">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(cr) {
			return "?p=cashregister&id=" + cr.id;
		},
	}
});

Vue.component("vue-cashregister-form", {
	props: ["data"],
	template: `<div class="cashregister-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=cashregisters">Liste des caisses</a></li>
				<li><h1>Édition d'une caisse</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:cashregister_saveCashRegister(); return false;">
			<div class="form-group">
				<label for="edit-reference">Référence</label>
				<input id="edit-reference" type="text" v-model="data.cashRegister.reference" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-label">Désignation</label>
				<input id="edit-label" type="text" v-model="data.cashRegister.label" required="true" />
			</div>
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
