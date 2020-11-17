Vue.component("vue-product-list", {
	props: ["data"],
	data: function() {
		return {
			currentCategoryId: this.data.selectedCatId,
			sorting: this.data.sort,
			filterVisible: this.data.filterVisible,
			sortedProducts: [], // in data instead of computed because asychronous
			productsTable: {
				columns: [
					{label: "Image", export: false, visible: true, help: "L'image du bouton du produit. Ce champ ne peut être exporté."},
					{label: "Référence", visible: false, help: "La référence doit être unique pour chaque produit. Elle permet la modification lors de l'import de produits."},
					{label: "Désignation", visible: true, help: "Le nom du produit tel qu'affiché sur les boutons de la caisse et le ticket."},
					{label: "Catégorie", visible: false, help: "La désignation de la catégorie à laquelle est rattachée le produit."},
					{label: "Code barre", visible: false, help: "Le code barre faculcatif du produit. Le code barre peut être une série de caractères arbitraires pour une saisie manuelle."},
					{label: "Recharge pré-payement", visible: false, help: "L'achat de se produit augmente le solde client du même montant. Les produits pré-payés ne rentrent pas dans le chiffre d'affaire et permettent également dee rembourser des dettes client."},
					{label: "Vente au poids", visible: false, help: "Si actif, la quantité peut être non unitaire et sera demandée lors de l'ajout à une commande."},
					{label: "Poids/Volume", visible: false, help: "Indique l'unité pour la contenance."},
					{label: "Contenance", visible: false, help: "Indique la contenance dans le produit. Pour un bocal de 200g par exemple, la contenance sera 0,2. Ce champ permet de calculer le prix au litre ou au kilogramme."},
					{label: "Prix d'achat HT", visible: false, help: "Le prix d'achat hors taxes. Ce champ facultatif permet de calculer la marge. Il n'est pas historisé."},
					{label: "Prix de vente HT", visible: false, help: "Le prix de vente unitaire hors taxes du produit."},
					{label: "Prix de vente TTC", visible: true, help: "Le prix de vente unitaire TTC du produit."},
					{label: "Marge", visible: false, help: "La marge hors taxe indicative. Si le prix d'achat n'est pas renseigné, la marge correspond au prix de vente hors taxes."},
					{label: "TVA", visible: false, help: "Le taux de TVA associé."},
					{label: "Remise automatique", visible: false, help: "Indique si une remise doit être automatiquement assignée lors de l'ajout du produit à une commande."},
					{label: "Taux de remise", visible: false, help: "Le taux de remise à appliquer automatiquement lorsque l'option Remise automatique est activée."},
					{label: "Ordre", visible: false, help: "L'ordre d'affichage du produit dans sa catégorie. Les ordres ne doivent pas forcément se suivre, ce qui permet de faciliter l'intercallage de nouveaux produits. Par exemple 10, 20, 30…"},
					{label: "En vente", visible: false, help: "Indique si le produit est actuellement en vente ou non. Lorsque le produit n'est pas en vente, il n'apparaîtra pas sur les caisses."},
					{label: "Opération", export: false, visible: true},
				],
				lines: []
			},
		};
	},
	template: `<div class="product-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des produits</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" v-bind:href="newUrl">Ajouter un produit</a></li>
				<li><a class="btn btn-add" v-bind:href="newCompoUrl">Ajouter une composition</a></li>
				<li><a class="btn btn-add" href="?p=productImport">Importer un fichier</a></li>
			</ul>
			<ul>
				<li>
					<label for="filter-category">Catégorie</label>
					<select id="filter-category" name="category" v-model="currentCategoryId">
						<option v-for="cat in data.categories" v-bind:value="cat.id">{{cat.label}}</option>
						<option value="">Tout afficher</option>
					</select>
				</li>
				<li>
					<label for="filter-invisible">État</label>
					<select id="filter-invisible" v-model="filterVisible">
						<option value="visible">En vente</option>
						<option value="invisible">Hors vente</option>
						<option value="all">Tout</option>
					</select>
				</li>
				<li>
					<label for="sort">Trier par</label>
					<select id="sort" name="sort" v-model="sorting">
						<option value="dispOrder">Ordre</option>
						<option value="label">Désignation</option>
						<option value="reference">Référence</option>
						<option value="priceBuy">Prix d'achat</option>
						<option value="priceSell">Prix de vente hors-taxes</option>
						<option value="priceSellVat">Prix de vente TTC</option>
						<option value="margin">Marge</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-table v-bind:table="productsTable"></vue-table>
	</div>
</section>
</div>`,
	methods: {
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		editUrl: function(prd) {
			return "?p=product&id=" + prd.id;
		},
		sortAndAssign: function(products) {
			let lines = [];
			let cats = {};
			let taxes = {};
			for (let i = 0; i < this.data.categories.length; i++) {
				let cat = this.data.categories[i];
				cats[cat.id] = cat;
			}
			for (let i = 0; i < this.data.taxes.length; i++) {
				let tax = this.data.taxes[i];
				taxes[tax.id] = tax;
			}
			for (let i = 0; i < products.length; i++) {
				let prd = products[i];
				if ((this.filterVisible == "visible" && !prd.visible)
						|| (this.filterVisible == "invisible" && prd.visible)) {
					continue
				}
				let cat = "";
				if (prd.category in cats) {
					cat = cats[prd.category].label;
				}
				let tax = "";
				if (prd.tax in taxes) {
					tax = taxes[prd.tax].label;
				}
				let scaleType = "-";
				switch (prd.scaleType) {
					case 1:
						scaleType = "Kilogramme";
						break;
					case 2:
						scaleType = "Litre";
						break;
				}
				let line = [
					{type: "thumbnail", src: this.imageSrc(prd)},
					prd.reference, prd.label, cat, prd.barcode,
					{type: "bool", value: prd.prepay}, {type: "bool", value: prd.scaled},
					scaleType, prd.scaleValue,
					(prd.priceBuy != null) ? prd.priceBuy.toLocaleString() : "-",
					(prd.priceSell != null) ? prd.priceSell.toLocaleString() : "-",
					prd.taxedPrice.toLocaleString(),
					(prd.priceBuy != null && prd.priceSell != null) ? (prd.priceSell - prd.priceBuy).toLocaleString() : "?",
					tax, {type: "bool", value: prd.discountEnabled},
					(prd.discountRate * 100).toLocaleString() + "%",
					prd.dispOrder, {type: "bool", value: prd.visible},
					{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(prd) + "\">Modifier</a></div>"},
				];
				lines.push(line);
			}
			switch (this.sorting) {
				case "dispOrder":
					lines = lines.sort(tools_sort(16, 1));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					lines = lines.sort(tools_sort(2));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("label"));
					break;
				case "reference":
					lines = lines.sort(tools_sort(1));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("reference"));
					break;
				case "priceSell":
					lines = lines.sort(tools_sort(10));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("priceSell"));
					break;
				case "priceSellVat":
					lines = lines.sort(tools_sort(11));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("priceSellVat"));
					break;
				case "priceBuy":
					lines = lines.sort(tools_sort(9));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("priceBuy"));
					break;
				case "margin":
					lines = lines.sort(tools_sort(12));
					this.productsTable.lines = lines;
					this.sortedProducts = products.sort(tools_sort("margin"));
					break;

			}
		},
		loadProducts: function() {
			let thiss = this;
			if (this.currentCategoryId != "") {
				storage_open(function(event) {
					storage_getProductsFromCategory(thiss.currentCategoryId, function(products) {
						thiss.sortAndAssign(products);
						storage_close();
					});
				});
			} else {
				storage_open(function(event) {
					storage_readStore("products", function(products) {
						thiss.sortAndAssign(products);
						storage_close();
					});
				});
			}
		},
	},
	computed: {
		newUrl: function() {
			return "?p=product&category=" + this.currentCategoryId;
		},
		newCompoUrl: function() {
			return "?p=productCompo&category=" + this.currentCategoryId;
		},
	},
	mounted: function() {
		this.loadProducts();
	},
	watch: {
		sorting: function (newSort, oldSort) {
			this.sortAndAssign(this.sortedProducts);
		},
		currentCategoryId: function(newCatId, oldCatID) {
			this.loadProducts();
		},
		filterVisible: function(newVisible, oldVisible) {
			this.sortAndAssign(this.sortedProducts);
		}
	},
});

