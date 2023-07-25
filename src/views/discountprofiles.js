Vue.component("vue-discountprofile-list", {
	props: ["data"],
	data: function() {
		return {
			dpTable: new Table().reference("discountProfile-list")
				.column(new TableCol().reference("label").label("Désignation").visible(true).searchable(true).help("Le nom du profil de remise tel qu'affiché sur les boutons de la caisse."))
				.column(new TableCol().reference("rate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(true).help("La remise appliquée."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
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
		<vue-table v-bind:table="dpTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(profile) {
			return "?p=discountprofile&id=" + profile.id;
		},
	},
	mounted: function() {
		let thiss = this;
		this.data.discountProfiles.forEach(function(dp) {
			let line = [
				dp.label, dp.rate,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(dp) + "\">Modifier</a></div>"
			];
			thiss.dpTable.line(line);
		})
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
			<vue-input-text label="Désignation" v-model="data.discountProfile.label" v-bind:required="true" id="edit-label" />
			<vue-input-rate label="Remise" v-model.number="data.discountProfile.rate" id="edit-rate" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`
});
