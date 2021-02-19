Vue.component("vue-customer-list", {
	props: ["data"],
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
		<table>
			<thead>
				<tr>
					<th>Nom</th>
					<th>Solde</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody id="customer-list">
				<tr v-for="customer in data.customers">
					<td>
						<img class="thumbnail thumbnail-text" v-bind:src="imageSrc(customer)" />{{customer.dispName}}
					</td>
					<td>{{customer.balance.toLocaleString()}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(customer)">Modifier</a></nav></td>
				</tr>
			</tbody>
		</table>
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
					<input id="edit-expireDate" type="text" v-model="data.customer.expireDate" />
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

