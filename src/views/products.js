var view_products = `
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=product">Ajouter un produit</a>
		</div>
		<div class="navbar-form navbar-left">
			<label for="filter-category" class="control-label">Catégorie</label>
			<select class="form-control" id="filter-category" name="category" onchange="javascript:products_categoryChanged();">
				{{#categories}}
				<option value="{{id}}">{{label}}</option>
				{{/categories}}
			</select>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<thead>
				<tr>
					<th>
					Désignation
					</th>
				</tr>
			</thead>
			<tbody id="product-list">
			</tbody>
		</table>
	</div>
</div>`;

var view_product_list = `
		{{#products}}
		<tr>
			<td>
				<img class="img img-thumbnail thumbnail pull-left" src="{{#imgUrl}}{{#hasImage}}{{id}}{{/hasImage}}{{^hasImage}}default{{/hasImage}}{{/imgUrl}}">{{label}}<div class="btn-group pull-right" role="group"><a class="btn btn-edit" href="?p=product&id={{id}}">Edit</a><a class="btn btn-delete" onclick="return confirm('Êtes-vous certain de vouloir faire ça ?');return false;" href="./?p=modules/base_products/actions/categories&delete-cat=000">Delete</a></div>
			</td>
		</tr>
		{{/products}}
`;

var view_product_form = `
<div class="box">
	<div class="box-body">
		<h1>Édition d'un produit</h1>
		<div id="message-box"></div>
		<form id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			{{#product}}<input type="hidden" name="id" value="{{id}}"/>{{/product}}
			<fieldset class="form-group">
				<legend>Affichage</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-label">Désignation</label></dt>
					<dd><input class="form-control" id="edit-label" type="text" name="label" {{#product}}value="{{label}}"{{/product}} required="true" /></dd>

					<dt><label for="edit-category">Catégorie</label></dt>
					<dd>
						<select class="form-control" id="edit-category" name="category">
							{{#categories}}
							<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
							{{/categories}}
						</select>
					</dd>

					<dt><label for="edit-dispOrder">Ordre</label></dt>
					<dd><input class="form-control" id="edit-dispOrder" type="number" name="dispOrder" {{#product}}value="{{dispOrder}}"{{/product}}{{^product}}value="0"{{/product}}></dd>

					<dt><label for="edit-visible">En vente</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" name="visible" {{#product}}{{#visible}}checked="checked"{{/visible}}{{/product}}{{^product}}checked="checked"{{/product}}></dd>

					<dt><label for="edit-prepay">Recharge prépayé</label></dt>
					<dd><input class="form-control" id="edit-prepay" type="checkbox" name="prepay" {{#product}}{{#prepay}}checked="checked"{{/prepay}}{{/product}}></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Prix</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-priceSell">Prix de vente HT</label>
					<dd><input type="number" id="edit-priceSell" name="priceSell" class="form-control" {{#product}}value="{{priceSell}}"{{/product}} step="0.01" disabled="true"></dd>

					<dt><label for="edit-tax">TVA</label></dt>
					<dd>
						<select class="form-control" id="edit-tax" name="tax" onchange="javascript:product_updatePrice();">
							{{#taxes}}
							<option value="{{id}}" data-rate="{{rate}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
							{{/taxes}}
						</select>

					<dt><label for="edit-taxedPrice">Prix de vente TTC</label></dt>
					<dd><input type="number" id="edit-taxedPrice" name="taxedPrice" class="form-control" {{#product}}value="{{taxedPrice}}"{{/product}} step="0.01" onchange="javascript:product_updatePrice();"></dd>

					<dt><label for="edit-priceBuy">Prix d'achat</label></dt>
					<dd><input type="number" id="edit-priceBuy" name="priceBuy" class="form-control" {{#product}}value="{{priceBuy}}"{{/product}} step="0.01" onchange="javascript:product_updatePrice();"></dd>

					<dt><label for="edit-margin">Marge</label></dt>
					<dd><input type="text" id="edit-margin" name="margin" class="form-control" value="{{#product}}{{margin}}{{/product}}" disabled="true"></dd>

					<dt><label for="edit-scaled">Vente au poids</label></dt>
					<dd><input class="form-control" id="edit-scaled" type="checkbox" name="scaled" {{#product}}{{#scaled}}checked="checked"{{/scaled}}{{/product}}></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Référencement</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-reference" class="col-sm-2 control-label">Référence</label></dt>
					<dd><input class="form-control" id="edit-reference" type="text" name="reference" {{#product}}value="{{reference}}"{{/product}} /></dt>

					<dt><label for="edit-barcode">Code barre</label></dt>
					<dd><input class="form-control" id="edit-barcode" type="text" name="barcode" {{#product}}value="{{barcode}}"{{/product}} /></dd>

					<dt><label for="edit-scaleType">Volume</label></dt>
					<dd>
<select class="form-control" id="edit-scaleType" name="scaleType">
<option value="0">Pas de volumétrie</option>
<option value="1">Poids</option>
<option value="2">Litre</option>
</select>
					</dd>

					<dt><label for="edit-scaleValue">Contenance</label></dt>
					<dd><input class="form-control" id="edit-scaleValue" type="numeric" step="any" name="scaleValue" {{#product}}value="{{scaleValue}}"{{/product}}></dt>

					<dt><label for="edit-discountEnabled">Remise auto</label></dt>
					<dd><input class="form-control" id="edit-discountEnable" type="checkbox" name="discountEnabled" {{#product}}{{#discountEnabled}}checked="checked"{{/discountEnabled}}{{/product}}></dt>

					<dt><label for="edit-discountRate">Taux de remise</label></dt>
					<dd><input class="form-control" id="edit-discountRate" type="numeric" name="discountRate" {{#product}}value="{{discountRate}}"{{/product}}></dd>
				</dl>
			</fieldset>
		<input type="hidden" name="composition" value="{{#product}}{{#composition}}1{{/composition}}{{^composition}}0{{/composition}}{{/product}}{{^product}}0{{/product}}" />
		{{#product}}<input type="hidden" name="hasImage" value="{{#hasImage}}1{{/hasImage}}{{^hasImage}}0{{/hasImage}}" />{{/product}}
		<!-- TODO: restore image -->
		<div class="form-group">
			<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
		</div>
	</form>
</div>
`;
