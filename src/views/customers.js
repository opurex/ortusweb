Vue.component("vue-customer-list", {
	props: ["data"],
	data: function() {
		return {
			customersTable: {
				reference: "customer-list",
				columns: [
					{reference: "image", label: "Image", export: false, visible: true, help: "L'image de profil du client. Ce champ ne peut être exporté."},
					{reference: "dispName", label: "Nom affiché", visible: true, help: "Le nom du client tel qu'affiché ou imprimé"},
					{reference: "card", label: "Carte", visible: false, help: "Le numéro ou nom de carte."},
					{reference: "balance", label: "Solde", export_as_number: true, visible: true, help: "Le solde du compte client. Positif lorsque le compte pré-payé est chargé, négatif lorsque le compte a des dettes."},
					{reference: "maxDebt", label: "Dette max", export_as_number: true, visible: false, help: "Le montant de dette maximal autorisé pour ce compte."},
					{reference: "notes", label: "Note", visible: false, help: "Les notes de la fiche client."},
					{reference: "expireDate", label: "Date d'expiration", visible: false, help: "La date d'expiration du compte client."},
					{reference: "visible", label: "Actif", visible: false, help: "Indique si le compte client peut être utilisé ou non."},
					{reference: "discountProfile", label: "Profil de remise", help: "Le profil de remise automatiquement associé.", visible: false},
					{reference: "tariffArea", label: "Zone tarifaire", help: "La zone tarifaire automatiquement associée.", visible: false},
					{reference: "tax", label: "TVA", help: "Le taux de TVA automatiquement associé.", visible: false},
					{reference: "firstName", label: "Prénom", help: "Information de contact.", visible: false},
					{reference: "lastName", label: "Nom", help: "Information de contact.", visible: false},
					{reference: "email", label: "Courriel", help: "Information de contact.", visible: false},
					{reference: "phone1", label: "Téléphone", help: "Information de contact.", visible: false},
					{reference: "phone2", label: "Téléphone 2", help: "Information de contact.", visible: false},
					{reference: "fax", label: "Fax", help: "Information de contact.", visible: false},
					{reference: "addr1", label: "Adresse", help: "Information de contact.", visible: false},
					{reference: "addr2", label: "Adresse 2", help: "Information de contact.", visible: false},
					{reference: "zipCode", label: "Code postal", help: "Information de contact.", visible: false},
					{reference: "city", label: "Ville", help: "Information de contact.", visible: false},
					{reference: "region", label: "Région", help: "Information de contact.", visible: false},
					{reference: "country", label: "Pays", help: "Information de contact.", visible: false},
					{reference: "operation", label: "Opération", export: false, visible: true},
				],
				lines: []
			},
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
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="customersTable"></vue-table>
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
		}
	},
	mounted: function() {
		let taLabels = {};
		let taxLabels = {};
		let dpLabels = {};
		for (let i = 0; i < this.data.tariffAreas.length; i++) {
			let ta = this.data.tariffAreas[i];
			taLabels[ta.id] = ta.label;
		}
		for (let i = 0; i < this.data.taxes.length; i++) {
			let tax = this.data.taxes[i];
			taxLabels[tax.id] = tax.label;
		}
		for (let i = 0; i < this.data.discountProfiles.length; i++) {
			let dp = this.data.discountProfiles[i];
			dpLabels[dp.id] = dp.label;
		}
		for (let i = 0; i < this.data.customers.length; i++) {
			let cust = this.data.customers[i];
			(cust.discountProfile != null) ?
				cust.dpLabel = dpLabels[cust.discountProfile] :
				cust.dpLabel = "";
			(cust.tariffArea != null) ?
				cust.taLabel = taLabels[cust.tariffArea] :
				cust.taLabel = "";
			(cust.tax != null) ?
				cust.taxLabel = taxLabels[cust.tax] :
				cust.taxLabel = "";
			let line = [
				{type: "thumbnail", src: this.imageSrc(cust)},
				cust.dispName, cust.card, cust.balance, cust.maxDebt,
				cust.note, tools_dateToString(cust.expireDate),
				{type: "bool", value: cust.visible},
				cust.dpLabel, cust.taLabel, cust.taxLabel, cust.firstName,
				cust.lastName, cust.email, cust.phone1, cust.phone2, cust.fax,
				cust.addr1, cust.addr2, cust.zipCode, cust.city, cust.region,
				cust.country,
				{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cust) + "\">Modifier</a></div>"},
			];
			this.customersTable.lines.push(line);
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
				<vue-input-text label="Prénom" v-model="data.customer.firstName" id="edit-firstName" />
				<vue-input-text label="Nom" v-model="data.customer.lastName" id="edit-lastName" />
				<vue-input-text label="Email" v-model="data.customer.email" id="edit-email" />
				<vue-input-text label="Téléphone" v-model="data.customer.phone1" id="edit-phone1" />
				<vue-input-text label="Téléphone 2" v-model="data.customer.phone2" id="edit-phone2" />
				<vue-input-text label="Fax" v-model="data.customer.fax" id="edit-fax" />
				<vue-input-text label="Adresse" v-model="data.customer.addr1" id="edit-addr1" />
				<vue-input-text label="Adresse 2" v-model="data.customer.addr2" id="edit-addr2" />
				<vue-input-text label="Code Postal" v-model="data.customer.zipCode" id="edit-zipCode" />
				<vue-input-text label="Ville" v-model="data.customer.city" id="edit-city" />
				<vue-input-text label="Région" v-model="data.customer.region" id="edit-region" />
				<vue-input-text label="Pays" v-model="data.customer.country" id="edit-country" />
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
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="customer-history" v-if="data.customerHistory">
		<vue-table v-bind:table="data.customerHistory"></vue-table>
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
			<div class="form-group">
				<label for="edit-balance">Nouveau solde</label>
				<input type="number" id="edit-balance" v-model="data.customer.balance" step="0.01" />
			</div>
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
		}
	}
});

