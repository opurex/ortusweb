Vue.component("vue-customer-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=customer">Ajouter un client</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Solde</th>
				</tr>
			</thead>
			<tbody id="customer-list">
				<tr v-for="customer in data.customers">
					<td>
						<img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(customer)" />{{customer.dispName}}
					</td>
					<td>
						{{customer.balance}}<div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(customer)">Edit</a></div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
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
	template : `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un client</h1>
		<form id="edit-customer-form" onsubmit="javascript:customers_saveCustomer(); return false;">
			<fieldset class="form-group">
				<legend>Affichage</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-dispName">Nom affiché</label></dt>
					<dd><input class="form-control" id="edit-dispName" type="text" v-model="data.customer.dispName" required="true" /></dd>

					<dt><label for="edit-card">Carte</label></dt>
					<dd><input class="form-control" id="edit-card" type="text" v-model="data.customer.card" /></dd>

					<dt><label for="edit-image">Image</label></dt>
					<dd>
						<img v-if="data.customer.hasImage" id="customer-image" class="img img-thumbnail" v-bind:src="imageSrc(data.customer)" />
						<input id="edit-image" type="file" accept="image/*" />
						<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:customers_toggleImage();return false;" >{{data.deleteImageButton}}</a>
					</dd>

					<dt><label for="edit-visible">Actif</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" v-model="data.customer.visible" /></dd>

					<dt><label for="edit-note">Notes</label></dt>
					<dd><textarea class="form-control" id="edit-note" v-model="data.customer.note"></textarea></dd>

					<dt><label for="edit-expireDate">Date d'expiration</label></dt>
					<dd><input class="form-control" id="edit-expireDate" type="text" v-model="data.customer.expireDate" /></dd>
			</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Pré-paiement et crédits</legend>
				<dl class="dl-horizontal">
					<dt><label for="show-balance">Solde</label></dt>
					<dd><input type="number" id="show-balance" class="form-control" v-model="data.customer.balance" disabled="true"></dd>

					<dt><label for="edit-maxDebt">Dette max.</label></dt>
					<dd><input type="number" id="edit-maxDebt" class="form-control" v-model="data.customer.maxDebt" step="0.01" /></dd>
				</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Tarifications spéciales</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-discountProfile">Profil de remise</label></dt>
					<dd>
						<select class="form-control" id="edit-discountProfile" v-model="data.customer.discountProfile">
							<option value="">Pas de profil de remise</option>
							<option v-for="discountProfile in data.discountProfiles" :key="discountProfile.id" v-bind:value="discountProfile.id">{{discountProfile.label}}</option>
						</select>
					</dd>

					<dt><label for="edit-tariffArea">Zone tarifaire</label></dt>
					<dd>
						<select class="form-control" id="edit-tariffArea" v-model="data.customer.tariffArea">
							<option value="">Pas de zone tarifaire</option>
							<option v-for="tariffArea in data.tariffAreas" :key="tariffArea.id" v-bind:value="tariffArea.id">{{tariffArea.label}}</option>
						</select>
					</dd>

					<dt><label for="edit-tax">TVA</label></dt>
					<dd>
						<select class="form-control" id="edit-tax" v-model="data.customer.tax">
							<option value="">Pas de modification</option>
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select>
					</dd>

				</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Coordonnées</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-firstName">Prénom</label></dt>
					<dd><input class="form-control" id="edit-firstName" type="text" v-model="data.customer.firstName" /></dd>

					<dt><label for="edit-lastName">Nom</label></dt>
					<dd><input class="form-control" id="edit-lastName" type="text" v-model="data.customer.lastName" /></dd>

					<dt><label for="edit-email">Email</label></dt>
					<dd><input class="form-control" id="edit-email" type="text" v-model="data.customer.email" /></dd>

					<dt><label for="edit-phone1">Téléphone</label></dt>
					<dd><input class="form-control" id="edit-phone1" type="text" v-model="data.customer.phone1" /></dd>

					<dt><label for="edit-phone2">Téléphone 2</label></dt>
					<dd><input class="form-control" id="edit-phone2" type="text" v-model="data.customer.phone2" /></dd>

					<dt><label for="edit-fax">Fax</label></dt>
					<dd><input class="form-control" id="edit-fax" type="text" v-model="data.customer.fax" /></dd>

					<dt><label for="edit-addr1">Adresse</label></dt>
					<dd><input class="form-control" id="edit-addr1" type="text" v-model="data.customer.addr1" /></dd>

					<dt><label for="edit-addr2">Adresse 2</label></dt>
					<dd><input class="form-control" id="edit-addr2" type="text" v-model="data.customer.addr2" /></dd>

					<dt><label for="edit-zipCode">Code postal</label></dt>
					<dd><input class="form-control" id="edit-zipCode" type="text" v-model="data.customer.zipCode" /></dd>

					<dt><label for="edit-city">Ville</label></dt>
					<dd><input class="form-control" id="edit-city" type="text" v-model="data.customer.city" /></dd>

					<dt><label for="edit-region">Région</label></dt>
					<dd><input class="form-control" id="edit-region" type="text" v-model="data.customer.region" /></dd>

					<dt><label for="edit-country">Pays</label></dt>
					<dd><input class="form-control" id="edit-country" type="text" v-model="data.customer.country" /></dd>
				</dl>
			</fieldset>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
</div>
<div class="box" style="margin-top:1ex" v-if="data.customer.id">
	<div class="box-body">
		<h2>Modifier le solde</h2>
		<p>Attention : modifier le solde ici fera apparaître une incohérence avec l'historique des ventes. Vous devez pouvoir justifier cette opération dans votre comptabilité (une facture, un remboursement, un paiement hors caisse ou tout autre document).</p>
		<form id="edit-customer-balance-form" onsubmit="javascript:customers_saveBalance(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-balance">Solde</label></dt>
				<dd><input type="number" id="edit-balance" class="form-control" v-model="data.customer.balance" step="0.01" /></dd>
			</dl>
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
</div>

<div class="box" style="margin-top:1ex" v-if="data.customer.id">
	<nav class="navbar navbar-default">
		<h2>Historique client</h2>
		<form id="customer-history-filter" onsubmit="javascript:customers_filterHistory();return false;">
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="start">Du</label>
					<input type="text" class="form-control" id="start" v-model="data.start" />
				</div>
			</div>
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="stop">au</label>
					<input type="text" class="form-control" id="stop" v-model="data.stop" />
				</div>
			</div>
			<div class="row actions">
				<div class="form-group">
					<button class="btn btn-primary btn-send" type="submit">Envoyer</button>
				</div>
			</div>
		</form>
	</nav>
	<div class="box-body" id="customer-history" v-if="data.customerHistory">
	<table class="table table-bordered table-hover">
		<thead>
			<tr>
				<th>Date</th>
				<th>Produit</th>
				<th>Quantité</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="line in data.customerHistory">
				<td>{{line.date}}</td>
				<td>{{line.product}}</td>
				<td>{{line.quantity}}</td>
			</tr>
		</tbody>
	</table>
	</div>
</div>
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

