Vue.component("vue-cashregister-list", {
	props: ["data"],
	data: function() {
		return {
			crTable: new Table().reference("cashregisters-list")
				.column(new TableCol().reference("reference").label("Référence"))
				.column(new TableCol().reference("label").label("Désignation"))
				.column(new TableCol().exportable(false).label("Opération").type(TABLECOL_TYPE.HTML))
		}
	},
	template: `<div class="cashregister-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des caisses</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=cashregister">Ajouter une caisse</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="crTable" />
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(cr) {
			return "?p=cashregister&id=" + cr.id;
		},
	},
	mounted: function() {
		for (let i = 0; i < this.data.cashRegisters.length; i++) {
			let cr = this.data.cashRegisters[i];
			this.crTable.line([cr.reference, cr.label, "<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(cr) + "\">Modifier</a></div>"]);
		}
	}
});

Vue.component("vue-cashregister-form", {
	props: ["data"],
	template: `<div class="cashregister-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=cashregisters">Liste des caisses</a></li>
				<li><h1>Édition d'une caisse</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:cashregister_saveCashRegister(); return false;">
			<vue-input-text label="Référence" v-model="data.cashRegister.reference" v-bind:required="true" id="edit-reference" />
			<vue-input-text label="Désignation" v-model="data.cashRegister.label" v-bind:required="true" id="edit-label" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
	}
});
