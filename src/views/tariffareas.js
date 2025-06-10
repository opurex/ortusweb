Vue.component("vue-tariffarea-list", {
	props: ["data"],
	data: function() {
		return {
			areasTable: new Table().reference("tariffarea-list")
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("The reference must be unique for each zone. It allows modification during import."))
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The name of the zone as displayed on the cash register buttons."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("The display order of the category. Orders donât have to be sequential, which allows easier insertion of new categories. For example 10, 20, 30â¦"))
				.column(new TableCol().reference("tariff").label("Tariffs").type(TABLECOL_TYPE.NUMBER).visible(false).help("The number of tariffs defined in this zone."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="tariffarea-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>List of Tariff Zones</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=tariffarea">Add a Zone</a></li>
			</ul>
			<ul>
				<li>
					<label for="sort">Sort by</label>
					<select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
						<option value="dispOrder">Order</option>
						<option value="label">Name</option>
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
					this.areasTable.sort(tools_sort(2, 0));
					break;
				case "label":
					this.areasTable.sort(tools_sort(1));
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
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(area) + "\">Edit</a></div>",
			];
			this.areasTable.line(line);
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
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=tariffareas">List of Tariff Zones</a></li>
				<li><h1>Edit a Tariff Zone</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(false)">Export Zone</button>
				</li>
				<li>
					<button class="btn btn-add" v-on:click="exportCsv(true)">Export Zone (Excel)</button>
				</li>
				<li>
					<label for="csv-file">Replace with a file</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:tariffareas_saveArea(); return false;">
			<div class="form-group">
				<label for="edit-label">Name</label>
				<input id="edit-label" type="text" v-model="data.tariffarea.label" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-reference">Reference</label>
				<input id="edit-reference" type="text" v-model="data.tariffarea.reference" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-dispOrder">Order</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.tariffarea.dispOrder">
			</div>

			<h2>Prices</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table>
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Name</th>
						<th>Original Selling Price</th>
						<th>Selling Price (excl. VAT)</th>
						<th>Selling Price (incl. VAT)</th>
						<th>VAT</th>
						<th>Operation</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="price in data.tariffarea.prices">
						<td><img class="thumbnail thumbnail-text"  v-bind:src="imageSrc(price.product)" />{{label(price.product)}}</td>
						<td>{{priceSell(price.product)}}</td>
						<td><input type="number" v-model.number="price.price" disabled="true" /></td>
						<td><input type="number" v-model.number="price.priceSellVat" step="0.01" v-on:change="updatePrice(price)" /></td>
						<td><select v-model="price.tax" v-on:change="updatePrice(price)">
							<option v-bind:value="null">Unchanged</option>
							<option v-for="tax in data.taxes" :key="tax.id" v-bind:value="tax.id">{{tax.label}}</option>
						</select></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deletePrice(price.product)">X</button></td>
					</tr>
				</tbody>
			</table>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
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
			return Number(product.priceSell * (1.0 + tax.rate)).toFixed(2);
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
			csvData.push(["Reference", "Selling Price (incl. VAT)", "VAT"]);
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

