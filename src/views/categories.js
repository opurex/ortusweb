Vue.component("vue-category-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=category">Ajouter une catégorie</a>
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
				<tr v-for="category in data.categories">
					<td><img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(category)" />{{category.label}}</td>
					<td>{{category.dispOrder}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(category)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(cat) {
			if (cat.hasImage) {
				return login_getHostUrl() + "/api/image/category/" + cat.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/category/default?Token=" + login_getToken();
			}
		},
		editUrl: function(cat) {
			return "?p=category&id=" + cat.id;
		},
		sort: function(event) {
			categories_sortCategories(event.target.value);
		}
	}
});

Vue.component("vue-category-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'une categorie</h1>
		<form id="edit-category-form" onsubmit="javascript:category_saveCategory(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" v-model="data.category.label" required="true" /></dd>

				<dt><label for="edit-image">Image</label></dt>
				<dd>
					<img v-if="data.category.hasImage" id="category-image" class="img img-thumbnail" v-bind:src="imageSrc(data.category)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:category_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</dd>

				<dt><label for="edit-reference">Référence</label></dt>
				<dd><input class="form-control" id="edit-reference" type="text" v-model="data.category.reference" required="true" /></dd>

				<dt><label for="edit-parent">Parent</label></dt>
				<dd>
					<select class="form-control" id="edit-parent" v-model="data.category.parent">
						<option disabled value="">Selectionner</option>
						<option value="">Aucun</option>
						<option v-for="cat in data.categories" :key="cat.id" v-bind:value="cat.id">{{cat.label}}</option>
					</select>
				</dd>

				<dt><label for="edit-dispOrder">Ordre</label></dt>
				<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.category.dispOrder"></dd>

			</dl>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>
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

