Vue.component("vue-resources-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<col />
			<col />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Nom</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="resource in data.resources">
					<td>{{resource.dispName}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(resource)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		editUrl: function(res) {
			return "?p=resource&label=" + res.label;
		},
	}
});

Vue.component("vue-resource-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>{{data.resource.dispName}}</h1>
		<form id="edit-resource-form" onsubmit="javascript:resources_saveResource(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-reference">Valeur</label></dt>
				<dd v-if="data.resource.type == data.resTypes.Resource_TYPE_TEXT"><textarea style="font-family:monospace" id="edit-textarea" v-bind:cols="data.resource.textWidth" rows="7" v-model="data.resource.content" /></dd>
				<dd v-else><img v-if="data.hasImage" id="resource-image" class="img img-thumbnail" v-bind:src="imageData(data.resource)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:resources_toggleImage();return false;" >{{data.deleteContentButton}}</a></dd>
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
		imageData: function(res) {
			if (res.content != null) {
				return "data:;base64," + res.content;
			} else {
				return "";
			}
		}
	}
});
