Vue.component("vue-product-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=product">Ajouter un produit</a>
		</div>
		<div class="navbar-form navbar-left">
			<label for="filter-category" class="control-label">Catégorie</label>
			<select class="form-control" id="filter-category" name="category" onchange="javascript:products_categoryChanged();">
				<option v-for="cat in data.categories" v-bind:value="cat.id">{{cat.label}}</option>
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
				<tr v-for="product in data.products">
					<td>
						<img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(product)" />{{product.label}}<div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(product)">Edit</a><a class="btn btn-delete" onclick="return confirm('Êtes-vous certain de vouloir faire ça ?');return false;" href="./?p=modules/base_products/actions/categories&delete-cat=000">Delete</a></div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(prd) {
			if (prd.hasImage) {
				return login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
			}
		},
		editUrl: function(prd) {
			return "?p=product&id=" + prd.id;
		}
	}
});

Vue.component("vue-product-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un produit</h1>
		<form id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset class="form-group">
				<legend>Affichage</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-label">Désignation</label></dt>
					<dd><input class="form-control" id="edit-label" type="text" v-model="data.product.label" required="true" /></dd>

					<dt><label for="edit-image">Image</label></dt>
					<dd>
						<img v-if="data.product.hasImage" id="product-image" class="img img-thumbnail" v-bind:src="imageSrc(data.product)" />
						<input id="edit-image" type="file" accept="image/*" />
						<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();return false;" >{{data.deleteImageButton}}</a>
					</dd>

					<dt><label for="edit-category">Catégorie</label></dt>
					<dd>
						<select class="form-control" id="edit-category" v-model="data.product.category">
							<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
						</select>
					</dd>

					<dt><label for="edit-dispOrder">Ordre</label></dt>
					<dd><input class="form-control" id="edit-dispOrder" type="number" v-model="data.product.dispOrder" /></dd>

					<dt><label for="edit-visible">En vente</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" v-model="data.product.visible"></dd>

					<dt><label for="edit-prepay">Recharge prépayé</label></dt>
					<dd><input class="form-control" id="edit-prepay" type="checkbox" v-model="data.product.prepay" /></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Prix</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-priceSell">Prix de vente HT</label></dt>
					<dd><input type="number" id="edit-priceSell" name="priceSell" class="form-control" v-model="data.product.priceSell" step="0.01" disabled="true"></dd>

					<dt><label for="edit-tax">TVA</label></dt>
					<dd>
						<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice">
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select>
					</dd>

					<dt><label for="edit-taxedPrice">Prix de vente TTC</label></dt>
					<dd><input type="number" id="edit-taxedPrice" class="form-control" v-model="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" /></dd>

					<dt><label for="edit-priceBuy">Prix d'achat</label></dt>
					<dd><input type="number" id="edit-priceBuy" name="priceBuy" class="form-control" v-model="data.product.priceBuy" v-on:change="updatePrice" step="0.01" /></dd>

					<dt><label for="edit-margin">Marge</label></dt>
					<dd><input type="text" id="edit-margin" name="margin" class="form-control" v-model="data.product.margin" disabled="true" /></dd>

					<dt><label for="edit-scaled">Vente au poids</label></dt>
					<dd><input class="form-control" id="edit-scaled" type="checkbox" name="scaled" v-model="data.product.scaled"></dd>
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Référencement</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-reference">Référence</label></dt>
					<dd><input class="form-control" id="edit-reference" type="text" v-model="data.product.reference" /></dd>

					<dt><label for="edit-barcode">Code barre</label></dt>
					<dd><input class="form-control" id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" /></dd>

					<dt><label for="edit-scaleType">Volume</label></dt>
					<dd>
<select class="form-control" id="edit-scaleType" v-model="data.product.scaleType">
<option value="0">Pas de volumétrie</option>
<option value="1">Poids</option>
<option value="2">Litre</option>
</select>
					</dd>

					<dt><label for="edit-scaleValue">Contenance</label></dt>
					<dd><input class="form-control" id="edit-scaleValue" type="number" step="any" v-model="data.product.scaleValue" /></dd>

					<dt><label for="edit-discountEnabled">Remise auto</label></dt>
					<dd><input class="form-control" id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" /></dd>

					<dt><label for="edit-discountRate">Taux de remise</label></dt>
					<dd><input class="form-control" id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" /></dd>
				</dl>
			</fieldset>

		<div class="form-group">
			<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
		</div>
	</form>
</div>
</div>
</div>
`,
	methods: {
		updatePrice: function() {
			product_updatePrice();
		},
		imageSrc: function(prd) {
			if (prd.hasImage) {
				return login_getHostUrl() + "/api/image/product/" + prd.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/product/default?Token=" + login_getToken();
			}
		}
	}
});

