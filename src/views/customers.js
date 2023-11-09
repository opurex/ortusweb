Vue.component("vue-customer-list", {
	props: ["data"],
	data: function() {
		return {
			taLabels: {},
			taxLabels: {},
			dpLabels: {},
			filterVisible: this.data.filterVisible,
			customers: [], // in data instead of computed because asychronous
			stats: {activeCount: 0, inactiveCount: 0, expiredActiveCount: 0, prepaidTotal: 0.0, debtTotal: 0.0, balanceTotal: 0.0},
			customersTable: new Table().reference("customer-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("L'image de profil du client. Ce champ ne peut être exporté."))
				.column(new TableCol().reference("dispName").label("Nom affiché").visible(true).searchable(true).help("Le nom du client tel qu'affiché ou imprimé"))
				.column(new TableCol().reference("card").label("Carte").visible(false).searchable(true).help("Le numéro ou nom de carte."))
				.column(new TableCol().reference("balance").label("Solde").type(TABLECOL_TYPE.NUMBER2).visible(true).help("Le solde du compte client. Positif lorsque le compte pré-payé est chargé, négatif lorsque le compte a des dettes."))
				.column(new TableCol().reference("maxDebt").label("Dette max").type(TABLECOL_TYPE.NUMBER2).visible(false).help("Le montant de dette maximal autorisé pour ce compte."))
				.column(new TableCol().reference("notes").label("Note").visible(false).help("Les notes de la fiche client."))
				.column(new TableCol().reference("expireDate").label("Date d'expiration").type(TABLECOL_TYPE.DATE).visible(false).help("La date d'expiration du compte client."))
				.column(new TableCol().reference("visible").label("Actif").type(TABLECOL_TYPE.BOOL).visible(false).help("Indique si le compte client peut être utilisé ou non."))
				.column(new TableCol().reference("discountProfile").label("Profil de remise").visible(false).help("Le profil de remise automatiquement associé."))
				.column(new TableCol().reference("tariffArea").label("Zone tarifaire").visible(false).help("La zone tarifaire automatiquement associée."))
				.column(new TableCol().reference("tax").label("TVA").visible(false).help("Le taux de TVA automatiquement associé."))
				.column(new TableCol().reference("firstName").label("Prénom").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("lastName").label("Nom").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("email").label("Courriel").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("phone1").label("Téléphone").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("phone2").label("Téléphone 2").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("fax").label("Fax").visible(false).help("Information de contact."))
				.column(new TableCol().reference("addr1").label("Adresse").visible(false).help("Information de contact."))
				.column(new TableCol().reference("addr2").label("Adresse 2").visible(false).help("Information de contact."))
				.column(new TableCol().reference("zipCode").label("Code postal").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("city").label("Ville").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("region").label("Région").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("country").label("Pays").visible(false).searchable(true).help("Information de contact."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
		};
	},
	template: `<div class="customer-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des clients</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=customer">Ajouter un client</a></li>
				<li><a class="btn btn-add" href="?p=customerImport">Importer un fichier</a></li>
			</ul>
			<ul>
				<li>
					<label for="filter-invisible">État</label>
					<select id="filter-invisible" v-model="filterVisible">
						<option value="visible">Actifve</option>
						<option value="invisible">Inactifve</option>
						<option value="all">Toustes</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="customersTable"></vue-table>
		<h3>Statistiques</h3>
		<ul>
			<li>Comptes clients actifs : {{ stats.activeCount }}</li>
			<li>Comptes clients inactifs : {{ stats.inactiveCount }}</li>
			<li>Comptes clients actifs expirés : {{ stats.expiredActiveCount }}</li>
			<li>Cumul pré-payé : {{ stats.prepaidTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
			<li>Cumul dette : {{ stats.debtTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
			<li>Solde total : {{ stats.balanceTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</li>
		</ul>
	</article>
</section>
</div>
`,
	methods: {
		imageSrc: function(cust) {
			if (cust.hasImage) {
				return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
			}
		},
		editUrl: function(cust) {
			return "?p=customer&id=" + cust.id;
		},
		assign: function(customers) {
			this.customers = customers;
			this.customersTable.resetContent();
			for (let i = 0; i < this.customers.length; i++) {
				let cust = this.customers[i];
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
					cust.dispName, cust.card, cust.balance, cust.maxDebt,
					cust.note, cust.expireDate,
					cust.visible,
					cust.dpLabel, cust.taLabel, cust.taxLabel, cust.firstName,
					cust.lastName, cust.email, cust.phone1, cust.phone2, cust.fax,
					cust.addr1, cust.addr2, cust.zipCode, cust.city, cust.region,
					cust.country,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cust) + "\">Modifier</a></div>"
				];
				this.customersTable.line(line);
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
			}
		},
		loadCustomers: function() {
			let thiss = this;
			gui_showLoading();
			storage_open(function(event) {
				storage_readStore("customers", function(customers) {
					storage_close();
					thiss.assign(customers.sort(tools_sort("dispName", "card")));
					gui_hideLoading();
				});
			});
		},
	},
	mounted: function() {
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
		filterVisible: function(newVisible, oldVisible) {
			this.assign(this.customers);
		}
	}
});

Vue.component("vue-customer-form", {
	props: ["data"],
	data: function() {
		return { oldBalance: (this.data.customer.id != null) ? this.data.customer.balance : 0 };
	},
	template : `<div class="customer-form">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=customers">Liste des clients</a></li>
				<li><h1>Édition d'une fiche client</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-customer-form" class="form-large" onsubmit="javascript:customers_saveCustomer(); return false;">
			<fieldset>
				<legend>Affichage</legend>
				<vue-input-text label="Nom affiché" v-model="data.customer.dispName" v-bind:required="true" id="edit-dispName" />
				<vue-input-text label="Carte" v-model="data.customer.card" id="edit-card" />
				<vue-input-image label="Image" modelName="customer" v-bind:modelId="data.modelDef.modelId(data.customer)" v-model="data.image" v-bind:hadImage="data.customer.hasImage" id="edit-image" />
				<vue-input-checkbox label="Actif" v-model="data.customer.visible" id="edit-visible" />
				<vue-input-textarea label="Notes" v-model="data.customer.note" id="edit-note" />
				<div class="form-group">
					<label for="edit-expireDate">Date d'expiration</label>
					<vue-inputdate id="edit-expireDate" v-model="data.customer.expireDate" />
				</div>
			</fieldset>
			<fieldset>
				<legend>Pré-paiement et crédits</legend>
				<div class="form-group">
					<label for="show-balance">Solde</label>
					<input type="number" id="show-balance" v-model="data.customer.balance" disabled="true">
				</div>
				<vue-input-number label="Dette max." v-model="data.customer.maxDebt" v-bind:step="0.01" v-bind:min="0.0" id="edit-maxDebt" />
			</fieldset>
			<fieldset>
				<legend>Tarifications spéciales</legend>
				<div class="form-group">
					<label for="edit-discountProfile">Profil de remise</label>
					<select id="edit-discountProfile" v-model="data.customer.discountProfile">
						<option v-bind:value="null">Pas de profil de remise</option>
						<option v-for="discountProfile in data.discountProfiles" :key="discountProfile.id" v-bind:value="discountProfile.id">{{discountProfile.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-tariffArea">Zone tarifaire</label>
					<select class="form-control" id="edit-tariffArea" v-model="data.customer.tariffArea">
						<option v-bind:value="null">Pas de zone tarifaire</option>
						<option v-for="tariffArea in data.tariffAreas" :key="tariffArea.id" v-bind:value="tariffArea.id">{{tariffArea.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-tax">TVA</label>
					<select class="form-control" id="edit-tax" v-model="data.customer.tax">
						<option v-bind:value="null">Pas de modification</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
			</fieldset>
			<fieldset>
				<legend>Coordonnées</legend>
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
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>

<section class="box box-medium" v-if="data.customer.id">
	<header>
		<h2>Historique d'achat</h2>
		<nav class="navbar">
			<form id="customer-history-filter" onsubmit="javascript:customers_filterHistory();return false;">
				<div class="form-group">
					<label for="start">Du</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">au</label>
					<vue-inputdate v-model="data.stop" />
				</div>
				<div class="form-group">
					<input id="consolidate" type="checkbox" v-model="data.consolidate" />
					<label for="consolidate">Consolider sur la période</label>
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="customer-history" v-if="data.customerHistory">
		<vue-table v-bind:table="data.customerHistory"></vue-table>
	</article>
	<article class="box-body" id="customer-history-tickets" style="display:flex;flex-direction:row;align-items:center;justify-content:space-around">
		<vue-table v-bind:table="data.customerHistoryTickets" ref="ticketTable"></vue-table>
		<vue-tickets-content v-if="data.selectedTicket" v-bind:ticket="data.selectedTicket"></vue-tickets-content>
	</article>
</section>

<section class="box box-tiny" v-if="data.customer.id">
	<header>
		<h2>Modifier le solde</h2>
	</header>
	<article class="box-body">
		<p>Attention : modifier le solde ici fera apparaître une incohérence avec l'historique des ventes. Vous devez pouvoir justifier cette opération dans votre comptabilité (une facture, un remboursement, un paiement hors caisse ou tout autre document).</p>
		<form id="edit-customer-balance-form" class="form-tiny" onsubmit="javascript:customers_saveBalance(); return false;">
			<div class="form-group">
				<label for="old-balance">Ancien solde</label>
				<input type="number" id="old-balance" v-model="oldBalance" disabled="true" />
			</div>
			<vue-input-number id="edit-balance" label="Nouveau solde" v-model="data.customer.balance" v-bind:required.boolean="true" v-bind:step.number="0.01" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>
`,
	methods: {
		imageSrc: function(cust) {
			if (cust.hasImage) {
				return login_getHostUrl() + "/api/image/customer/" + cust.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/customer/default?Token=" + login_getToken();
			}
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

Vue.component("vue-customer-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			linkedRecords: {
				discountProfile: this.data.discountProfiles,
				tariffArea: this.data.tariffAreas,
				tax: this.data.taxes,
			},
			importResult: null,
			tableColumns: [
				{field: "dispName", label: "Nom affiché"},
				{field: "card", label: "Carte"},
				{field: "maxDebt", label: "Dette max", type: "number"},
				{field: "note", label: "Note"},
				{field: "expireDate", label: "Date d'expiration", type: "date"},
				{field: "visible", label: "Actif", type: "boolean"},
				{field: "discountProfile", label: "Profil de remise", type: "record", modelName: "discountProfile"},
				{field: "tariffArea", label: "Zone tarifaire", type: "record", modelName: "tariffArea"},
				{field: "tax", label: "TVA", type: "record", modelName: "tax"},
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
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=customers">Liste des clients</a></li>
				<li><h1>Modification des fiches client par fichier csv</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">Fichier</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview newTitle="Nouvelles fiches" editTitle="Fiches modifiées" unchangedTitle="Fiches non modifiées" modelsLabel="fiches client"
			v-bind:importResult="importResult"
			v-bind:allRecords="data.customers"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
</div>`,
	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.importResult = data;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				_customers_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			customers_saveCustomers();
		},
		reset: function() {
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
