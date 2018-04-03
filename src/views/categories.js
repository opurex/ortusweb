var view_categories = `
<div class="box">
	<nav class="navbar navbar-default">
		<div class="container-fluid" role="group">
			<a class="btn btn-add" href="?p=category">Ajouter une catégorie</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<thead>
				<tr>
					<th>
					Désignation
					</th>
				</tr>
			</thead>
			<tbody>
				{{#categories}}
				<tr>
					<td>
						<img class="img img-thumbnail thumbnail pull-left" src="{{#imgUrl}}{{#hasImage}}{{id}}{{/hasImage}}{{^hasImage}}default{{/hasImage}}{{/imgUrl}}">{{label}}<div class="btn-group pull-right" role="group"><a class="btn btn-edit" href="?p=category&id={{id}}">Edit</a><a class="btn btn-delete" onclick="return confirm('Êtes-vous certain de vouloir faire ça ?');return false;" href="./?p=modules/base_products/actions/categories&delete-cat=000">Delete</a></div>
					</td>
				</tr>
				{{/categories}}
			</tbody>
		</table>
	</div>
</div>`;

var view_category = `
<div class="box">
	<div class="box-body">
		<h1>Édition d'une categorie</h1>
		<form id="edit-category-form" onsubmit="javascript:category_saveCategory(); return false;">
			{{#category}}<input type="hidden" name="id" value="{{id}}"/>{{/category}}
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" name="label" {{#category}}value="{{label}}"{{/category}} required="true" /></dd>

				<dt><label for="edit-image">Image</dt>
				<dd>
					{{#category}}{{#hasImage}}<img id="category-image" class="img img-thumbnail thumbnail" src="{{#imgUrl}}{{id}}{{/imgUrl}}" />{{/hasImage}}{{/category}}
					<input id="edit-image" type="file" name="image" accept="image/*" />
					<input type="hidden" name="clear-image" value="0" id="clear-image" />
					{{#category}}{{#hasImage}}<a id="toggle-image" class="btn btn-del" onclick="javascript:category_toggleImage();return false;" >Supprimer</a>
					<input type="hidden" name="hasImage" value="1" />{{/hasImage}}{{/category}}
				</dd>

				<dt><label for="edit-reference">Référence</label></dt>
				<dd><input class="form-control" id="edit-reference" type="text" name="reference" {{#category}}value="{{reference}}"{{/category}} /></dd>

				<dt><label for="edit-parent">Parent</label></dt>
				<dd>
					<select class="form-control" id="edit-parent" name="parent">
						<option value="" {{#category}}{{#parent}}selected="true"{{/parent}}{{/category}}></option>
						{{#categories}}
						<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
						{{/categories}}
					</select>
				</dd>

				<dt><label for="edit-dispOrder">Ordre</label></dt>
				<dd><input class="form-control" id="edit-dispOrder" type="number" name="dispOrder" {{#category}}value="{{dispOrder}}"{{/category}}{{^category}}value="0"{{/category}}></dd>

			</dl>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>`;