Vue.component("vue-product-form", {
	props: ["data"],
	data: function() {
		return {
			"backUrl": "?p=products",
		};
	},
	template: `<div class="product-form">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a v-bind:href="backUrl">Liste des produits</a></li>
				<li><h1>Édition d'un produit</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Dupliquer le produit</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Affichage</legend>
				<div class="form-group">
					<label for="edit-label">Désignation</label>
					<input id="edit-label" type="text" v-model="data.product.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" class="img img-thumbnail" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();return false;" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Catégorie</label></dt>
					<select class="form-control" id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Ordre</label>
					<input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" />
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" v-model="data.product.visible">
					<label for="edit-visible">En vente</label>
				</div>
				<div class="form-group">
					<input id="edit-prepay" type="checkbox" v-model="data.product.prepay" />
					<label for="edit-prepay">Recharge prépayé</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Prix</legend>
				<div class="form-group">
					<label for="edit-priceSell">Prix de vente HT</label>
					<input type="number" id="edit-priceSell" name="priceSell" class="form-control" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">TVA</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Sélectionnez une TVA</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Prix de vente TTC</label>
					<input type="number" id="edit-taxedPrice" v-model="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Prix d'achat</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Marge</label>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
				<div class="form-group">
					<input id="edit-scaled" type="checkbox" name="scaled" v-model="data.product.scaled"></dd>
					<label for="edit-scaled">Vente au poids</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Référencement</legend>
				<div class="form-group">
					<label for="edit-reference">Référence</label>
					<input id="edit-reference" type="text" v-model="data.product.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-barcode">Code barre</label>
					<input id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" />
				</div>
				<div class="form-group">
					<label for="edit-scaleType">Poids/Volume</label>
					<select id="edit-scaleType" v-model="data.product.scaleType">
						<option v-bind:value="0">Pas de volumétrie</option>
						<option v-bind:value="1">Kilogramme</option>
						<option v-bind:value="2">Litre</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-scaleValue">Contenance</label>
					<input id="edit-scaleValue" type="number" step="any" v-model="data.product.scaleValue" />
				</div>
				<div class="form-group">
					<input id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" />
					<label for="edit-discountEnabled">Remise auto</label>
				</div>
				<div class="form-group">
					<label for="edit-discountRate">Taux de remise</label>
					<input id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" />
				</div>
			</fieldset>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</div>
</section>
</div>
`,
	computed: {
		duplicateUrl: function() {
			return "?p=productDuplicate&id=" + this.data.product.id;
		},
	},
	methods: {
		updatePrice: function() {
			product_updatePrice();
		},
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		}
	},
	mounted: function() {
		this.backUrl = "?p=products&category=" + encodeURIComponent(this.data.product.category);
	}
});

