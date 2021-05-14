Vue.component("vue-zticket-list", {
	props: ["data"],
	template: `<div class="zticket-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des tickets Z</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="ztickets-filter" onsubmit="javascript:ztickets_filter();return false;">
				<div class="form-group">
					<label for="start">Ouverture entre le</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">et le</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<input id="add-zeros" type="checkbox" v-model="data.addZeros" />
					<label for="add-zeros">Afficher les montants à 0</label>
				</div>
				<div class="form-group">
					<input id="include-unused-payments" type="checkbox" v-model="data.includeUnusedPayments" />
					<label for="include-unused-payments">Inclure les modes de paiements non utilisés</label>
				</div>
				<div class="form-group">
					<input id="include-unused-taxes" type="checkbox" v-model="data.includeUnusedTaxes" />
					<label for="include-unused-taxes">Inclure les taxes non utilisées</label>
				</div>
				<div class="form-group">
					<input id="include-unused-categories" type="checkbox" v-model="data.includeUnusedCategories" />
					<label for="include-unused-categories">Inclure les catégories non utilisées</label>
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table" ref="zTable"></vue-table>
	</article>
</section>
</div>
`});

