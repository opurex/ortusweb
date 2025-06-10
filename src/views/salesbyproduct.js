Vue.component("vue-salesbyproduct", {
	props: ["data"],
	template: `<div class="salesbyproduct">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Sales by Product</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
		<form id="tickets-filter" onsubmit="javascript:salesbyproduct_filter();return false;">
			<div class="form-group">
				<label for="start">From</label>
				<vue-inputdate id="start" v-model="data.start" />
			</div>
			<div class="form-group">
				<label for="stop">To</label>
				<vue-inputdate id="stop" v-model="data.stop" />
			</div>
			<div class="form-group">
				<input id="include-archives" type="checkbox" v-model="data.includeArchives" />
				<label for="include-archives">Include products out of catalog</label>
			</div>
			<div class="form-group">
				<input id="include-zero" type="checkbox" v-model="data.includeZero" />
				<label for="include-zero">Include products without sales</label>
			</div>
			<div class="form-group">
				<input id="separate-by-cr" type="checkbox" v-model="data.separateCashRegisters" />
				<label for="separate-by-cr">Detail by cash register</label>
			</div>
			<div class="form-group">
				<input id="separate-by-tax" type="checkbox" v-model="data.separateTaxes" />
				<label for="separate-by-tax">Detail by VAT rate</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Search</button>
			</div>
		</form>
	</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table" ref="salesTable"></vue-table>
	</article>
</section>
</div>`
});
