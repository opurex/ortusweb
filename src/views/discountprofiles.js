Vue.component("vue-discountprofile-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=discountprofile">Ajouter un profil de remise</a>
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
					<th>Remise</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="profile in data.discountProfiles">
					<td>{{profile.label}}</td>
					<td>{{percent(profile.rate)}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(profile)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		percent: function(rate) {
			return (rate * 100).toLocaleString() + " %";
		},
		editUrl: function(profile) {
			return "?p=discountprofile&id=" + profile.id;
		},
	},
});

Vue.component("vue-discountprofile-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un profil de remise</h1>
		<form id="edit-discountprofile-form" onsubmit="javascript:discountprofile_saveProfile(); return false;">
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" v-model="data.discountProfile.label" required="true" /></dd>

				<dt><label for="edit-rate">Taux de remise</label></dt>
				<dd><input class="form-control" id="edit-rate" type="number" v-model.number="data.discountProfile.rate" step="0.01" min="0.0" max="1.0" /></dd>

			</dl>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>
</div>`,
});
