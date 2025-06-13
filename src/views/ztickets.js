Vue.component("vue-zticket-list", {
	props: ["data"],
	template: `<div class="zticket-list">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>List of Final Tickets</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="ztickets-filter" onsubmit="javascript:ztickets_filter();return false;">
				<div class="form-group">
					<label for="start">Opening between</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">and</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<input id="add-zeros" type="checkbox" v-model="data.addZeros" />
					<label for="add-zeros">Show zero amounts</label>
				</div>
				<div class="form-group">
					<input id="include-unused-payments" type="checkbox" v-model="data.includeUnusedPayments" />
					<label for="include-unused-payments">Include unused payment methods</label>
				</div>
				<div class="form-group">
					<input id="include-unused-taxes" type="checkbox" v-model="data.includeUnusedTaxes" />
					<label for="include-unused-taxes">Include unused taxes</label>
				</div>
				<div class="form-group">
					<input id="include-unused-categories" type="checkbox" v-model="data.includeUnusedCategories" />
					<label for="include-unused-categories">Include unused categories</label>
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
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
