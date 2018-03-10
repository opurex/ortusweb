var view_customers = `
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
			</tbody>
		</table>
	</div>
</div>`;

var view_customer_list = `
		{{#customers}}
		<tr>
			<td>
				<img class="img img-thumbnail thumbnail pull-left" src="{{#imgUrl}}{{#hasImage}}{{id}}{{/hasImage}}{{^hasImage}}default{{/hasImage}}{{/imgUrl}}" />{{dispName}}
			</td>
			<td>
				<span>{{balance}}<div class="btn-group pull-right" role="group"><a class="btn btn-edit" href="?p=customer&id={{id}}">Edit</a></div>
			</td>
		</tr>
		{{/customers}}
`;

var view_customer_form = `
<div class="box">
	<div class="box-body">
		<h1>Édition d'un client</h1>
		<form id="edit-customer-form" onsubmit="javascript:customers_saveCustomer(); return false;">
			{{#customer}}<input type="hidden" name="id" value="{{id}}"/>{{/customer}}
			<fieldset class="form-group">
				<legend>Affichage</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-dispName">Nom affiché</label></dt>
					<dd><input class="form-control" id="edit-dispName" type="text" name="dispName" {{#customer}}value="{{dispName}}"{{/customer}} required="true" /></dd>

					<dt><label for="edit-card">Carte</label></dt>
					<dd><input class="form-control" id="edit-card" type="text" name="card" {{#customer}}value="{{card}}"{{/customer}} /></dd>

					<dt><label for="edit-visible">Actif</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" name="visible" {{#customer}}{{#visible}}checked="checked"{{/visible}}{{/customer}}{{^customer}}checked="checked"{{/customer}}></dd>

					<dt><label for="edit-note">Notes</label></dt>
					<dd><textarea class="form-control" id="edit-note" name="note">{{#customer}}{{note}}{{/customer}}</textarea></dd>

					<dt><label for="edit-expireDate">Date d'expiration</label></dt>
					<dd><input class="form-control" id="edit-expireDate" type="text" name="expireDate" {{#customer}}value="{{expireDate}}"{{/customer}} /></dd>
			</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Pré-paiement et crédits</legend>
				<dl class="dl-horizontal">
					<dt><label for="show-balance">Solde</label></dt>
					<dd><input type="number" id="show-balance" name="balance" class="form-control" {{#customer}}value="{{balance}}"{{/customer}} disabled="true"></dd>

					<dt><label for="edit-maxDebt">Dette max.</label></dt>
					<dd><input type="number" id="edit-maxDebt" name="maxDebt" class="form-control" {{#customer}}value="{{maxDebt}}"{{/customer}} step="0.01" /></dd>
				</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Tarifications spéciales</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-discountProfile">Profil de remise</label></dt>
					<dd>
						<select class="form-control" id="edit-discountProfile" name="discountProfile">
							<option value="">Pas de profil de remise</option>
							{{#discountProfiles}}
							<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
							{{/discountProfiles}}
						</select>
					</dd>

					<dt><label for="edit-tariffArea">Zone tarifaire</label></dt>
					<dd>
						<select class="form-control" id="edit-tariffArea" name="tariffArea">
							<option value="">Pas de zone tarifaire</option>
							{{#tariffAreas}}
							<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
							{{/tariffAreas}}
						</select>
					</dd>

					<dt><label for="edit-tax">TVA</label></dt>
					<dd>
						<select class="form-control" id="edit-tax" name="tax">
							<option value="">Pas de modification</option>
							{{#taxes}}
							<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
							{{/taxes}}
						</select>
					</dd>

				</dl>
			</fieldset>

			<fieldset class="form-group">
				<legend>Coordonnées</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-firstName">Prénom</label></dt>
					<dd><input class="form-control" id="edit-firstName" type="text" name="firstName" {{#customer}}value="{{firstName}}"{{/customer}} /></dd>

					<dt><label for="edit-lastName">Nom</label></dt>
					<dd><input class="form-control" id="edit-lastName" type="text" name="lastName" {{#customer}}value="{{lastName}}"{{/customer}} /></dd>

					<dt><label for="edit-email">Email</label></dt>
					<dd><input class="form-control" id="edit-email" type="text" name="email" {{#customer}}value="{{email}}"{{/customer}} /></dd>

					<dt><label for="edit-phone1">Téléphone</label></dt>
					<dd><input class="form-control" id="edit-phone1" type="text" name="phone1" {{#customer}}value="{{phone1}}"{{/customer}} /></dd>

					<dt><label for="edit-phone2">Téléphone 2</label></dt>
					<dd><input class="form-control" id="edit-phone2" type="text" name="phone2" {{#customer}}value="{{phone2}}"{{/customer}} /></dd>

					<dt><label for="edit-fax">Fax</label></dt>
					<dd><input class="form-control" id="edit-fax" type="text" name="fax" {{#customer}}value="{{fax}}"{{/customer}} /></dd>

					<dt><label for="edit-addr1">Adresse</label></dt>
					<dd><input class="form-control" id="edit-addr1" type="text" name="addr1" {{#customer}}value="{{addr1}}"{{/customer}} /></dd>

					<dt><label for="edit-addr2">Adresse 2</label></dt>
					<dd><input class="form-control" id="edit-addr2" type="text" name="addr2" {{#customer}}value="{{addr2}}"{{/customer}} /></dd>

					<dt><label for="edit-zipCode">Code postal</label></dt>
					<dd><input class="form-control" id="edit-zipCode" type="text" name="zipCode" {{#customer}}value="{{zipCode}}"{{/customer}} /></dd>

					<dt><label for="edit-city">Ville</label></dt>
					<dd><input class="form-control" id="edit-city" type="text" name="city" {{#customer}}value="{{city}}"{{/customer}} /></dd>

					<dt><label for="edit-region">Région</label></dt>
					<dd><input class="form-control" id="edit-region" type="text" name="region" {{#customer}}value="{{region}}"{{/customer}} /></dd>

					<dt><label for="edit-country">Pays</label></dt>
					<dd><input class="form-control" id="edit-country" type="text" name="country" {{#customer}}value="{{country}}"{{/customer}} /></dd>
				</dl>
			</fieldset>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
</div>
<div class="box" style="margin-top:1ex">
	{{#customer}}
	<div class="box-body">
		<h1>Modifier le solde</h1>
		<form id="edit-customer-balance-form" onsubmit="javascript:customers_saveBalance(); return false;">
			{{#customer}}<input id="customer-balance-id" type="hidden" name="id" value="{{id}}"/>{{/customer}}
			<dl class="dl-horizontal">
				<dt><label for="edit-balance">Solde</label></dt>
				<dd><input type="number" id="edit-balance" name="balance" class="form-control" value="{{balance}}" step="0.01" /></dd>
			</dl>
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
	{{/customer}}
</div>
`;
