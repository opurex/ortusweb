Vue.component("vue-category-list", {
	props: ["data"],
	data: function() {
		return {
			categoriesTable: new Table().reference("category-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("L'image du bouton de la catégorie. Ce champ ne peut être exporté."))
				.column(new TableCol().reference("reference").label("Référence").visible(false).searchable(true).help("La référence doit être unique pour chaque catégorie. Elle permet la modification lors de l'import des catégories."))
				.column(new TableCol().reference("label").label("Désignation").visible(true).searchable(true).help("Le nom de la catégorie tel qu'affiché sur les boutons de la caisse."))
				.column(new TableCol().reference("parent").label("Parent").visible(false).help("La catégorie dans laquelle se trouve cette catégorie. Vide si elle n'est pas une sous-catégorie."))
				.column(new TableCol().reference("dispOrder").label("Ordre").type(TABLECOL_TYPE.NUMBER).visible(false).help("L'ordre d'affichage de la catégorie. Les ordres ne doivent pas forcément se suivre, ce qui permet de faciliter l'intercallage de nouvelles catégories. Par exemple 10, 20, 30…"))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
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
					this.imageSrc(cat),
					cat.reference, cat.label, cat.parentLabel,
					cat.dispOrder,
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cat) + "\">Modifier</a></div>",
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
			this.categoriesTable.resetContent(lines);
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
						thiss.imageSrc(cat),
						pad + cat.reference, pad + cat.label, cat.parentLabel,
						cat.dispOrder,
						"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(cat) + "\">Modifier</a></div>",
					];
					sortedLines.push(line);
					if (cat.id in thiss.categoryTree) {
						recursivePush(thiss.categoryTree[cat.id], depth + 1);
					}
				}
			}
			recursivePush(this.categoryTree[0], 0);
			this.categoriesTable.resetContent();
			sortedLines.forEach(l => {
				this.categoriesTable.line(l);
			});
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
			<vue-input-image label="Image" modelName="category" v-bind:modelId="data.modelDef.modelId(data.category)" v-model="data.image" v-bind:hadImage="data.category.hasImage" id="edit-image" />
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
			linkedRecords: {
				category: this.data.categories,
			},
			importResult: null,
			tableColumns: [
				{field: "reference", label: "Référence"},
				{field: "label", label: "Désignation"},
				{field: "parent", label: "Parent", type: "record", modelName: "category"},
				{field: "dispOrder", label: "Ordre", type: "number"},
			]
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
		<vue-import-preview newTitle="Nouvelles catégories" editTitle="Catégories modifiées" unchangedTitle="Catégories non modifiées" modelsLabel="catégories"
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
				_categories_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			categories_saveCategories();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
	}
});
