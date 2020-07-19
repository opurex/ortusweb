Vue.component("vue-producttags-form", {
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
				<li><h1>Édition d'une planche d'étiquettes</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:producttags_generatePdf(); return false;">
			<div class="form-group">
				<label for="edit-format">Format de papier</label>
				<select v-model="data.format">
					<option v-for="format, index in data.formats" :key="format.dispName" v-bind:value="index">{{format.dispName}}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="edit-label">Démarer à l'étiquette</label>
				<input id="edit-label" type="number" v-model="data.startFrom" required="true" min="1" step="1" />
			</div>
			<div class="form-group">
				<label for="edit-reference">Marge verticale</label>
				<input id="edit-reference" type="number" v-model="data.marginV" />
			</div>
			<div class="form-group">
				<label for="edit-dispOrder">Marge horizontale</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.marginH">
			</div>

			<h2>Produits</h2>
			<vue-catalog-picker v-bind:categories="data.categories" v-bind:prdPickCallback="pickProduct" />

			<table>
				<col />
				<col style="width:10%; min-width: 5em;" />
				<col style="width:10%; min-width: 5em;" />
				<thead>
					<tr>
						<th>Désignation</th>
						<th>Quantité</th>
						<th>Opération</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="tag in data.tags">
						<td><img class="thumbnail thumbnail-text"  v-bind:src="imageSrc(tag.product)" />{{tag.product.label}}</td>
						<td><input type="number" v-model.number="tag.quantity" min="1" step="1" /></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deleteTag(tag.product.id)">X</button></a></td>
					</tr>
				</tbody>
			</table>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Générer la planche</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(prd) {
			return srvcall_imageUrl("product", prd);
		},
		pickProduct: function(product) {
			producttags_addTag(product);
		},
		deleteTag: function(productId) {
			producttags_delTag(productId);
		}
	},
});

