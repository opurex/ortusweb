Vue.component("vue-tariffarea-list", {
	props: ["data"],
	template: `<div class="tariffarea-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des zones tarifaires</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=tariffarea">Ajouter une zone</a></li>
			</ul>
			<ul>
				<li>
					<label for="sort">Trier par</label>
					<select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
						<option value="dispOrder">Ordre</option>
						<option value="label">Désignation</option>
					</select>
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
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
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(tariffarea)">Modifier</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
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
	template: `<div class="tariffarea-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=tariffareas">Liste des zones tarifaires</a></li>
				<li><h1>Édition d'une zone tarifaire</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:tariffareas_saveArea(); return false;">
			<div class="form-group">
				<label for="edit-label">Désignation</label>
				<input id="edit-label" type="text" v-model="data.tariffarea.label" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-reference">Référence</label>
				<input id="edit-reference" type="text" v-model="data.tariffarea.reference" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-dispOrder">Ordre</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.tariffarea.dispOrder">
			</div>

			<h2>Prix</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table>
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Désignation</th>
						<th>Prix de vente original</th>
						<th>Prix de vente HT</th>
						<th>Prix de vente TTC</th>
						<th>TVA</th>
						<th>Opération</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="price in data.tariffarea.prices">
						<td><img class="thumbnail thumbnail-text"  v-bind:src="imageSrc(price.product)" />{{label(price.product)}}</td>
						<td>{{priceSell(price.product)}}</td>
						<td><input type="number" v-model.number="price.price" disabled="true" /></td>
						<td><input type="number" v-model.number="price.priceSellVat" step="0.01" v-on:change="updatePrice(price)" /></td>
						<td><select v-model="price.tax" v-on:change="updatePrice(price)">
							<option v-bind:value="null">Inchangée</option>
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deletePrice(price.product)">X</button></a></td>
					</tr>
				</tbody>
			</table>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
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
		updatePrice: function(price) {
			tariffareas_updatePrice(price);
		}
	},
});

