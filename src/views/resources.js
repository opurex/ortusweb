Vue.component("vue-resources-list", {
	props: ["data"],
	template: `<div class="resource-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Personnalisation</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
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
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(resource)">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(res) {
			return "?p=resource&label=" + res.label;
		},
	}
});

Vue.component("vue-resource-form", {
	props: ["data"],
	template: `<div class="resource-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=resources">Personnalisation</a></li>
				<li><h1>{{data.resource.dispName}}</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-resource-form" class="form-tiny" onsubmit="javascript:resources_saveResource(); return false;">
			<div class="form-group">
				<label for="edit-reference" style="display:none">Valeur</label>
				<textarea v-if="data.resource.type == data.resTypes.Resource_TYPE_TEXT" style="font-family:monospace" id="edit-textarea" style="width:auto !important" v-bind:cols="data.resource.textWidth" rows="7" v-model="data.resource.content" />
				<template v-else>
				<img v-if="data.hasImage" id="resource-image" class="img img-thumbnail" v-bind:src="imageData(data.resource)" />
				<input id="edit-image" type="file" accept="image/*" />
				<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:resources_toggleImage();return false;" >{{data.deleteContentButton}}</a>
				</template>
			</dl>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
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
