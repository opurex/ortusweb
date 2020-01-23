Vue.component("vue-product-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" v-bind:href="newUrl">Ajouter un produit</a>
			<a class="btn btn-add" v-bind:href="newCompoUrl">Ajouter une composition</a>
		</div>
		<div class="navbar-form navbar-left">
			<label for="filter-category" class="control-label">Catégorie</label>
			<select class="form-control" id="filter-category" name="category" v-model="data.selectedCatId">
				<option v-for="cat in data.categories" v-bind:value="cat.id">{{cat.label}}</option>
			</select>
			<select class="form-control" id="filter-invisible" v-model="data.filterVisible">
				<option value="visible">En vente</option>
				<option value="invisible">Hors vente</option>
				<option value="all">Tout</option>
			</select>
			<label for="sort" class="control-label">Trier par</label>
			<select class="form-control" id="sort" name="sort" v-model="data.sort" v-on:change="sort">
				<option value="dispOrder">Ordre</option>
				<option value="label">Désignation</option>
			</select>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<col />
			<col style="width:10%; min-width: 5em;" />
			<col style="width:10%; min-width: 5em;" />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Désignation</th>
					<th>Prix de vente TTC</th>
					<th>Ordre d'affichage</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody id="product-list">
				<tr v-for="product in data.products" v-bind:class="{'invisible-data': !product.visible}" v-if="data.filterVisible == 'all' || (product.visible && data.filterVisible == 'visible') || (!product.visible && data.filterVisible == 'invisible')">
					<td>
						<img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(product)" /><span v-if="!product.visible">(archive) </span><span><img v-if="product.composition" src="res/img/composition_icon.png" alt="Composition" />{{product.label}}</span>
					</td>
					<td>{{product.taxedPrice.toLocaleString()}}</td>
					<td>{{product.dispOrder}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(product)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		editUrl: function(prd) {
			return "?p=product&id=" + prd.id;
		},
		sort: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					this.data.products = this.data.products.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					this.data.products = this.data.products.sort(tools_sort("label"));
					break;
			}
		},
	},
	computed: {
		newUrl: function() {
			return "?p=product&category=" + this.selectedCatIdTrick;
		},
		newCompoUrl: function() {
			return "?p=productCompo&category=" + this.selectedCatIdTrick;
		},
		selectedCatIdTrick: function() {
			return this.data.selectedCatId;
		}
	},
	watch: {
		selectedCatIdTrick: function(newCatId, oldCatID) {
			let thiss = this;
			storage_getProductsFromCategory(newCatId, function(products) {
				thiss.data.products = products;
			});
		},
	},
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
					<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" /></dd>

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
					<dd><input class="form-control" id="edit-reference" type="text" v-model="data.product.reference" required="true" /></dd>

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
			return srvcall_imageUrl("product", prd);
		}
	}
});

Vue.component("vue-product-composition-form", {
	props: ["data"],
	data: function() { return {"selectedGroupIndex": 0, "productCache": []} },
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
					<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" /></dd>

					<dt><label for="edit-visible">En vente</label></dt>
					<dd><input class="form-control" id="edit-visible" type="checkbox" v-model="data.product.visible"></dd>
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
				</dl>
			</fieldset>
			<fieldset class="form-group">
				<legend>Référencement</legend>
				<dl class="dl-horizontal">
					<dt><label for="edit-reference">Référence</label></dt>
					<dd><input class="form-control" id="edit-reference" type="text" v-model="data.product.reference" required="true" /></dd>

					<dt><label for="edit-barcode">Code barre</label></dt>
					<dd><input class="form-control" id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" /></dd>

					<dt><label for="edit-discountEnabled">Remise auto</label></dt>
					<dd><input class="form-control" id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" /></dd>

					<dt><label for="edit-discountRate">Taux de remise</label></dt>
					<dd><input class="form-control" id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" /></dd>
				</dl>
			</fieldset>

			<fieldset>
				<legend>Choix</legend>
				<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="addProduct" v-bind:excludeCompositions="true"/>
				<button type="button" v-on:click="addGroup">Ajouter un choix</button>
				<template v-for="(subgroup, i) in data.product.compositionGroups">
				<div class="composition-subgroup-editor" v-if="isSelected(i)">
					<dl class="dl-horizontal">
						<dt><label v-bind:for="'edit-group-label-' + i">Nom du choix</label></dt>
						<dd><input class="form-control" v:bind-id="'edit-group-label-' + i" type="text" v-model="subgroup.label" /></dd>

						<dt><label v:bind:for="'edit-group-dispOrder-' + i">Ordre</label></dt>
						<dd><input class="form-control" v-bind:id="'edit-dispOrder-' + i" type="number" v-model.number="subgroup.dispOrder" /></dd>
					</dl>
					<ul class="catalog-picker">
						<li v-for="prd in subgroup.compositionProducts">
							<button type="button" v-on:click="delPrdPickCallback(prd.product)">
								<img v-bind:src="imageSrcId(prd.product)" />
								<label>{{prdLabel(prd.product)}}</label>
							</button>
						</li>
					</ul>
				</div>
				</template>
				<table class="table table-bordered table-hover">
					<col />
					<col style="width:10%; min-width: 5em;" />
					<col style="width:10%; min-width: 15em;" />
					<thead>
						<tr>
							<th>Désignation</th>
							<th>Ordre d'affichage</th>
							<th>Opération</th>
						</tr>
					</thead>
					<tbody id="group-list">
						<tr v-for="(group, i) in data.product.compositionGroups">
							<td>{{group.label}}</td>
							<td>{{group.dispOrder}}</td>
							<td><div class="btn-group pull-right" role="group"><button type="button" class="btn btn-edit" v-bind:disabled="isSelected(i)" v-on:click="selectGroup(i)">Sélectionner</button> <button type="button" class="btn btn-delete" v-bind:disabled="isSingleGroup()" v-on:click="deleteGroup(i)">Supprimer</button></div></td>
						</tr>
					</tbody>
				</table>
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
			if (prd != null) {
				return srvcall_imageUrl("product", prd);
			}
		},
		imageSrcId: function(prdId) {
			return this.imageSrc(this.productCache[prdId]);
		},
		selectGroup: function(index) {
			this.selectedGroupIndex = index;
			product_composition_switchGroup(index);
		},
		addGroup: function() {
			product_composition_addGroup("");
			this.selectGroup(this.data.product.compositionGroups.length - 1);
		},
		addProduct: function(product) {
			this.productCache[product.id] = product;
			product_composition_addProduct(product);
		},
		delPrdPickCallback: function(prdId) {
			product_composition_delProduct(prdId);
		},
		deleteGroup: function (index) {
			if (this.selectedGroupIndex >= index) {
				this.selectGroup(index--);
			}
			product_composition_deleteGroup(index);
		},
		isSelected: function(index) {
			return this.selectedGroupIndex == index;
		},
		prdLabel: function(id) {
			if (!(id in this.productCache)) {
				return "???";
			}
			return this.productCache[id].label;
		},
		isSingleGroup: function() {
			return this.data.product.compositionGroups.length == 1;
		}
	},
	computed: {
		groupProducts: function() {
			return this.data.product.compositionGroups[selectedGroupIndex].compositionProducts;
		}
	},
	created: function() {
		for (let id in this.data.precache) {
			let prd = this.data.precache[id];
			this.productCache[id] = prd;
		}
	},
});

