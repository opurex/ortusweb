Vue.component("vue-accounting-z", {
	props: ["data"],
	template: `<div class="accounting-z">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Accounting Entries for Z Tickets</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <form id="ztickets-filter" onsubmit="javascript:accounting_ztickets_filter();return false;">
        <div class="form-group">
          <label for="start">Open between</label>
          <vue-inputdate id="start" v-model="data.start" />
        </div>
        <div class="form-group">
          <label for="stop">and</label>
          <vue-inputdate id="stop" v-model="data.stop" />
        </div>
        <div class="form-control">
          <button class="btn btn-primary btn-send" type="submit">Search</button>
        </div>
      </form>
    </nav>
  </header>
  <article class="box-body">
    <p class="warning">This screen allows you to export your Z tickets as accounting entries to simplify import into third-party accounting software. This table cannot directly replace a cash journal.</p>
    <template v-if="hasMissing()">
      <p>The account number for the following lines is not configured:</p>
      <ul v-for="miss in missingList" :key="miss">
        <li>{{ miss }}</li>
      </ul>
    </template>
    <vue-table v-bind:table="data.table" ref="table"></vue-table>
  </article>
</section>
</div>
`,
	computed: {
		missingList: function () {
			let missList = [];
			let self = this;
			Object.keys(this.data.missing.sales).forEach(function (miss) {
				missList.push("Sales " + self.data.missing.sales[miss]);
			});
			Object.keys(this.data.missing.taxes).forEach(function (miss) {
				missList.push("Collected VAT " + self.data.missing.taxes[miss]);
			});
			Object.keys(this.data.missing.paymentModes).forEach(function (miss) {
				missList.push("Receipts " + self.data.missing.paymentModes[miss]);
			});
			Object.keys(this.data.missing.customers).forEach(function (miss) {
				missList.push("Customer balance " + self.data.missing.customers[miss]);
			});
			Object.keys(this.data.missing.extra).forEach(function (miss) {
				missList.push(self.data.missing.extra[miss]);
			});
			return missList;
		},
	},
	methods: {
		hasMissing: function () {
			return this.missingList.length > 0;
		},
	},
});

Vue.component("vue-accounting-config", {
	props: ["data"],
	template: `<div class="accounting-config">
<section class="box box-large">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Accounting Configuration</h1></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <form id="edit-accounting-form" class="form-large" onsubmit="javascript:accounting_saveConfig(); return false;">
      <fieldset>
        <legend>Sales</legend>
        <template v-for="t in data.taxes" :key="t.id">
          <vue-input-text :label="sales_label(t)" v-model="data.values.sales[t.id]" :id="'edit-sales-' + t.id" placeholder="70XXX" />
        </template>
        <vue-input-text label="Exceptional income" v-model="data.values.extra.extraCredit" id="extraCredit" placeholder="7788X" />
        <vue-input-text label="Exceptional loss" v-model="data.values.extra.extraDebit" id="extraDebit" placeholder="6788X" />
      </fieldset>
      <fieldset>
        <legend>Collected VAT</legend>
        <template v-for="t in data.taxes" :key="t.id">
          <vue-input-text :label="taxes_label(t)" v-model="data.values.taxes[t.id]" :id="'edit-tax-' + t.id" placeholder="44571XX" />
        </template>
      </fieldset>
      <fieldset>
        <legend>Receipts</legend>
        <template v-for="p in data.paymentModes" :key="p.id">
          <vue-input-text :label="pm_label(p)" v-model="data.values.paymentModes[p.id]" :id="'edit-pm-' + p.id" placeholder="5XXXXX" />
        </template>
      </fieldset>
      <fieldset>
        <legend>Customer balance</legend>
        <template v-for="c in data.customers" :key="c.id">
          <vue-input-text :label="cust_label(c)" v-model="data.values.customers[c.id]" :id="'edit-cust-' + c.id" placeholder="4111XXX" />
        </template>
      </fieldset>
      <div class="form-control">
        <button class="btn btn-primary btn-send" type="submit">Save</button>
      </div>
    </form>
  </article>
</section>
</div>`,
	methods: {
		sales_label: function (tax) {
			return "Sales " + tax.label;
		},
		taxes_label: function (tax) {
			return "Collected VAT " + tax.label;
		},
		pm_label: function (pm) {
			return "Receipts " + pm.label;
		},
		cust_label: function (cust) {
			return "Customer balance " + cust.dispName;
		},
	},
});
