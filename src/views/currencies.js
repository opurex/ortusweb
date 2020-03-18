Vue.component("vue-currency-list", {
	props: ["data"],
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
		<table>
			<col />
			<col style="width:10%; min-width: 5em;" />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Désignation</th>
					<th>Taux de change</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="currency in data.currencies">
					<td>{{currency.label}}</td>
					<td>{{currency.rate.toLocaleString()}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(currency)">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(curr) {
			return "?p=currency&id=" + curr.id;
		},
	},
});

Vue.component("vue-currency-form", {
	props: ["data"],
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
					<input id="edit-dispOrder" type="number" v-model.number="data.currency.rate" min="0.00" step="0.01">
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
	}
});

