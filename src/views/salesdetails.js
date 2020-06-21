Vue.component("vue-salesdetails", {
	props: ["data"],
	template: `<div class="salesdetails">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Détail des ventes</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:salesdetails_filter();return false;">
				<div class="form-group">
					<label for="start">Du</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">au</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<p class="notice"><strong>Note :</strong> Le prix d'achat et la catégorie correspondent aux informations actuellement renseignées sur la fiche produit et non à celles au moment de la vente.</p>
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>
`});
