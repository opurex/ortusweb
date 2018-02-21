var view_salesbyproduct = `
<div class="box">
	<nav class="navbar navbar-default">
		<form id="tickets-filter" onsubmit="javascript:salesbyproduct_filter();return false;">
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="start">Du</label>
					<input type="text" class="form-control" name="start" id="start" value="{{start}}" />
				</div>
			</div>
			<div class="navbar-form navbar-left">
				<div data-date-autoclose="true" data-date-format="dd/mm/yyyy" class="col-sm-10 col-md-offset-1 input-group date">
					<label for="stop">au</label>
					<input type="text" class="form-control" name="stop" id="stop" value="{{stop}}" />
				</div>
			</div>
			<div class="row actions">
				<div class="form-group">
					<button class="btn btn-primary btn-send" type="submit">Envoyer</button>
				</div>
			</div>
		</form>
	</nav>
	<div class="box-body" id="report-content">
	</div>
</div>
`;
