Vue.component("vue-product-list", {
	props: ["data"],
	data: function() {
		return {
			currentCategoryId: this.data.selectedCatId,
			sorting: this.data.sort,
			filterVisible: this.data.filterVisible,
			sortedProducts: [], // in data instead of computed because asynchronous
			productsTable: new Table().reference("product-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The product button image. This field cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").searchable(true).visible(false).help("The reference must be unique for each product. It allows modification during product import."))
				.column(new TableCol().reference("label").label("Name").searchable(true).visible(true).help("The product name as displayed on POS buttons and the receipt."))
				.column(new TableCol().reference("category").label("Category").visible(false).help("The category name to which the product belongs."))
				.column(new TableCol().reference("barcode").label("Barcode").searchable(true).visible(false).help("The optional product barcode. It can be any string for manual input."))
				.column(new TableCol().reference("prepay").label("Prepaid recharge").type(TABLECOL_TYPE.BOOL).visible(false).help("Buying this product increases the customer's balance by the same amount. Prepaid products are not included in revenue and can also be used to refund customer debt."))
				.column(new TableCol().reference("scale").label("Sold by weight").type(TABLECOL_TYPE.BOOL).visible(false).help("If active, the quantity can be non-unitary and will be requested when adding to an order."))
				.column(new TableCol().reference("scaleType").label("Weight/Volume").visible(false).help("Indicates the unit of measure for content."))
				.column(new TableCol().reference("scaleValue").label("Content").type(TABLECOL_TYPE.NUMBER).visible(false).help("Indicates the quantity inside the product. For example, a 200g jar would have a content of 0.2. This allows for price-per-liter or kilogram calculations."))
				.column(new TableCol().reference("priceBuy").label("Purchase price (excl. tax)").type(TABLECOL_TYPE.NUMBER).visible(false).help("The purchase price excluding taxes. Optional field used to calculate margin. It is not versioned."))
				.column(new TableCol().reference("priceSell").label("Selling price (excl. tax)").type(TABLECOL_TYPE.NUMBER5).visible(false).help("The unit selling price excluding taxes."))
				.column(new TableCol().reference("priceSellVat").label("Selling price (incl. tax)").type(TABLECOL_TYPE.NUMBER2).visible(true).help("The unit selling price including taxes."))
				.column(new TableCol().reference("margin").label("Margin").type(TABLECOL_TYPE.NUMBER5).visible(false).help("Indicative margin excluding taxes. If the purchase price is not provided, margin equals the selling price excl. tax."))
				.column(new TableCol().reference("tax").label("VAT").visible(false).help("The associated VAT rate."))
				.column(new TableCol().reference("discountEnabled").label("Automatic discount").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates if a discount should be automatically applied when adding the product to an order."))
				.column(new TableCol().reference("discountRate").label("Discount rate").type(TABLECOL_TYPE.PERCENT).visible(false).help("The discount rate to apply automatically when automatic discount is enabled."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("The display order of the product in its category. Orders donât have to be sequential, allowing easy insertion of new products (e.g., 10, 20, 30â¦)."))
				.column(new TableCol().reference("visible").label("For sale").type(TABLECOL_TYPE.BOOL).visible(false).help("Indicates whether the product is currently for sale. If not for sale, it wonât appear on POS."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="product-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Product List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" v-bind:href="newUrl">Add Product</a></li>
				<li><a class="btn btn-add" v-bind:href="newCompoUrl">Add Composition</a></li>
				<li><a class="btn btn-add" href="?p=productImport">Import File</a></li>
			</ul>
			<ul>
				<li>
					<label for="filter-category">Category</label>
					<select id="filter-category" name="category" v-model="currentCategoryId">
						<option v-for="cat in data.categories" v-bind:value="cat.id">{{cat.label}}</option>
						<option value="">Show All</option>
					</select>
				</li>
				<li>
					<label for="filter-invisible">Status</label>
					<select id="filter-invisible" v-model="filterVisible">
						<option value="visible">For Sale</option>
						<option value="invisible">Not for Sale</option>
						<option value="all">All</option>
					</select>
				</li>
				<li>
					<label for="sort">Sort by</label>
					<select id="sort" name="sort" v-model="sorting">
						<option value="dispOrder">Order</option>
						<option value="label">Name</option>
						<option value="reference">Reference</option>
						<option value="priceBuy">Purchase Price</option>
						<option value="priceSell">Selling Price (excl. tax)</option>
						<option value="priceSellVat">Selling Price (incl. tax)</option>
						<option value="margin">Margin</option>
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
					case 3:
						scaleType = "Hour";
						break;
				}
				let line = [
					this.imageSrc(prd),
					prd.reference, prd.label, cat, prd.barcode,
					prd.prepay, prd.scaled,
					scaleType, prd.scaleValue,
					(prd.priceBuy != null) ? prd.priceBuy : "-",
					(prd.priceSell != null) ? prd.priceSell : "-",
					prd.taxedPrice,
					(prd.priceBuy != null && prd.priceSell != null) ? (prd.priceSell - prd.priceBuy) : "?",
					tax, prd.discountEnabled,
					prd.discountRate,
					prd.dispOrder, prd.visible,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(prd) + "\">Edit</a></div>",
				];
				lines.push(line);
			}
			switch (this.sorting) {
				case "dispOrder":
					lines = lines.sort(tools_sort(16, 1));
					this.sortedProducts = products.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					lines = lines.sort(tools_sort(2));
					this.sortedProducts = products.sort(tools_sort("label"));
					break;
				case "reference":
					lines = lines.sort(tools_sort(1));
					this.sortedProducts = products.sort(tools_sort("reference"));
					break;
				case "priceSell":
					lines = lines.sort(tools_sort(10));
					this.sortedProducts = products.sort(tools_sort("priceSell"));
					break;
				case "priceSellVat":
					lines = lines.sort(tools_sort(11));
					this.sortedProducts = products.sort(tools_sort("priceSellVat"));
					break;
				case "priceBuy":
					lines = lines.sort(tools_sort(9));
					this.sortedProducts = products.sort(tools_sort("priceBuy"));
					break;
				case "margin":
					lines = lines.sort(tools_sort(12));
					this.sortedProducts = products.sort(tools_sort("margin"));
					break;

			}
			this.productsTable.resetContent(lines);
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
	updateTableTitle: function() {
		if (this.currentCategoryId != "") {
			let category = this.data.categories.find(c => c.id == this.currentCategoryId, this);
			if (typeof category != "undefined") {
				let status;
				switch (this.filterVisible) {
					case "visible": status = " for sale"; break;
					case "invisible": status = " not for sale"; break;
					default: status = ""; break;
				}
				let prefix;
				if (this.filterVisible != "all") {
					prefix = "Products in the category \"";
				} else {
					prefix = "All products in the category \"";
				}
				this.productsTable.title(prefix + category.label + "\"" + status);
			}
		} else {
			let title = "All products";
			switch (this.filterVisible) {
				case "visible": title += " for sale"; break;
				case "invisible": title += " not for sale"; break;
				default: break;
			}
			this.productsTable.title(title);
		}
	}

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
		this.updateTableTitle();
	},
	watch: {
		sorting: function (newSort, oldSort) {
			this.sortAndAssign(this.sortedProducts);
		},
		currentCategoryId: function(newCatId, oldCatID) {
			this.loadProducts();
			this.updateTableTitle();
		},
		filterVisible: function(newVisible, oldVisible) {
			this.sortAndAssign(this.sortedProducts);
			this.updateTableTitle();
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
				<li><a href="?p=home">Home</a></li>
				<li><a v-bind:href="backUrl">Product List</a></li>
				<li><h1>Edit a Product</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Duplicate Product</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Display</legend>
				<vue-input-text label="Name" v-model="data.product.label" v-bind:required="true" id="edit-label" />
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" class="img img-thumbnail" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();return false;" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Category</label>
					<select class="form-control" id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<vue-input-number label="Display Order" v-model.number="data.product.dispOrder" id="edit-dispOrder" />
				<vue-input-checkbox label="For Sale" v-model="data.product.visible" id="edit-visible" />
				<vue-input-checkbox label="Prepaid Recharge" v-model="data.product.prepay" id="edit-prepay" />
			</fieldset>
			<fieldset>
				<legend>Price</legend>
				<div class="form-group">
					<label for="edit-priceSell">Sale Price (excl. tax)</label>
					<input type="number" id="edit-priceSell" name="priceSell" class="form-control" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">VAT</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Select a VAT rate</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Sale Price (incl. tax)</label>
					<input type="number" id="edit-taxedPrice" v-model.number="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Purchase Price (excl. tax)</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model.number="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Margin</label>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
				<vue-input-rate label="Automatic Discount" v-model="data.product.discountRate" id="edit-discountRate" />
				<vue-input-checkbox label="Apply Automatic Discount" v-model="data.product.discountEnabled" id="edit-discountEnabled" />
			</fieldset>
			<fieldset>
				<legend>Reference</legend>
				<vue-input-text label="Reference" v-model="data.product.reference" v-bind:required="true" id="edit-reference" />
				<vue-input-text label="Barcode" v-model="data.product.barcode" id="edit-barcode" />
			</fieldset>
			<fieldset>
				<legend>Volume and Capacity</legend>
				<vue-input-checkbox label="Sold in Bulk" v-model="data.product.scaled" id="edit-scaled" />
				<div class="form-group">
					<vue-input-number label="Capacity" v-bind:step="0.001" v-model="data.product.scaleValue" v-if="data.product.scaled == false" id="edit-scaleValue" />
					<select id="edit-scaleType" v-model="data.product.scaleType">
						<option v-bind:value="0" v-bind:disabled="data.product.scaled == true">Piece</option>
						<option v-bind:value="1">Kilogram</option>
						<option v-bind:value="2">Litre</option>
						<option v-bind:value="3">Hour</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-refPrice">Reference Price (incl. tax)</label>
					<input id="edit-refPrice" v-model="refPrice" disabled="true" />
				</div>
			</fieldset>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</div>
</section>
</div>` ,
	computed: {
		duplicateUrl: function() {
			return "?p=productDuplicate&id=" + this.data.product.id;
		},
		refPrice: function() {
			let price = this.data.product.taxedPrice;
			if (!this.data.product.scaled) {
				price = price / this.data.product.scaleValue;
			}
			price = price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + "€ ";
			switch (this.data.product.scaleType) {
				case 0:
					price += "per piece";
					break;
				case 1:
					price += "per kilogram";
					break;
				case 2:
					price += "per litre";
					break;
				case 3:
					price += "per hour";
					break;
			}

			return price;
		}
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
				<li><a href="?p=home">Home</a></li>
				<li><a v-bind:href="backUrl">Product list</a></li>
				<li><h1>Edit a product</h1></li>
			</ul>
		</nav>
		<nav class="navbar" v-if="data.product.id">
			<ul>
				<li><a class="btn btn-add" v-bind:href="duplicateUrl">Duplicate product</a></li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<form class="form-large" id="edit-product-form" onsubmit="javascript:products_saveProduct(); return false;">
			<fieldset>
				<legend>Display</legend>
				<div class="form-group">
					<label for="edit-label">Name</label>
					<input id="edit-label" type="text" v-model="data.product.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.product.hasImage" id="product-image" v-bind:src="imageSrc(data.product)" />
					<input id="edit-image" type="file" accept="image/*" />
					<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:product_toggleImage();" >{{data.deleteImageButton}}</button>
				</div>
				<div class="form-group">
					<label for="edit-category">Category</label>
					<select id="edit-category" v-model="data.product.category">
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Order</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.product.dispOrder" />
				</div>
				<div class="form-group">
					<input class="form-control" id="edit-visible" type="checkbox" v-model="data.product.visible">
					<label for="edit-visible">For sale</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Price</legend>
				<div class="form-group">
					<label for="edit-priceSell">Sale price excl. tax</label>
					<input type="number" id="edit-priceSell" name="priceSell" v-model="data.product.priceSell" step="0.01" disabled="true">
				</div>
				<div class="form-group">
					<label for="edit-tax">VAT</label>
					<select class="form-control" id="edit-tax" v-model="data.product.tax" v-on:change="updatePrice" required>
						<option disabled value="">Select a VAT</option>
						<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
					</select>
				</div>
				<div class="form-group">
					<label for="edit-taxedPrice">Sale price incl. tax</label>
					<input type="number" id="edit-taxedPrice" v-model="data.product.taxedPrice" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-priceBuy">Purchase price</label>
					<input type="number" id="edit-priceBuy" name="priceBuy" v-model="data.product.priceBuy" v-on:change="updatePrice" step="0.01" />
				</div>
				<div class="form-group">
					<label for="edit-margin">Margin</label>
					<input type="text" id="edit-margin" name="margin" v-model="data.product.margin" disabled="true" />
				</div>
			</fieldset>
			<fieldset>
				<legend>Referencing</legend>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.product.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-barcode">Barcode</label>
					<input id="edit-barcode" type="text" name="barcode" v-model="data.product.barcode" />
				</div>
				<div class="form-group">
					<label for="edit-discountEnabled">Auto discount</label>
					<input id="edit-discountEnable" type="checkbox" v-model="data.product.discountEnabled" />
				</div>
				<div class="form-group">
					<label for="edit-discountRate">Discount rate</label>
					<input id="edit-discountRate" type="number" v-model="data.product.discountRate" step="0.01" />
				</div>
			</fieldset>

			<fieldset>
				<legend>Choice</legend>
				<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="addProduct" v-bind:excludeCompositions="true"/>
				<button type="button" v-on:click="addGroup">Add a choice</button>
				<template v-for="(subgroup, i) in data.product.compositionGroups">
				<div class="composition-subgroup-editor" v-if="isSelected(i)">
					<dl class="dl-horizontal">
						<dt><label v-bind:for="'edit-group-label-' + i">Choice name</label></dt>
						<dd><input class="form-control" v-bind:id="'edit-group-label-' + i" type="text" v-model="subgroup.label" /></dd>

						<dt><label v-bind:for="'edit-group-dispOrder-' + i">Order</label></dt>
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
							<th>Name</th>
							<th>Display order</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody id="group-list">
						<tr v-for="(group, i) in data.product.compositionGroups">
							<td>{{group.label}}</td>
							<td>{{group.dispOrder}}</td>
							<td>
								<div class="btn-group pull-right" role="group">
									<button type="button" class="btn btn-edit" v-bind:disabled="isSelected(i)" v-on:click="selectGroup(i)">Select</button> 
									<button type="button" class="btn btn-delete" v-bind:disabled="isSingleGroup()" v-on:click="deleteGroup(i)">Delete</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</fieldset>
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
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
			linkedRecords: {
				category: this.data.categories,
				tax: this.data.taxes,
			},
			importResult: null,
			tableColumns: [
				{field: "reference", label: "Reference"},
				{field: "label", label: "Name"},
				{field: "category", label: "Category", type: "record", modelName: "category"},
				{field: "barcode", label: "Barcode"},
				{field: "prepay", label: "Prepayment recharge", type: "boolean"},
				{field: "scaled", label: "Sold by weight", type: "boolean"},
				{field: "scaleType", label: "Weight/Volume", type: "scaleType"},
				{field: "scaleValue", label: "Capacity", type: "number"},
				{field: "priceBuy", label: "Purchase price excl. tax", type: "number5"},
				{field: "priceSell", label: "Sale price excl. tax", type: "number5"},
				{field: "taxedPrice", label: "Sale price incl. tax", type: "number2"},
				{field: "tax", label: "VAT", type: "record", modelName: "tax"},
				{field: "discountEnabled", label: "Automatic discount", type: "boolean"},
				{field: "discountRate", label: "Discount rate", type: "rate"},
				{field: "dispOrder", label: "Order", type: "number"},
				{field: "visible", label: "For sale", type: "boolean"},
			],

		};
	},
	template: `<div class="product-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=products">Product List</a></li>
				<li><h1>Modify Products via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview newTitle="New Products" editTitle="Modified Products" unchangedTitle="Unchanged Products" modelsLabel="products"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
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
				thiss.importResult = data;
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
			this.importResult = null;
		},
	}
});
