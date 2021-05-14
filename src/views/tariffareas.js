Vue.component("vue-tariffarea-list", {
	props: ["data"],
	data: function() {
		return {
			areasTable: {
				reference: "tariffarea-list",
				columns: [
					{reference: "reference", label: "Référence", visible: false, help: "La référence doit être unique pour chaque zone. Elle permet la modification lors de l'import."},
					{reference: "label", label: "Désignation", visible: true, help: "Le nom de la zone tel qu'affiché sur les boutons de la caisse."},
					{reference: "dispOrder", label: "Ordre", visible: false, help: "L'ordre d'affichage de la catégorie. Les ordres ne doivent pas forcément se suivre, ce qui permet de faciliter l'intercallage de nouvelles catégories. Par exemple 10, 20, 30…"},
					{reference: "tariff", label: "Tarifs", visible: false, help: "Le nombre de tarifs définis dans cette zone."},
					{reference: "operation", label: "Opération", export: false, visible: true},
				],
				lines: []
			},
		};
	},
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
		<vue-table v-bind:table="areasTable" v-bind:noexport="true"></vue-table>
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
					Vue.set(this.areasTable, "lines", this.areasTable.lines.sort(tools_sort(2, 0)));
					break;
				case "label":
					Vue.set(this.areasTable, "lines", this.areasTable.lines.sort(tools_sort(1)));
					break;
			}
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.tariffareas.length; i++) {
			let area = this.data.tariffareas[i];
			let line = [
				area.reference, area.label, area.dispOrder,
				area.prices.length,
				{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(area) + "\">Modifier</a></div>"},
			];
			this.areasTable.lines.push(line);
		}
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
		<nav class="navbar">
			<ul>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(false)">Exporter la zone</button>
				</li>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(true)">Exporter la zone (Excel)</button>
				</li>
				<li>
					<label for="csv-file">Remplacer par un fichier</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
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
		reference: function(prdId) {
			if (!(prdId in this.data.productCache)) {
				return "???";
			}
			let product = this.data.productCache[prdId];
			return product.reference;
		},
		pickProduct: function(product) {
			tariffareas_addProduct(product);
		},
		deletePrice: function(productId) {
			tariffareas_delProduct(productId);
		},
		updatePrice: function(price) {
			tariffareas_updatePrice(price);
		},
		tax: function(taxId) {
			for (let i = 0; i < this.data.taxes.length; i++) {
				let tax = this.data.taxes[i];
				if (tax.id == taxId) {
					return tax;
				}
			}
		},
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.newCategories = data.newCategories;
				thiss.editedCategories = data.editedCategories;
				thiss.editedValues = data.editedValues;
				thiss.unchangedCategories  = data.unchangedCategories;
				thiss.unknownColumns = data.unknownColumns;
				thiss.errors = data.errors;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _tariffareas_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		exportCsv: function(withExcelBom) {
			let csvData = [];
			csvData.push(["Référence", "Prix de vente TTC", "TVA"]);
			for (let i = 0; i < this.data.tariffarea.prices.length; i++) {
				let price = this.data.tariffarea.prices[i];
				let priceSellVat = price.priceSellVat.toLocaleString();
				let tax = "";
				if (price.tax != null) {
					tax = this.tax(price.tax).reference;
				}
				csvData.push([this.reference(price.product), priceSellVat, tax]);
			}
			// Generate csv (with some utf-8 tweak)
			let encodedData = new CSV(csvData).encode();
			encodedData = encodeURIComponent(encodedData).replace(/%([0-9A-F]{2})/g,
				function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1);
				});
			if (withExcelBom) {
				encodedData = String.fromCharCode(0xef, 0xbb, 0xbf) + encodedData;
			}
			// Set href for download
			let href = "data:text/csv;base64," + btoa(encodedData);
			window.open(href, "csvexport");
		}
	},
});

