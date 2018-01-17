var view_products = `
<div class="box">
<div class="row spacing-row">
	<div class="btn-group" role="group">
		<a class="btn btn-add" href="?p=product">Ajouter un produit</a>
	</div>
</div>
<div>
	<label for="filter-category" class="control-label">Catégorie</label>
	<select class="form-control" id="filter-category" name="category" onchange="javascript:products_categoryChanged();">
		{{#categories}}
		<option value="{{id}}">{{label}}</option>
		{{/categories}}
	</select>
</div>

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
`;

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
<div class="row spacing-row">
	<h1>Édition d'un produit</h1>
</div>
<div id="message-box"></div>
<div class="row spacing-row">
	<form id="edit-product-form" class="form-horizontal" onsubmit="javascript:products_saveProduct(); return false;">
		{{#product}}<input type="hidden" name="id" value="{{id}}"/>{{/product}}
		<fieldset class="form-group">
			<legend>Affichage</legend>
			<div class="form-group row">
				<label for="edit-label" class="col-sm-2 control-label">Désignation</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-label" type="text" name="label" {{#product}}value="{{label}}"{{/product}} required="true" />
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-category" class="col-sm-2 control-label">Catégorie</label>
				<div class="col-sm-10">
					<select class="form-control" id="edit-category" name="category">
						{{#categories}}
						<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
						{{/categories}}
					</select>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-dispOrder" class="col-sm-2 control-label">Ordre</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-dispOrder" type="number" name="dispOrder" {{#product}}value="{{dispOrder}}"{{/product}}{{^product}}value="0"{{/product}}>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-visible" class="col-sm-2 control-label">En vente</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-visible" type="checkbox" name="visible" {{#product}}{{#visible}}checked="checked"{{/visible}}{{/product}}{{^product}}checked="checked"{{/product}}>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-prepay" class="col-sm-2 control-label">Recharge prépayé</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-prepay" type="checkbox" name="prepay" {{#product}}{{#prepay}}checked="checked"{{/prepay}}{{/product}}>
				</div>
			</div>
		</fieldset>
		<fieldset class="form-group">
			<legend>Prix</legend>
			<div class="form-group row">
				<label for="edit-priceSell" class="col-sm-2 control-label">Prix de vente HT</label>
				<div class="col-sm-10">
					<input type="number" id="edit-priceSell" name="priceSell" class="form-control" {{#product}}value="{{priceSell}}"{{/product}} step="0.01" disabled="true">
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-tax" class="col-sm-2 control-label">TVA</label>
				<div class="col-sm-10">
					<select class="form-control" id="edit-tax" name="tax" onchange="javascript:product_updatePrice();">
						{{#taxes}}
						<option value="{{id}}" data-rate="{{rate}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
						{{/taxes}}
					</select>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-taxedPrice" class="col-sm-2 control-label">Prix de vente TTC</label>
				<div class="col-sm-10">
					<input type="number" id="edit-taxedPrice" name="taxedPrice" class="form-control" {{#product}}value="{{taxedPrice}}"{{/product}} step="0.01" onchange="javascript:product_updatePrice();">
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-priceBuy" class="col-sm-2 control-label">Prix d'achat</label>
				<div class="col-sm-10">
					<input type="number" id="edit-priceBuy" name="priceBuy" class="form-control" {{#product}}value="{{priceBuy}}"{{/product}} step="0.01" onchange="javascript:product_updatePrice();">
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-margin" class="col-sm-2 control-label">Marge</label>
				<div class="col-sm-10">
					<input type="text" id="edit-margin" name="margin" class="form-control" value="{{#product}}{{margin}}{{/product}}" disabled="true">
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-scaled" class="col-sm-2 control-label">Vente au poids</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-scaled" type="checkbox" name="scaled" {{#product}}{{#scaled}}checked="checked"{{/scaled}}{{/product}}>
				</div>
			</div>
		</fieldset>
		<fieldset class="form-group">
			<legend>Référencement</legend>
			<div class="form-group row">
				<label for="edit-reference" class="col-sm-2 control-label">Référence</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-reference" type="text" name="reference" {{#product}}value="{{reference}}"{{/product}} />
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-barcode" class="col-sm-2 control-label">Code barre</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-barcode" type="text" name="barcode" {{#product}}value="{{barcode}}"{{/product}} />
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-scaleType" class="col-sm-2 control-label">Volume</label>
				<div class="col-sm-10">
					<select class="form-control" id="edit-scaleType" name="scaleType">
<option value="0">Pas de volumétrie</option>
<option value="1">Poids</option>
<option value="2">Litre</option>
					</select>
				</div>
			</div>			<div class="form-group row">
				<label for="edit-scaleValue" class="col-sm-2 control-label">Contenance</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-scaleValue" type="numeric" step="any" name="scaleValue" {{#product}}value="{{scaleValue}}"{{/product}}>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-discountEnabled" class="col-sm-2 control-label">Remise auto</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-discountEnable" type="checkbox" name="discountEnabled" {{#product}}{{#discountEnabled}}checked="checked"{{/discountEnabled}}{{/product}}>
				</div>
			</div>
			<div class="form-group row">
				<label for="edit-discountRate" class="col-sm-2 control-label">Taux de remise</label>
				<div class="col-sm-10">
					<input class="form-control" id="edit-discountRate" type="numeric" name="discountRate" {{#product}}value="{{discountRate}}"{{/product}}>
				</div>
			</div>
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
