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
					{reference: "balance", label: "Solde", visible: true, help: "Le solde du compte client. Positif lorsque le compte pré-payé est chargé, négatif lorsque le compte a des dettes."},
					{reference: "maxDebt", label: "Dette max", visible: false, help: "Le montant de dette maximal autorisé pour ce compte."},
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
			if (cust.tariffArea != null) {
				cust.tariffArea = taLabels[cust.tariffArea];
			} else {
				cust.tariffArea = "-";
			}
			if (cust.tax != null) {
				cust.tax = taxLabels[cust.tax];
			} else {
				cust.tax = "-";
			}
			if (cust.discountProfile != null) {
				cust.discountProfile = dpLabels[cust.discountProfile];
			} else {
				cust.discountProfile = "-";
			}
			if (cust.expireDate != null) {
				cust.expireDate = tools_dateToString(cust.expireDate);
			} else {
				cust.expireDate = "-";
			}
			let line = [
				{type: "thumbnail", src: this.imageSrc(cust)},
				cust.dispName, cust.card, cust.balance, cust.maxDebt,
				cust.note, cust.expireDate,
				{type: "bool", value: cust.visible},
				cust.discountProfile, cust.tariffArea, cust.tax, cust.firstName,
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
				<div class="form-group">
					<label for="edit-dispName">Nom affiché</label>
					<input id="edit-dispName" type="text" v-model="data.customer.dispName" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-card">Carte</label>
					<input id="edit-card" type="text" v-model="data.customer.card" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.customer.hasImage" id="customer-image" class="img img-thumbnail" v-bind:src="imageSrc(data.customer)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:customers_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</div>
				<div class="form-group">
					<label for="edit-visible">Actif</label>
					<input id="edit-visible" type="checkbox" v-model="data.customer.visible" />
				</div>
				<div class="form-group">
					<label for="edit-note">Notes</label>
					<textarea id="edit-note" v-model="data.customer.note"></textarea>
				</div>
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
				<div class="form-group">
					<label for="edit-maxDebt">Dette max.</label>
					<input type="number" id="edit-maxDebt" v-model="data.customer.maxDebt" step="0.01" />
				</div>
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
				<div class="form-group">
					<label for="edit-firstName">Prénom</label>
					<input id="edit-firstName" type="text" v-model="data.customer.firstName" />
				</div>
				<div class="form-group">
					<label for="edit-lastName">Nom</label>
					<input id="edit-lastName" type="text" v-model="data.customer.lastName" />
				</div>
				<div class="form-group">
					<label for="edit-email">Email</label>
					<input id="edit-email" type="text" v-model="data.customer.email" />
				</div>
				<div class="form-group">
					<label for="edit-phone1">Téléphone</label>
					<input id="edit-phone1" type="text" v-model="data.customer.phone1" />
				</div>
				<div class="form-group">
					<label for="edit-phone2">Téléphone 2</label>
					<input id="edit-phone2" type="text" v-model="data.customer.phone2" />
				</div>
				<div class="form-group">
					<label for="edit-fax">Fax</label>
					<input id="edit-fax" type="text" v-model="data.customer.fax" />
				</div>
				<div class="form-group">
					<label for="edit-addr1">Adresse</label>
					<input id="edit-addr1" type="text" v-model="data.customer.addr1" />
				</div>
				<div class="form-group">
					<label for="edit-addr2">Adresse 2</label>
					<input id="edit-addr2" type="text" v-model="data.customer.addr2" />
				</div>
				<div class="form-group">
					<label for="edit-zipCode">Code postal</label>
					<input id="edit-zipCode" type="text" v-model="data.customer.zipCode" />
				</div>
				<div class="form-group">
					<label for="edit-city">Ville</label>
					<input id="edit-city" type="text" v-model="data.customer.city" />
				</div>
				<div class="form-group">
					<label for="edit-region">Région</label>
					<input  id="edit-region" type="text" v-model="data.customer.region" />
				</div>
				<div class="form-group">
					<label for="edit-country">Pays</label>
					<input id="edit-country" type="text" v-model="data.customer.country" />
				</div>
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

