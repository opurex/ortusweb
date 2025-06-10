Vue.component("vue-currency-list", {
	props: ["data"],
	data: function() {
		return {
			currenciesTable: new Table().reference("currency-list")
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("The reference must be unique for each currency. It allows editing during import."))
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The currency name as displayed on the POS buttons."))
				.column(new TableCol().reference("main").label("Main").type(TABLECOL_TYPE.BOOL).visible(false).help("If this currency is the default currency, reference currency for amounts."))
				.column(new TableCol().reference("rate").label("Rate").type(TABLECOL_TYPE.NUMBER).visible(true).help("Exchange rate to the main currency."))
				.column(new TableCol().reference("symbol").label("Symbol").visible(false).searchable(true).help("The currency symbol."))
				.column(new TableCol().reference("decimalSeparator").label("Decimal Sep.").visible(false).help("The separator between whole numbers and decimals (often , or .)"))
				.column(new TableCol().reference("thousandsSeparator").label("Thousands Sep.").visible(false).help("The separator between thousands (often empty or space)."))
				.column(new TableCol().reference("format").label("Format").visible(false).help("The display format for values."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(true).help("Whether the currency is usable or not."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="currency-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Currency List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=currency">Add a Currency</a></li>
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
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(curr) + "\">Edit</a></div>",
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
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=currencies">Currency List</a></li>
				<li><h1>Edit a Currency</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-currency-form" class="form-large" onsubmit="javascript:currency_saveCurrency(); return false;">
			<fieldset>
				<legend>Description</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-label" type="text" v-model="data.currency.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.currency.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Exchange Rate</label>
					<span>1 {{data.currency.label}} = </span>
					<input id="edit-dispOrder" type="number" v-model.number="data.currency.rate" min="0.00" step="0.01">
					<span> {{mainCurrencyLbl}}</span>
				</div>
				<div class="form-group">
					<input id="edit-main" type="checkbox" name="main" v-model="data.currency.main" v-bind:disabled="data.wasMain" />
					<label for="edit-main">Main Currency</label>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="main" v-model="data.currency.visible">
					<label for="edit-visible">Active</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Format</legend>
				<div class="form-group">
					<label for="edit-symbole">Currency Symbol</label>
					<input id="edit-symbol" type="text" v-model="data.currency.symbol" />
				</div>
				<div class="form-group">
					<label for="edit-decimal">Decimal Separator</label>
					<input id="edit-decimal" type="text" v-model="data.currency.decimalSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-thousand">Thousands Separator</label>
					<input id="edit-thousand" type="text" v-model="data.currency.thousandsSeparator" />
				</div>
				<div class="form-group">
					<label for="edit-format">Format</label>
					<input id="edit-format" type="text" v-model="data.currency.format" />
				</div>
				<div>The format is a technical field. The current format is #,##0.00$ (2 decimals, currency symbol at the end, digits grouped by 3).
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
