Vue.component("vue-tariffarea-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=tariffarea">Ajouter une zone</a>
		</div>
		<div class="navbar-form navbar-left">
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
			<thead>
				<tr>
					<th>Désignation</th>
					<th>Ordre d'affichage</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="tariffarea in data.tariffareas">
					<td>{{tariffarea.label}}</td>
					<td>{{tariffarea.dispOrder}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(tariffarea)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>
`,
	methods: {
		editUrl: function(cat) {
			return "?p=tariffarea&id=" + cat.id;
		},
		sort: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					this.data.tariffareas = this.data.tariffareas.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					this.data.tariffareas = this.data.tariffareas.sort(tools_sort("label"));
			break;
			}
		},
	},
	mounted: function() {
		this.sort();
	}
});

Vue.component("vue-tariffarea-form", {
	props: ["data"],
	data: function() {
		return {"null": null, "productCache": []};
	},
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'une zone tarifaire</h1>
		<form id="edit-category-form" onsubmit="javascript:tariffareas_saveArea(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" v-model="data.tariffarea.label" required="true" /></dd>

				<dt><label for="edit-reference">Référence</label></dt>
				<dd><input class="form-control" id="edit-reference" type="text" v-model="data.tariffarea.reference" required="true" /></dd>

				<dt><label for="edit-dispOrder">Ordre</label></dt>
				<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.tariffarea.dispOrder"></dd>

			</dl>

			<h2>Prix</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table class="table table-bordered table-hover">
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Désignation</th>
						<th>Prix de vente original</th>
						<th>Prix de vente TTC</th>
						<th>TVA</th>
						<th>Opération</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="price in data.tariffarea.prices">
						<td><img class="img img-thumbnail thumbnail pull-left"  v-bind:src="imageSrc(price.product)" />{{label(price.product)}}</td>
						<td>{{priceSell(price.product)}}</td>
						<td><input class="form-control" type="number" v-model.number="price.price" step="0.01" /></td>
						<td><select class="form-control" v-model="price.tax">
							<option v-bind:value="null">Inchangée</option>
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deletePrice(price.product)">X</button></a></td>
					</tr>
				</tbody>
			</table>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return srvcall_imageUrl("product");
			}
			return srvcall_imageUrl("product", this.data.productCache[prdId]);
		},
		priceSell: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			let taxId = product.tax;
			let tax = null;
			for (let i = 0; i < this.data.taxes.length; i++) {
				if (this.data.taxes[i].id == taxId) {
					tax = this.data.taxes[i];
					break;
				}
			}
			return priceSell = Number(product.priceSell * (1.0 + tax.rate)).toFixed(2);
		},
		label: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			return product.label;
		},
		pickProduct: function(product) {
			tariffareas_addProduct(product);
		},
		deletePrice: function(productId) {
			tariffareas_delProduct(productId);
		},
	},
});

