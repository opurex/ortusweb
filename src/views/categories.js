Vue.component("vue-category-list", {
	props: ["data"],
	data: function() {
		return {
			categoriesTable: new Table().reference("category-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The category button image. Cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").visible(false).searchable(true).help("Reference must be unique for each category. Used for modification during category import."))
				.column(new TableCol().reference("label").label("Designation").visible(true).searchable(true).help("Category name displayed on the register buttons."))
				.column(new TableCol().reference("parent").label("Parent").visible(false).help("Category containing this category. Empty if it is not a subcategory."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("Display order of the category. Orders do not have to be sequential to allow inserting new categories in between, e.g. 10, 20, 30â¦"))
				.column(new TableCol().reference("operation").label("Action").type(TABLECOL_TYPE.HTML).exportable(false).visible(true)),
			categoryTree: { null: [] },
		};
	},
	template: `<div class="category-list">
<section class="box box-medium">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><h1>Category List</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <ul>
        <li><a class="btn btn-add" href="?p=category">Add a Category</a></li>
        <li><a class="btn btn-add" href="?p=categoryImport">Import File</a></li>
      </ul>
      <ul>
        <li>
          <label for="sort">Sort by</label>
          <select id="sort" name="sort" v-model="data.sort" v-on:change="sort">
            <option value="dispOrder">Order</option>
            <option value="label">Designation</option>
          </select>
        </li>
        <li>
          <input id="tree" type="checkbox" v-model="data.tree" v-on:change="sort" />
          <label for="tree">Tree View</label>
        </li>
      </ul>
    </nav>
  </header>
  <div class="box-body">
    <vue-table  v-bind:table="categoriesTable"></vue-table>
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
					"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cat) + "\">Edit</a></div>",
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
						"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(cat) + "\">Edit</a></div>",
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
        <li><a href="?p=home">Home</a></li>
        <li><a href="?p=categories">Category List</a></li>
        <li><h1>Edit a Category</h1></li>
      </ul>
    </nav>
  </header>
  <article class="box-body">
    <form id="edit-category-form" class="form-large" onsubmit="javascript:category_saveCategory(); return false;">
      <vue-input-text label="Designation" v-model="data.category.label" v-bind:required="true" id="edit-label" />
      <vue-input-image label="Image" modelName="category" v-bind:modelId="data.modelDef.modelId(data.category)" v-model="data.image" :hadImage="data.category.hasImage" id="edit-image" />
      <vue-input-text label="Reference" v-model="data.category.reference" v-bind:required="true" id="edit-reference" />
      <div class="form-group">
        <label for="edit-parent">Parent</label>
        <select id="edit-parent" v-model="data.category.parent">
          <option :value="null">None</option>
          <option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
        </select>
      </div>
      <vue-input-number label="Order" v-model="data.category.dispOrder" id="edit-dispOrder" />
      <div class="form-control">
        <button class="btn btn-primary btn-send" type="submit">Save</button>
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
				{ field: "reference", label: "Reference" },
				{ field: "label", label: "Designation" },
				{ field: "parent", label: "Parent", type: "record", modelName: "category" },
				{ field: "dispOrder", label: "Order", type: "number" },
			]
		};
	},
	template: `<div class="category-import">
<section class="box box-large">
  <header>
    <nav class="browser">
      <ul>
        <li><a href="?p=home">Home</a></li>
        <li><a href="?p=categories">Category List</a></li>
        <li><h1>Edit Categories via CSV File</h1></li>
      </ul>
    </nav>
    <nav class="navbar">
      <ul>
        <li>
          <label for="csv-file">File</label>
          <input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" @change="readCsv" />
        </li>
      </ul>
    </nav>
  </header>
  <div class="box-body">
    <vue-import-preview
      newTitle="New Categories"
      editTitle="Modified Categories"
      unchangedTitle="Unchanged Categories"
      modelsLabel="categories"
   	v-bind:modelDef="data.modelDef"
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
