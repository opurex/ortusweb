Vue.component("vue-tax-list", {
	props: ["data"],
	data: function() {
		return {
			taxesTable: new Table().reference("tax-list")
				.column(new TableCol().reference("label").label("Désignation").visible(true).help("Le nom de la taxe."))
				.column(new TableCol().reference("rate").label("Taux").type(TABLECOL_TYPE.PERCENT).visible(false).help("Le taux appliqué."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
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
				tax.rate,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(tax) + "\">Modifier</a></div>"
			];
			this.taxesTable.line(line);
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
			<vue-input-text label="Désignation" v-model="data.tax.label" v-bind:required="true" id="edit-label" />
			<vue-input-rate label="Taux" v-model.number="data.tax.rate" id="edit-rate" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`
});

