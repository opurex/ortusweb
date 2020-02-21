Vue.component("vue-currency-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=currency">Ajouter une devise</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
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
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(currency)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		editUrl: function(curr) {
			return "?p=currency&id=" + curr.id;
		},
	},
});

Vue.component("vue-currency-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'une devise</h1>
		<form id="edit-currency-form" onsubmit="javascript:currency_saveCurrency(); return false;">
			<fieldset class="form-group">
				<legend>Description</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-label">Désignation</label></dt>
					<dd><input class="form-control" id="edit-label" type="text" v-model="data.currency.label" required="true" /></dd>

					<dt><label for="edit-reference">Référence</label></dt>
					<dd><input class="form-control" id="edit-reference" type="text" v-model="data.currency.reference" required="true" /></dd>

					<dt><label for="edit-dispOrder">Taux de change</label></dt>
					<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.currency.rate" min="0.00" step="0.01"></dd>

					<dt><label for="edit-main">Devise principale</label></dt>
					<dd><input class="form-control" id="edit-main" type="checkbox" name="main" v-model="data.currency.main" v-bind:disabled="data.wasMain" /></dd>

					<dt><label for="edit-visible">Active</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" name="main" v-model="data.currency.visible"></dd>
				</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Format</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-symbole">Symbole monétaire</label></dt>
					<dd><input class="form-control" id="edit-symbol" type="text" v-model="data.currency.symbol" /></dd>

					<dt><label for="edit-decimal">Séparateur de décimales</label></dt>
					<dd><input class="form-control" id="edit-decimal" type="text" v-model="data.currency.decimalSeparator" /></dd>

					<dt><label for="edit-thousand">Séparateur de milliers</label></dt>
					<dd><input class="form-control" id="edit-thousand" type="text" v-model="data.currency.thousandsSeparator" /></dd>

					<dt><label for="edit-format">Format</label></dt>
					<dd><input class="form-control" id="edit-format" type="text" v-model="data.currency.format" /></dd>
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
		imageSrc: function(cat) {
			if (cat.hasImage) {
				return login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
			}
		}
	}
});

