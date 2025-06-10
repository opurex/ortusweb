Vue.component("vue-customer-list", {
	props: ["data"],
	data: function () {
		return {
			taLabels: {},
			taxLabels: {},
			dpLabels: {},
			filterVisible: this.data.filterVisible,
			customers: [], // in data instead of computed because asynchronous
			stats: {
				activeCount: 0,
				inactiveCount: 0,
				expiredActiveCount: 0,
				prepaidTotal: 0.0,
				debtTotal: 0.0,
				balanceTotal: 0.0,
			},
			customersTable: new Table().reference("customer-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The customer's profile picture. This field cannot be exported."))
				.column(new TableCol().reference("dispName").label("Displayed Name").visible(true).searchable(true).help("The customer's name as displayed or printed"))
				.column(new TableCol().reference("card").label("Card").visible(false).searchable(true).help("Card number or name."))
				.column(new TableCol().reference("balance").label("Balance").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The customer's account balance. Positive when the prepaid account is loaded, negative when the account has debts."))
				.column(new TableCol().reference("prepaid").label("Prepaid").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The prepaid amount of the customer's account. Filters only positive balances."))
				.column(new TableCol().reference("debt").label("Debt").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The debt amount of the customer's account. Filters only negative balances."))
				.column(new TableCol().reference("maxDebt").label("Max Debt").type(TABLECOL_TYPE.NUMBER2).visible(false).help("The maximum allowed debt for this account."))
				.column(new TableCol().reference("notes").label("Note").visible(false).help("The customer's profile notes."))
				.column(new TableCol().reference("expireDate").label("Expiration Date").type(TABLECOL_TYPE.DATE).visible(false).help("The expiration date of the customer's account."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates if the customer account can be used or not."))
				.column(new TableCol().reference("discountProfile").label("Discount Profile").visible(false).help("The automatically associated discount profile."))
				.column(new TableCol().reference("tariffArea").label("Tariff Area").visible(false).help("The automatically associated tariff area."))
				.column(new TableCol().reference("tax").label("VAT").visible(false).help("The automatically associated VAT rate."))
				.column(new TableCol().reference("firstName").label("First Name").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("lastName").label("Last Name").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("email").label("Email").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("phone1").label("Phone").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("phone2").label("Phone 2").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("fax").label("Fax").visible(false).help("Contact information."))
				.column(new TableCol().reference("addr1").label("Address").visible(false).help("Contact information."))
				.column(new TableCol().reference("addr2").label("Address 2").visible(false).help("Contact information."))
				.column(new TableCol().reference("zipCode").label("Postal Code").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("city").label("City").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("region").label("Region").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("country").label("Country").visible(false).searchable(true).help("Contact information."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
		};
	},
	template: `

<div class="customer-list">
	<section class="box box-medium">
		<header>
			<nav class="browser">
				<ul>
					<li><a href="?p=home">Home</a></li>
					<li><h1>Customer List</h1></li>
				</ul>
			</nav>
			<nav class="navbar">
				<ul>
					<li><a class="btn btn-add" href="?p=customer">Add a Customer</a></li>
					<li><a class="btn btn-add" href="?p=customerImport">Import a File</a></li>
				</ul>
				<ul>
					<li>
						<label for="filter-invisible">Status</label>
						<select id="filter-invisible" v-model="filterVisible">
							<option value="visible">Active</option>
							<option value="invisible">Inactive</option>
							<option value="all">All</option>
						</select>
					</li>
				</ul>
			</nav>
		</header>
		<article class="box-body">
			<vue-table v-bind:table="customersTable"></vue-table>
			<h3>Statistics</h3>
			<ul>
				<li>Active customer accounts: {{ stats.activeCount }}</li>
				<li>Inactive customer accounts: {{ stats.inactiveCount }}</li>
				<li>Expired active customer accounts: {{ stats.expiredActiveCount }}</li>
				<li>Total prepaid: {{ stats.prepaidTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
				<li>Total debt: {{ stats.debtTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
				<li>Total balance: {{ stats.balanceTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
			</ul>
		</article>
	</section>
</div>

	`,
	methods: {
		imageSrc: function (cust) {
			if (cust.hasImage) {
				return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
			}
		},
		editUrl: function (cust) {
			return "?p=customer&id=" + cust.id;
		},
		resetStats: function () {
			this.stats.activeCount = 0;
			this.stats.inactiveCount = 0;
			this.stats.expiredActiveCount = 0;
			this.stats.prepaidTotal = 0.0;
			this.stats.debtTotal = 0.0;
			this.stats.balanceTotal = 0.0;
		},
		assign: function (customers) {
			this.customers = customers;
			this.customersTable.resetContent();
			this.resetStats();
			for (let i = 0; i < this.customers.length; i++) {
				let cust = this.customers[i];
				let now = new Date();
				if (cust.visible) {
					this.stats.activeCount++;
					if (cust.expireDate && now > cust.expireDate) {
						this.stats.expiredActiveCount++;
					}
					if (cust.balance > 0.0) {
						this.stats.prepaidTotal += cust.balance;
					} else {
						this.stats.debtTotal -= cust.balance;
					}
					this.stats.balanceTotal += cust.balance;
				} else {
					this.inactiveCount++;
				}
				if (!((this.filterVisible == "all") || (this.filterVisible == "visible" && cust.visible) || (this.filterVisible == "invisible" && !cust.visible))) {
					continue;
				}
				(cust.discountProfile != null) ?
					cust.dpLabel = this.dpLabels[cust.discountProfile] :
					cust.dpLabel = "";
				(cust.tariffArea != null) ?
					cust.taLabel = this.taLabels[cust.tariffArea] :
					cust.taLabel = "";
				(cust.tax != null) ?
					cust.taxLabel = this.taxLabels[cust.tax] :
					cust.taxLabel = "";
				let line = [
					this.imageSrc(cust),
					cust.dispName, cust.card, cust.balance,
					(cust.balance > -0.005) ? cust.balance : 0.0,
					(cust.balance < 0.005) ? -cust.balance : 0.0,
					cust.maxDebt, cust.note, cust.expireDate,
					cust.visible,
					cust.dpLabel, cust.taLabel, cust.taxLabel, cust.firstName,
					cust.lastName, cust.email, cust.phone1, cust.phone2, cust.fax,
					cust.addr1, cust.addr2, cust.zipCode, cust.city, cust.region,
					cust.country,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cust) + "\">Modifier</a></div>"
				];
				this.customersTable.line(line);
			}
		},
		loadCustomers: function () {
			let thiss = this;
			gui_showLoading();
			storage_open(function (event) {
				storage_readStore("customers", function (customers) {
					storage_close();
					thiss.assign(customers.sort(tools_sort("dispName", "card")));
					gui_hideLoading();
				});
			});
		},
	},
	mounted: function () {
		for (let i = 0; i < this.data.tariffAreas.length; i++) {
			let ta = this.data.tariffAreas[i];
			this.taLabels[ta.id] = ta.label;
		}
		for (let i = 0; i < this.data.taxes.length; i++) {
			let tax = this.data.taxes[i];
			this.taxLabels[tax.id] = tax.label;
		}
		for (let i = 0; i < this.data.discountProfiles.length; i++) {
			let dp = this.data.discountProfiles[i];
			this.dpLabels[dp.id] = dp.label;
		}
		let customContactFields = this.data.contactFields;
		this.customersTable.columns().forEach(col => {
			if (col.reference() in customContactFields) {
				let custom = customContactFields[col.reference()];
				if (custom.value != "") {
					col.label(custom.value);
				}
			}
		});
		this.loadCustomers();
	},
	watch: {
		filterVisible: function (newVisible, oldVisible) {
			this.assign(this.customers);
		}
	}
});

Vue.component("vue-customer-form", {
	props: ["data"],
	data: function () {
		return {oldBalance: (this.data.customer.id != null) ? this.data.customer.balance : 0};
	},
	template: `
<div class="customer-form">
  <section class="box box-large">
    <header>
      <nav class="browser">
        <ul>
          <li><a href="?p=home">Home</a></li>
          <li><a href="?p=customers">Customer List</a></li>
          <li><h1>Edit Customer Profile</h1></li>
        </ul>
      </nav>
    </header>
    <article class="box-body">
      <form id="edit-customer-form" class="form-large" onsubmit="javascript:customers_saveCustomer(); return false;">
        <fieldset>
          <legend>Display</legend>
          <vue-input-text label="Display Name" v-model="data.customer.dispName" v-bind:required="true" id="edit-dispName" />
          <vue-input-text label="Card" v-model="data.customer.card" id="edit-card" />
          <vue-input-image label="Image" modelName="customer" v-bind:modelId="data.modelDef.modelId(data.customer)" v-model="data.image" v-bind:hadImage="data.customer.hasImage" id="edit-image" />
          <vue-input-checkbox label="Active" v-model="data.customer.visible" id="edit-visible" />
          <vue-input-textarea label="Notes" v-model="data.customer.note" id="edit-note" />
          <div class="form-group">
            <label for="edit-expireDate">Expiration Date</label>
            <vue-inputdate id="edit-expireDate" v-model="data.customer.expireDate" />
          </div>
        </fieldset>
        <fieldset>
          <legend>Prepayment and Credit</legend>
          <div class="form-group">
            <label for="show-balance">Balance</label>
            <input type="number" id="show-balance" v-model="data.customer.balance" disabled="true">
          </div>
          <vue-input-number label="Max Debt" v-model="data.customer.maxDebt" v-bind:step="0.01" v-bind:min="0.0" id="edit-maxDebt" />
        </fieldset>
        <fieldset>
          <legend>Special Pricing</legend>
          <div class="form-group">
            <label for="edit-discountProfile">Discount Profile</label>
            <select id="edit-discountProfile" v-model="data.customer.discountProfile">
              <option v-bind:value="null">No Discount Profile</option>
              <option v-for="discountProfile in data.discountProfiles" :key="discountProfile.id" v-bind:value="discountProfile.id">{{discountProfile.label}}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-tariffArea">Tariff Zone</label>
            <select class="form-control" id="edit-tariffArea" v-model="data.customer.tariffArea">
              <option v-bind:value="null">No Tariff Zone</option>
              <option v-for="tariffArea in data.tariffAreas" :key="tariffArea.id" v-bind:value="tariffArea.id">{{tariffArea.label}}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-tax">VAT</label>
            <select class="form-control" id="edit-tax" v-model="data.customer.tax">
              <option v-bind:value="null">No Change</option>
              <option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>Contact Details</legend>
          <vue-input-text v-bind:label="contactFieldLabel('firstName')" v-model="data.customer.firstName" id="edit-firstName" />
          <vue-input-text v-bind:label="contactFieldLabel('lastName')" v-model="data.customer.lastName" id="edit-lastName" />
          <vue-input-text v-bind:label="contactFieldLabel('email')" v-model="data.customer.email" id="edit-email" />
          <vue-input-text v-bind:label="contactFieldLabel('phone1')" v-model="data.customer.phone1" id="edit-phone1" />
          <vue-input-text v-bind:label="contactFieldLabel('phone2')" v-model="data.customer.phone2" id="edit-phone2" />
          <vue-input-text v-bind:label="contactFieldLabel('fax')" v-model="data.customer.fax" id="edit-fax" />
          <vue-input-text v-bind:label="contactFieldLabel('addr1')" v-model="data.customer.addr1" id="edit-addr1" />
          <vue-input-text v-bind:label="contactFieldLabel('addr2')" v-model="data.customer.addr2" id="edit-addr2" />
          <vue-input-text v-bind:label="contactFieldLabel('zipCode')" v-model="data.customer.zipCode" id="edit-zipCode" />
          <vue-input-text v-bind:label="contactFieldLabel('city')" v-model="data.customer.city" id="edit-city" />
          <vue-input-text v-bind:label="contactFieldLabel('region')" v-model="data.customer.region" id="edit-region" />
          <vue-input-text v-bind:label="contactFieldLabel('country')" v-model="data.customer.country" id="edit-country" />
        </fieldset>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
 

<section className="box box-medium" v-if="data.customer.id">
	<header>
		<h2>Purchase History</h2>
		<nav class="navbar">
			<form id="customer-history-filter" onSubmit="javascript:customers_filterHistory();return false;">
				<div className="form-group">
					<label htmlFor="start">From</label>
					<vue-inputdate id="start" v-model="data.start"/>
				</div>
				<div className="form-group">
					<label htmlFor="stop">to</label>
					<vue-inputdate v-model="data.stop"/>
				</div>
				<div className="form-group">
					<input id="consolidate" type="checkbox" v-model="data.consolidate"/>
					<label htmlFor="consolidate">Consolidate over the period</label>
				</div>
				<div className="form-control">
					<button className="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article className="box-body" id="customer-history" v-if="data.customerHistory">
		<vue-table v-bind:table="data.customerHistory"></vue-table>
	</article>
	<article className="box-body" id="customer-history-tickets"
			 style="display:flex;flex-direction:row;align-items:center;justify-content:space-around">
		<vue-tickets-table
			v-bind:tickets="data.tickets"
			v-bind:title="data.ticketsTitle"
			v-bind:cashRegisters="data.cashRegisters"
			v-bind:customers="customersProxy"
			v-bind:taxes="data.taxes"
			v-bind:paymentModes="data.paymentModes"
			v-bind:users="data.users"
		></vue-tickets-table>
	</article>
</section>
<section className="box box-tiny" v-if="data.customer.id">
	<header>
		<h2>Modify Balance</h2>
	</header>
	<article className="box-body">
		<p>
			Warning: Modifying the balance here will result in a discrepancy with the sales history.
			You must be able to justify this operation in your accounting (an invoice, a refund,
			an off-register payment, or any other document).
		</p>
		<form id="edit-customer-balance-form" className="form-tiny"
			  onSubmit="javascript:customers_saveBalance(); return false;">
			<div className="form-group">
				<label htmlFor="old-balance">Old Balance</label>
				<input type="number" id="old-balance" v-model="oldBalance" disabled="true"/>
			</div>
			<vue-input-number
				id="edit-balance"
				label="New Balance"
				v-model="data.customer.balance"
				v-bind:required.boolean="true"
				v-bind:step.number="0.01"
			/>
			<div className="form-control">
				<button className="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>

</div> `,

methods: {
	imageSrc: function (cust) {
		if (cust.hasImage) {
			return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
		} else {
			return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
		}
	}
,
	contactFieldLabel(reference)
	{
		if (this.data.contactFields[reference].value) {
			return this.data.contactFields[reference].value;
		} else {
			return this.data.contactFields[reference].default;
		}
	}
}
,
computed: {
	customersProxy: function () {
		return [this.data.customer];
	}
}
})
;

Vue.component("vue-customer-import", {
	props: ["data"],
	data: function () {
		return {
			csv: null,
			linkedRecords: {
				discountProfile: this.data.discountProfiles,
				tariffArea: this.data.tariffAreas,
				tax: this.data.taxes,
			},
			importResult: null,
			tableColumns: [
				{field: "dispName", label: "Displayed Name"},
				{field: "card", label: "Card"},
				{field: "maxDebt", label: "Max Debt", type: "number"},
				{field: "note", label: "Note"},
				{field: "expireDate", label: "Expiration Date", type: "date"},
				{field: "visible", label: "Active", type: "boolean"},
				{field: "discountProfile", label: "Discount Profile", type: "record", modelName: "discountProfile"},
				{field: "tariffArea", label: "Tariff Zone", type: "record", modelName: "tariffArea"},
				{field: "tax", label: "VAT", type: "record", modelName: "tax"},
				{field: "firstName", label: this.contactFieldLabel("firstName")},
				{field: "lastName", label: this.contactFieldLabel("lastName")},
				{field: "email", label: this.contactFieldLabel("email")},
				{field: "phone1", label: this.contactFieldLabel("phone1")},
				{field: "phone2", label: this.contactFieldLabel("phone2")},
				{field: "fax", label: this.contactFieldLabel("fax")},
				{field: "addr1", label: this.contactFieldLabel("addr1")},
				{field: "addr2", label: this.contactFieldLabel("addr2")},
				{field: "zipCode", label: this.contactFieldLabel("zipCode")},
				{field: "city", label: this.contactFieldLabel("city")},
				{field: "region", label: this.contactFieldLabel("region")},
				{field: "country", label: this.contactFieldLabel("country")},
			]

		};
	},
	template: `<div class="customer-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=customers">Customer List</a></li>
				<li><h1>Edit Customer Records via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview
			newTitle="New Records"
			editTitle="Modified Records"
			unchangedTitle="Unchanged Records"
			modelsLabel="Customer Records"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:allRecords="data.customers"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
  </div> `,
methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function (data) {
				thiss.importResult = data;
			}
			reader.onload = function (readerEvent) {
				let fileContent = readerEvent.target.result;
				_customers_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function () {
			customers_saveCustomers();
		},
		reset: function () {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
		contactFieldLabel(reference) {
			if (this.data.contactFields[reference].value) {
				return this.data.contactFields[reference].value;
			} else {
				return this.data.contactFields[reference].default;
			}
		}
	}
});
