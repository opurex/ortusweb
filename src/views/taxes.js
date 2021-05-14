Vue.component("vue-tax-list", {
	props: ["data"],
	data: function() {
		return {
			taxesTable: {
				reference: "tax-list",
				columns: [
					{reference: "label", label: "Désignation", visible: true, help: "Le nom de la taxe."},
					{reference: "rate", label: "Taux", visible: false, help: "Le taux appliqué."},
					{reference: "operation", label: "Opération", export: false, visible: true},
				],
				lines: []
			},
		};
	},
	template: `<div class="tax-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des taux de TVA</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=tax">Ajouter un taux</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-table v-bind:table="taxesTable"></vue-table>
	</div>
</section>
</div>`,
	methods: {
		editUrl: function(tax) {
			return "?p=tax&id=" + tax.id;
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.taxes.length; i++) {
			let tax = this.data.taxes[i];
			let line = [
				tax.label,
				(tax.rate * 100).toLocaleString() + " %",
				{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(tax) + "\">Modifier</a></div>"},
			];
			this.taxesTable.lines.push(line);
		}
	}
});

Vue.component("vue-tax-form", {
	props: ["data"],
	template: `<div class="tax-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=taxes">Liste des taxes</a></li>
				<li><h1>Édition d'une taxe</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:taxes_saveTax(); return false;">
			<div class="form-group">
				<label for="edit-label">Désignation</label>
				<input id="edit-label" type="text" v-model="data.tax.label" required="true" />
			</div>

			<div class="form-group">
				<label for="edit-rate">Taux</label>
				<input id="edit-rate" type="number" v-model.lazy="rate" step="0.01" min="0" max="100"> %
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	computed: {
		rate: {
			get: function() {
				return Number((this.data.tax.rate * 100.0).toFixed(2));
			},
			set: function(value) {
				this.data.tax.rate = Number((value / 100.0).toFixed(5));
			}
		}
	}
});

