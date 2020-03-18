Vue.component("vue-category-list", {
	props: ["data"],
	template: `<div class="category-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des catégories</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=category">Ajouter une catégorie</a></li>
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
				<tr v-for="category in data.categories">
					<td><img class="thumbnail thumbnail-text" v-bind:src="imageSrc(category)" />{{category.label}}</td>
					<td>{{category.dispOrder}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(category)">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(cat) {
			return srvcall_imageUrl("category", cat);
		},
		editUrl: function(cat) {
			return "?p=category&id=" + cat.id;
		},
		sort: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					this.data.categories = this.data.categories.sort(tools_sort("dispOrder", "reference"));
					break;
				case "label":
					this.data.categories = this.data.categories.sort(tools_sort("label"));
			break;
			}
		},
	},
	mounted: function() {
		this.sort();
	}
});

Vue.component("vue-category-form", {
	props: ["data"],
	template: `<div class="category-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=categories">Liste des catégories</a></li>
				<li><h1>Édition d'une catégorie</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:category_saveCategory(); return false;">
			<div class="form-group">
				<label for="edit-label">Désignation</label>
				<input id="edit-label" type="text" v-model="data.category.label" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-image">Image</label>
				<img v-if="data.category.hasImage" id="category-image" v-bind:src="imageSrc(data.category)" />
				<input id="edit-image" type="file" accept="image/*" />
				<button type="button" v-if="data.hadImage" class="btn btn-del" onclick="javascript:category_toggleImage();" >{{data.deleteImageButton}}</button>
			</div>

			<div class="form-group">
				<label for="edit-reference">Référence</label>
				<input id="edit-reference" type="text" v-model="data.category.reference" required="true" />
			</div>

			<div class="form-group">
				<label for="edit-parent">Parent</label></dt>
				<select id="edit-parent" v-model="data.category.parent">
					<option disabled value="">Selectionner</option>
					<option value="">Aucun</option>
					<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
				</select>
			</div>

			<div class="form-group">
				<label for="edit-dispOrder">Ordre</label>
				<input id="edit-dispOrder" type="number" v-model.number="data.category.dispOrder">
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(cat) {
			if (cat.hasImage) {
				return login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
			}
		}
	}
});

