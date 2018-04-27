Vue.component("vue-salesbyproduct", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<form id="tickets-filter" onsubmit="javascript:salesbyproduct_filter();return false;">
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="start">Du</label>
					<input type="text" class="form-control" v-model="data.start" />
				</div>
			</div>
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="stop">au</label>
					<input type="text" class="form-control" v-model="data.stop" />
				</div>
			</div>
			<div class="row actions">
				<div class="form-group">
					<button class="btn btn-primary btn-send" type="submit">Envoyer</button>
				</div>
			</div>
		</form>
	</nav>
	<div class="box-body" id="report-content" v-if="data.table">
		<vue-table v-bind:table="data.table"></vue-table>
	</div>
</div>
</div>
`});
