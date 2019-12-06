Vue.component("vue-catalog-picker", {
	props: ["categories", "prdPickCallback"],
	data: function() {
		return { products: [], selectedCatId: null };
	},
	template: `
<div class="catalog-picker">
	<ul class="catalog-picker-categories">
		<li v-for="cat in this.categories" class="catalog-category">
			<button type="button" v-on:click="switchCategory(cat.id)">
				<img v-bind:src="catImageSrc(cat)" />
				<label>{{cat.label}}</label>
			</button>
		</li>
	</ul>
	<ul class="catalog-picker-products">
		<li v-for="prd in products">
			<button type="button" v-on:click="prdPickCallback(prd)">
				<img v-bind:src="prdImageSrc(prd)" />
				<label>{{prd.label}}</label>
			</button>
		</li>
	</ul>
</div>
`,
	methods: {
		switchCategory: function(id) {
			this.selectedCatId = id;
		},
		catImageSrc: function(cat) {
			return srvcall_imageUrl("category", cat);
		},
		prdImageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		showProducts: function(products) {
			this.products = products;
		},
	},
	mounted: function() {
		this.selectedCatId = this.categories[0].id;
	},
	watch: {
		selectedCatId: function(newCatId, oldCatID) {
			let thiss = this;
			storage_getProductsFromCategory(newCatId, function(products) {
				thiss.products = products;
			});
		},
	},
})
