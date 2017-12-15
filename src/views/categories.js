var view_categories = `
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
`;

var view_category = `
<div class="row spacing-row">
	<h1>Édition d'une categorie</h1>
</div>
<div class="row spacing-row">
	<form class="form-horizontal" onsubmit="javascript:category_saveCategory();">
		<input type="hidden" name="id" value="{{id}}"/>
		<div class="form-group row">
			<label for="edit-label" class="col-sm-2 control-label">Désignation</label>
			<div class="col-sm-10">
				<input class="form-control" id="edit-label" type="text" name="label" {{#category}}value="{{label}}"{{/category}} required="true" />
			</div>
		</div>
		<div class="form-group row">
			<label for="edit-reference" class="col-sm-2 control-label">Référence</label>
			<div class="col-sm-10">
				<input class="form-control" id="edit-reference" type="text" name="reference" {{#category}}value="{{reference}}"{{/category}} />
			</div>
		</div>
		<div class="form-group row">
			<label for="edit-parentId" class="col-sm-2 control-label">Parent</label>
			<div class="col-sm-10">
				<select class="form-control" id="edit-parentId" name="parentId">
					<option value="" {{#category}}{{#parent}}selected="true"{{/parent}}{{/category}}></option>
					{{#categories}}
					<option value="{{id}}" {{#selected}}selected="true"{{/selected}}>{{label}}</option>
					{{/categories}}
				</select>
			</div>
		</div>
		<div class="form-group row">
			<label for="edit-dispOrder" class="col-sm-2 control-label">Ordre</label>
			<div class="col-sm-10">
				<input class="form-control" id="edit-dispOrder" type="numeric" name="dispOrder" {{#category}}value="{{dispOrder}}"{{/category}}>
			</div>
		</div>
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
		{{/hasImage}}{{/category}}
		<div class="form-group">
			<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
		</div>
	</form>
</div>
`;
