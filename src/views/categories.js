Vue.component("vue-category-list", {
	props: ["data"],
	data: function() {
		return {
			categoriesTable: {
				columns: [
					{label: "Image", export: false, visible: true, help: "L'image du bouton de la catégorie. Ce champ ne peut être exporté."},
					{label: "Référence", visible: false, help: "La référence doit être unique pour chaque catégorie. Elle permet la modification lors de l'import des catégories."},
					{label: "Désignation", visible: true, help: "Le nom de la catégorie tel qu'affiché sur les boutons de la caisse."},
					{label: "Parent", visible: false, help: "La catégorie dans laquelle se trouve cette catégorie. Vide si elle n'est pas une sous-catégorie."},
					{label: "Ordre", visible: false, help: "L'ordre d'affichage de la catégorie. Les ordres ne doivent pas forcément se suivre, ce qui permet de faciliter l'intercallage de nouvelles catégories. Par exemple 10, 20, 30…"},
					{label: "Opération", export: false, visible: true},
				],
				lines: []
			},
		};
	},
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
	<div class="box-body">
		<vue-table v-bind:table="categoriesTable"></vue-table>
	</div>
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
					Vue.set(this.categoriesTable, "lines", this.categoriesTable.lines.sort(tools_sort(4, 1)));
					break;
				case "label":
					Vue.set(this.categoriesTable, "lines", this.categoriesTable.lines.sort(tools_sort(2)));
			break;
			}
		},
	},
	mounted: function() {
		let catById = {};
		for (let i = 0; i < this.data.categories.length; i++) {
			let cat = this.data.categories[i];
			catById[cat.id] = cat;
		}
		for (let i = 0; i < this.data.categories.length; i++) {
			let cat = this.data.categories[i];
			let parentLabel = "";
			if (cat.parent != null) {
				parentLabel = catById[cat.parent].label;
			}
			let line = [
				{type: "thumbnail", src: this.imageSrc(cat)},
				cat.reference, cat.label, parentLabel,
				cat.dispOrder,
				{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cat) + "\">Edit</a></div>"},
			];
			this.categoriesTable.lines.push(line);
		}
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

