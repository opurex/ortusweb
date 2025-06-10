Vue.component("vue-salesdetails", {
	props: ["data"],
	template: `<div class="salesdetails">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Sales Details</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:salesdetails_filter();return false;">
				<div class="form-group">
					<label for="start">From</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">To</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<p class="notice"><strong>Note:</strong> The purchase price and category correspond to the current information on the product record, not those at the time of sale.</p>
		<vue-table v-bind:table="data.table"></vue-table>
	</article>
</section>
</div>`
});
