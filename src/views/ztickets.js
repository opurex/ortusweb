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
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>
`});

