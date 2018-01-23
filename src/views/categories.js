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
		<div id="message-box"></div>
		<form id="edit-category-form" onsubmit="javascript:category_saveCategory(); return false;">
			{{#category}}<input type="hidden" name="id" value="{{id}}"/>{{/category}}
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" name="label" {{#category}}value="{{label}}"{{/category}} required="true" /></dd>

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
			{{#category}}<input type="hidden" name="hasImage" value="{{#hasImage}}1{{/hasImage}}{{^hasImage}}0{{/hasImage}}" />{{/category}}
			<!-- TODO: restore image
			<div class="row spacing-row">
				<div class="form-group row">
					<label for="image" class="col-sm-2 control-label">Image</label>
					<div class="col-sm-10">
						<input id="image" type="file" name="image">
					</div>
				</div>
			</div>
			<input id="clearImage" type="hidden" name="clearImage" value="0"/>
			{{#category}}{{#hasImage}}
			<div class="row spacing-row">
				<img id="img" class="image-preview" src="{{#imgUrl}}{{id}}{{/imgUrl}}"></div>
				<div class="btn-group" role="group"><a class="btn btn-delete" onclick="javascript:clearImage();">Supprimer</a><a class="btn btn-add" onclick="javascript:restoreImage();">Restaurer</a>
			</div>
			{{/hasImage}}{{/category}}-->
			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>`;

