Vue.component("vue-discountprofile-list", {
	props: ["data"],
	template: `<div class="discountprofile-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des profils de remise</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=discountprofile">Ajouter un profil de remise</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
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
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(profile)">Modifier</a></nav></td>
				</tr>
			</tbody>
		</table>
	</article>
</section>
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
	template: `<div class="discountprofile-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=discountprofiles">Liste des profils de remise</a></li>
				<li><h1>Édition d'un profil de remise</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-discountprofile-form" class="form-large" onsubmit="javascript:discountprofile_saveProfile(); return false;">
			<div class="form-group">
				<label for="edit-label">Désignation</label>
				<input id="edit-label" type="text" v-model="data.discountProfile.label" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-rate">Remise</label>
				<input id="edit-rate" type="number" v-model.lazy="discountRate" step="0.01" min="0" max="100" /> %
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	computed: {
		discountRate: {
			get: function() {
				return Number((this.data.discountProfile.rate * 100.0).toFixed(2));
			},
			set: function(value) {
				this.data.discountProfile.rate = Number((value / 100.0).toFixed(5));
			}
		}
	}
});