Vue.component("vue-product-composition-form", {
	props: ["data"],
	data: function() {
		return {
			"selectedGroupIndex": 0,
			"productCache": [],
			"backUrl": "?p=products"
		}
	},
	template: `<div class="composition-form">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a v-bind:href="backUrl">Liste des produits</a></li>
				<li><h1>Édition d'un produit</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Dupliquer le produit</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Affichage</legend>
				<div class="form-group">
					<label for="edit-label">Désignation</label>
					<input id="edit-label" type="text" v-model="data.product.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Catégorie</label>
					<select id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Ordre</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" />
				</div>
				<div class="form-group">
					<input class="form-control" id="edit-visible" type="checkbox" v-model="data.product.visible">
					<label for="edit-visible">En vente</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Prix</legend>
				<div class="form-group">
					<label for="edit-priceSell">Prix de vente HT</label>
					<input type="number" id="edit-priceSell" name="priceSell" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">TVA</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Sélectionnez une TVA</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Prix de vente TTC</label></dt>
					<input type="number" id="edit-taxedPrice" v-model="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Prix d'achat</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Marge</label></dt>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
			</fieldset>
			<fieldset>
				<legend>Référencement</legend>
				<div class="form-group">
					<label for="edit-reference">Référence</label>
					<input id="edit-reference" type="text" v-model="data.product.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-barcode">Code barre</label></dt>
					<input id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" />
				</div>
				<div class="form-group">
					<label for="edit-discountEnabled">Remise auto</label>
					<input id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" />
				</div>
				<div class="form-group">
					<label for="edit-discountRate">Taux de remise</label>
					<input id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" />
				</div>
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
</section>
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
		},
		duplicateUrl: function() {
			return "?p=productDuplicate&id=" + this.data.product.id;
		},
	},
	created: function() {
		for (let id in this.data.precache) {
			let prd = this.data.precache[id];
			this.productCache[id] = prd;
		}
	},
	mounted: function() {
		this.backUrl = "?p=products&category=" + encodeURIComponent(this.data.product.category);
	}
});

Vue.component("vue-product-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			newProducts: [],
			editedProducts: [],
			editedValues: [],
			unchangedProducts: [],
			showUnchanged: false,
			unknownColumns: [],
			errors: [],
		};
	},
	template: `<div class="product-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=products">Liste des produits</a></li>
				<li><h1>Modification des produits par fichier csv</h1></li>
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
		<h2>Nouveaux produits</h2>
		<vue-product-import-table v-bind:products="newProducts" v-bind:categories="data.categories" v-bind:taxes="data.taxes"></vue-product-import-table>
		<h2>Produits modifiés</h2>
		<p v-if="editedProducts.length > 0">Les cases sur fond rouge indiquent les changements.</p>
		<vue-product-import-table v-bind:products="editedProducts" v-bind:editedValues="editedValues" v-bind:categories="data.categories" v-bind:taxes="data.taxes"></vue-product-import-table>
		<h2>Produits non modifiés</h2>
		<div><a class="btn btn-add" v-on:click="showUnchanged = !showUnchanged"><template v-if="showUnchanged">Masquer</template><template v-else>Montrer les {{unchangedProducts.length}} produits</template></a></div>
		<vue-product-import-table v-show="showUnchanged" v-bind:products="unchangedProducts" v-bind:categories="data.categories" v-bind:taxes="data.taxes"></vue-product-import-table>
		<h2 v-if="unknownColumns.length > 0 || errors.length > 0">Erreurs de lecture</h2>
		<table class="table table-bordered table-hover" v-if="unknownColumns.length > 0 || errors.length > 0">
			<thead>
				<tr>
					<th>Ligne</th>
					<th>Erreur</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="unknownColumns.length > 0">
					<td>1</td>
					<td>Les colonnes suivantes ont été ignorées : <template v-for="col in unknownColumns">{{col}} </template>.</td>
				<tr>
				<tr v-for="err in errors">
					<td>{{err.line}}</td>
					<td>{{err.error}}</td>
				</tr>
			</tbody>
		</table>
		<div>
			<a class="btn btn-edit" v-if="newProducts.length > 0 || editedProducts.length > 0" v-on:click="saveChanges">Enregister les modifications</a>
		</div>
	</div>
</section>
</div>`,
	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.newProducts = data.newProducts;
				thiss.editedProducts = data.editedProducts;
				thiss.editedValues = data.editedValues;
				thiss.unchangedProducts  = data.unchangedProducts;
				thiss.unknownColumns = data.unknownColumns;
				thiss.errors = data.errors;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _products_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			products_saveProducts();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.newProducts = [];
			this.editedProducts = [];
			this.editedValues = [];
			this.unchangedProducts = [];
			this.showUnchanged = false;
			this.unknownColumns = [];
			this.errors = [];
		},
	}
});

Vue.component("vue-product-import-table", {
	props: ["title", "products", "editedValues", "categories", "taxes"],
	template: `<div class="because">
<h2>{{title}}</h2>
<table class="table table-bordered table-hover">
	<thead>
		<tr>
			<th>Référence</th>
			<th>Désignation</th>
			<th>Catégorie</th>
			<th>Code barre</th>
			<th>Recharge pré-payment</th>
			<th>Vente au poids</th>
			<th>Poids/Volume</th>
			<th>Contenance</th>
			<th>Prix d'achat HT</th>
			<th>Prix de vente HT</th>
			<th>Prix de vente TTC</th>
			<th>TVA</th>
			<th>Remise automatique</th>
			<th>Taux de remise</th>
			<th>Ordre</th>
			<th>En vente</th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="(product, index) in products">
			<td v-bind:style="hasChanged(index, 'reference')">{{product.reference}}</td>
			<td v-bind:style="hasChanged(index, 'label')">{{product.label}}</td>
			<td v-bind:style="hasChanged(index, 'category')">{{category(product.category)}}</td>
			<td v-bind:style="hasChanged(index, 'barcode')">{{product.barcode}}</td>
			<td v-bind:style="hasChanged(index, 'prepaid')">{{boolVal(product.prepaid)}}</td>
			<td v-bind:style="hasChanged(index, 'scaled')">{{boolVal(product.scaled)}}</td>
			<td v-bind:style="hasChanged(index, 'scaleType')">{{scaleType(product.scaleType)}}</td>
			<td v-bind:style="hasChanged(index, 'scaleValue')">{{numVal(product.scaleValue)}}</td>
			<td v-bind:style="hasChanged(index, 'priceBuy')">{{numVal(product.priceBuy)}}</td>
			<td v-bind:style="hasChanged(index, 'priceSell')">{{numVal(product.priceSell)}}</td>
			<td v-bind:style="hasChanged(index, 'taxedPrice')">{{numVal(product.taxedPrice)}}</td>
			<td v-bind:style="hasChanged(index, 'tax')">{{tax(product.tax)}}</td>
			<td v-bind:style="hasChanged(index, 'discountEnabled')">{{boolVal(product.discountEnabled)}}</td>
			<td v-bind:style="hasChanged(index, 'discountRate')">{{percentVal(product.discountRate)}}</td>
			<td v-bind:style="hasChanged(index, 'dispOrder')">{{product.dispOrder}}</td>
			<td v-bind:style="hasChanged(index, 'visible')"><input type="checkbox" disabled="1" v-bind:checked="product.visible" /></td>
		</tr>
	</tbody>
</table>
</div>`,
	methods: {
		category: function(catId) {
			for (let i = 0; i < this.categories.length; i++) {
				if (this.categories[i].id == catId) {
					return this.categories[i].label;
				}
			}
			return "";
		},
		boolVal: function(val) {
			if (val)
				return "Oui";
			return "Non";
		},
		numVal: function(val) {
			if (val == null)
				return "";
			return val.toLocaleString();
		},
		percentVal: function(val) {
			return (val * 100).toLocaleString() + "%";
		},
		scaleType: function(type) {
			switch(type) {
				case 0: case "0": return "-"
				case 1: case "1": return "Poids"
				case 2: case "2": return "Litre"
			}
		},
		tax: function(taxId) {
			for (let i = 0; i < this.taxes.length; i++) {
				if (this.taxes[i].id == taxId) {
					return this.taxes[i].label;
				}
			}
			return "";
		},
		hasChanged: function(index, field) {
			if (this.editedValues && this.editedValues[index][field]) {
				return "font-weight:bold;background-color:#a36052;color:#fff";
			}
			return "";
		}
	},
});
