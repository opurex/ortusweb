Vue.component("vue-salesbyproduct", {
	props: ["data"],
	template: `<div class="salesbyproduct">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Ventes par produit</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
		<form id="tickets-filter" onsubmit="javascript:salesbyproduct_filter();return false;">
			<div class="form-group">
				<label for="start">Du</label>
				<vue-inputdate v-model="data.start" />
			</div>
			<div class="form-group">
				<label for="stop">au</label>
				<vue-inputdate v-model="data.stop" />
			</div>
			<div class="form-group">
				<input id="include-archives" type="checkbox" v-model="data.includeArchives" />
				<label for="include-archives">Inclure les produits hors catalogue</label>
			</div>
			<div class="form-group">
				<input id="include-zero" type="checkbox" v-model="data.includeZero" />
				<label for="include-zero">Inclure les produits sans vente</label>
			</div>
			<div class="form-group">
				<input id="separate-by-cr" type="checkbox" v-model="data.separateCashRegisters" />
				<label for="separate-by-cr">Détailler par caisse</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
			</div>
		</form>
	</nav>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>
`});
