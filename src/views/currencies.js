Vue.component("vue-currency-list", {
	props: ["data"],
	data: function() {
		return {
			currenciesTable: new Table().reference("currency-list")
				.column(new TableCol().reference("reference").label("Référence").visible(false).searchable(true).help("La référence doit être unique pour chaque devise. Elle permet la modification lors de l'import."))
				.column(new TableCol().reference("label").label("Désignation").visible(true).searchable(true).help("Le nom de la devise tel qu'affiché sur les boutons de la caisse."))
				.column(new TableCol().reference("main").label("Principale").type(TABLECOL_TYPE.BOOL).visible(false).help("Si cette devise est la devise par défaut, devise de référence pour les montants."))
				.column(new TableCol().reference("rate").label("Taux").type(TABLECOL_TYPE.NUMBER).visible(true).help("Taux de change vers la devise principale."))
				.column(new TableCol().reference("symbol").label("Symbole").visible(false).searchable(true).help("Le symbole monétaire de la devise."))
				.column(new TableCol().reference("decimalSeparator").label("Sep. décimales").visible(false).help("Le séparateur entre les entiers et les décimales (souvent , ou .)"))
				.column(new TableCol().reference("thousandsSeparator").label("Sep. milliers").visible(false).help("Le séparateur entre les milliers (souvent vide ou espace)."))
				.column(new TableCol().reference("format").label("Format").visible(false).help("Le format d'affichage des valeurs."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(true).help("Si la devise est utilisable ou non."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="currency-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des devises</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=currency">Ajouter une devise</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="currenciesTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(curr) {
			return "?p=currency&id=" + curr.id;
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.currencies.length; i++) {
			let curr = this.data.currencies[i];
			let line = [
				curr.reference, curr.label,
				curr.main, curr.rate,
				curr.symbol, curr.decimalSeparator, curr.thousandsSeparator,
				curr.format, curr.visible,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(curr) + "\">Modifier</a></div>",
			];
			this.currenciesTable.line(line);
		}
	}
});

Vue.component("vue-currency-form", {
	props: ["data"],
	data: function() {
		return {mainCurrencyLbl: "", sample: ""};
	},
	template: `<div class="currency-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=currencies">Liste des devises</a></li>
				<li><h1>Édition d'une devise</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-currency-form" class="form-large" onsubmit="javascript:currency_saveCurrency(); return false;">
			<fieldset>
				<legend>Description</legend>
				<div class="form-group">
					<label for="edit-label">Désignation</label>
					<input id="edit-label" type="text" v-model="data.currency.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-reference">Référence</label>
					<input id="edit-reference" type="text" v-model="data.currency.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Taux de change</label>
					<span>1 {{data.currency.label}} = </span>
					<input id="edit-dispOrder" type="number" v-model.number="data.currency.rate" min="0.00" step="0.01">
					<span> {{mainCurrencyLbl}}</span>
				</div>
				<div class="form-group">
					<input id="edit-main" type="checkbox" name="main" v-model="data.currency.main" v-bind:disabled="data.wasMain" />
					<label for="edit-main">Devise principale</label>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="main" v-model="data.currency.visible">
					<label for="edit-visible">Active</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Format</legend>
				<div class="form-group">
					<label for="edit-symbole">Symbole monétaire</label>
					<input id="edit-symbol" type="text" v-model="data.currency.symbol" />
				</div>
				<div class="form-group">
					<label for="edit-decimal">Séparateur de décimales</label>
					<input id="edit-decimal" type="text" v-model="data.currency.decimalSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-thousand">Séparateur de milliers</label>
					<input id="edit-thousand" type="text" v-model="data.currency.thousandsSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-format">Format</label>
					<input id="edit-format" type="text" v-model="data.currency.format" />
				</div>
				<div>Le format est un champ technique. Le format courant est #,##0.00$ (2 décimales, symbole monétaire en fin, chiffres regroupés par 3).
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
		imageSrc: function(cat) {
			if (cat.hasImage) {
				return login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
			}
		}
	},
	mounted: function() {
		for (let i = 0; i < this.data.currencies.length; i++) {
			if (this.data.currencies[i].main) {
				this.mainCurrencyLbl = this.data.currencies[i].label;
				break;
			}
		}
	}
});