Vue.component("vue-customer-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			newCustomers: [],
			editedCustomers: [],
			editedValues: [],
			unchangedCustomers: [],
			linkedRecords: {
				discountProfile: this.data.discountProfiles,
				tariffArea: this.data.tariffAreas,
				tax: this.data.taxes,
			},
			showUnchanged: false,
			unknownColumns: [],
			errors: [],
			tableColumns: [
				{field: "dispName", label: "Nom affiché"},
				{field: "card", label: "Carte"},
				{field: "maxDebt", label: "Dette max", type: "number"},
				{field: "notes", label: "Note"},
				{field: "expireDate", label: "Date d'expiration", type: "date"},
				{field: "visible", label: "Actif", type: "boolean"},
				{field: "discountProfile", label: "Profil de remise", type: "record", modelName: "discountProfile"},
				{field: "tariffArea", label: "Zone tarifaire", type: "record", modelName: "tariffArea"},
				{field: "tax", label: "TVA", type: "record", modelName: "tax"},
				{field: "firstName", label: "Prénom"},
				{field: "lastName", label: "Nom"},
				{field: "email", label: "Courriel"},
				{field: "phone1", label: "Téléphone"},
				{field: "phone2", label: "Téléphone 2"},
				{field: "fax", label: "Fax"},
				{field: "addr1", label: "Adresse"},
				{field: "addr2", label: "Adresse 2"},
				{field: "zipCode", label: "Code postal"},
				{field: "city", label: "Ville"},
				{field: "region", label: "Région"},
				{field: "country", label: "Pays"},
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
		<vue-import-preview newTitle="Nouvelles fiches" editTitle="Fiches modifiées" untouchedTitle="Fiches non modifiées" modelsLabel="fiches client"
			v-bind:newRecords="newCustomers"
			v-bind:editedRecords="editedCustomers"
			v-bind:editedValues="editedValues"
			v-bind:untouchedRecords="unchangedCustomers"
			v-bind:allRecords="data.customers"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-bind:unknownColumns="unknownColumns"
			v-bind:errors="errors"
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
				thiss.newCustomers = data.newCustomers;
				thiss.editedCustomers = data.editedCustomers;
				thiss.editedValues = data.editedValues;
				thiss.unchangedCustomers  = data.unchangedCustomers;
				thiss.unknownColumns = data.unknownColumns;
				thiss.errors = data.errors;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _customers_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			customers_saveCustomers();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.newCustomers = [];
			this.editedCustomers = [];
			this.editedValues = [];
			this.unchangedCustomers = [];
			this.showUnchanged = false;
			this.unknownColumns = [];
			this.errors = [];
		},
	}
});
