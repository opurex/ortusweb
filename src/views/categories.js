Vue.component("vue-category-list", {
	props: ["data"],
	data: function() {
		return {
			categoriesTable: {
				reference: "category-list",
				columns: [
					{reference: "image", label: "Image", export: false, visible: true, help: "L'image du bouton de la catégorie. Ce champ ne peut être exporté."},
					{reference: "reference", label: "Référence", visible: false, help: "La référence doit être unique pour chaque catégorie. Elle permet la modification lors de l'import des catégories."},
					{reference: "label", label: "Désignation", visible: true, help: "Le nom de la catégorie tel qu'affiché sur les boutons de la caisse."},
					{reference: "parent", label: "Parent", visible: false, help: "La catégorie dans laquelle se trouve cette catégorie. Vide si elle n'est pas une sous-catégorie."},
					{reference: "dispOrder", label: "Ordre", export_as_number: true, visible: false, help: "L'ordre d'affichage de la catégorie. Les ordres ne doivent pas forcément se suivre, ce qui permet de faciliter l'intercallage de nouvelles catégories. Par exemple 10, 20, 30…"},
					{reference: "operation", label: "Opération", export: false, visible: true},
				],
				lines: []
			},
			categoryTree: {null: []},
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
				<li><a class="btn btn-add" href="?p=categoryImport">Importer un fichier</a></li>
			</ul>
			<ul>
				<li>
					<label for="sort">Trier par</label>
					<select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
						<option value="dispOrder">Ordre</option>
						<option value="label">Désignation</option>
					</select>
				</li>
				<li>
					<input id ="tree" type="checkbox" v-model="data.tree" v-on:change="sort">
					<label for="tree">Arborescence</label>
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
		sortFlat: function(event) {
			let lines = [];
			for (let i = 0; i < this.data.categories.length; i++) {
				let cat = this.data.categories[i];
				let line = [
					{type: "thumbnail", src: this.imageSrc(cat)},
					cat.reference, cat.label, cat.parentLabel,
					cat.dispOrder,
					{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cat) + "\">Modifier</a></div>"},
				];
				lines.push(line);
			}
			switch (this.data.sort) {
				case "dispOrder":
					lines = lines.sort(tools_sort(4, 2));
					break;
				case "label":
					lines = lines.sort(tools_sort(2));
					break;
			}
			Vue.set(this.categoriesTable, "lines", lines);
		},
		sortTree: function(event) {
			switch (this.data.sort) {
				case "dispOrder":
					for (let key in this.categoryTree) {
						Vue.set(this.categoryTree, key, this.categoryTree[key].sort(tools_sort("dispOrder", "label")));
					}
					break;
				case "label":
					for (let key in this.categoryTree) {
						Vue.set(this.categoryTree, key, this.categoryTree[key].sort(tools_sort("label")));
					}
					break;
			}
			let sortedLines = [];
			let thiss = this;
			let recursivePush = function(categories, depth) {
				for (let i = 0; i < categories.length; i++) {
					let cat = categories[i];
					let pad = "   ".repeat(depth);
					let line = [
						{type: "thumbnail", src: thiss.imageSrc(cat)},
						pad + cat.reference, pad + cat.label, cat.parentLabel,
						cat.dispOrder,
						{type: "html", value: "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(cat) + "\">Modifier</a></div>"},
					];
					sortedLines.push(line);
					if (cat.id in thiss.categoryTree) {
						recursivePush(thiss.categoryTree[cat.id], depth + 1);
					}
				}
			}
			recursivePush(this.categoryTree[0], 0);
			Vue.set(this.categoriesTable, "lines", sortedLines);
		},
		sort: function() {
			if (this.data.tree) {
				this.sortTree();
			} else {
				this.sortFlat();
			}
		}
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
			let parentId = 0;
			if (cat.parent != null) {
				cat.parentLabel = catById[cat.parent].label;
				parentId = cat.parent;
			} else {
				cat.parentLabel = "";
			}
			if (!(parentId in this.categoryTree)) {
				this.categoryTree[parentId] = [];
			}
			this.categoryTree[parentId].push(cat);
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
			<vue-input-text label="Désignation" v-model="data.category.label" v-bind:required="true" id="edit-label" />
			<vue-input-image label="Image" modelName="category" v-bind:modelId="data.category.id.toString()" v-model="data.image" v-bind:hadImage="data.category.hasImage" id="edit-image" />
			<vue-input-text label="Référence" v-model="data.category.reference" v-bind:required="true" id="edit-label" />
			<div class="form-group">
				<label for="edit-parent">Parent</label></dt>
				<select id="edit-parent" v-model="data.category.parent">
					<option v-bind:value="null">Aucun</option>
					<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
				</select>
			</div>
			<vue-input-number label="Ordre" v-model="data.category.dispOrder" id="edit-dispOrder" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`
});

Vue.component("vue-category-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			newCategories: [],
			editedCategories: [],
			editedValues: [],
			unchangedCategories: [],
			showUnchanged: false,
			unknownColumns: [],
			errors: [],
		};
	},
	template: `<div class="category-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=categories">Liste des catégories</a></li>
				<li><h1>Modification des catégories par fichier csv</h1></li>
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
		<h2>Nouvelles catégories</h2>
		<vue-category-import-table v-bind:categories="newCategories" v-bind:allCategories="data.categories"></vue-category-import-table>
		<h2>Catégories modifiées</h2>
		<p v-if="editedCategories.length > 0">Les cases sur fond rouge indiquent les changements.</p>
		<vue-category-import-table v-bind:categories="editedCategories" v-bind:editedValues="editedValues" v-bind:allCategories="data.categories"></vue-category-import-table>
		<h2>Catégories non modifiées</h2>
		<div><a class="btn btn-add" v-on:click="showUnchanged = !showUnchanged"><template v-if="showUnchanged">Masquer</template><template v-else>Montrer les {{unchangedCategories.length}} catégories</template></a></div>
		<vue-category-import-table v-show="showUnchanged" v-bind:categories="unchangedCategories" v-bind:allCategories="data.categories"></vue-category-import-table>
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
			<a class="btn btn-edit" v-if="newCategories.length > 0 || editedCategories.length > 0" v-on:click="saveChanges">Enregister les modifications</a>
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
				thiss.newCategories = data.newCategories;
				thiss.editedCategories = data.editedCategories;
				thiss.editedValues = data.editedValues;
				thiss.unchangedCategories  = data.unchangedCategories;
				thiss.unknownColumns = data.unknownColumns;
				thiss.errors = data.errors;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				let data = _categories_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			categories_saveCategories();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.newCategories = [];
			this.editedCategories = [];
			this.editedValues = [];
			this.unchangedCategories = [];
			this.showUnchanged = false;
			this.unknownColumns = [];
			this.errors = [];
		},
	}
});

Vue.component("vue-category-import-table", {
	props: ["title", "categories", "editedValues", "allCategories", "taxes"],
	template: `<div class="because">
<h2>{{title}}</h2>
<table class="table table-bordered table-hover">
	<thead>
		<tr>
			<th>Référence</th>
			<th>Désignation</th>
			<th>Parent</th>
			<th>Ordre</th>
		</tr>
	</thead>
	<tbody>
		<tr v-for="(category, index) in categories">
			<td v-bind:style="hasChanged(index, 'reference')">{{category.reference}}</td>
			<td v-bind:style="hasChanged(index, 'label')">{{category.label}}</td>
			<td v-bind:style="hasChanged(index, 'parent')">{{parentCategory(category.parent)}}</td>
			<td v-bind:style="hasChanged(index, 'dispOrder')">{{category.dispOrder}}</td>
		</tr>
	</tbody>
</table>
</div>`,
	methods: {
		parentCategory: function(catId) {
			for (let i = 0; i < this.allCategories.length; i++) {
				if (this.allCategories[i].id == catId) {
					return this.allCategories[i].label;
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
