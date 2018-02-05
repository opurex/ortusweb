var view_ztickets = `
<div class="box">
	<nav class="navbar navbar-default">
		<form id="ztickets-filter" onsubmit="javascript:ztickets_filter();return false;">
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
	<div class="box-body" id="z-content">
	</div>
</div>
`;

var view_zticketsTable = `
<div class="box">
<table class="table table-bordered table-hover">
<thead>
<tr>
	<th>Caisse</th>
	<th>N°</th>
	<th>Ouverture</th>
	<th>Clôture</th>
	<th>Fond ouverture</th>
	<th>Fond clôture</th>
	<th>Fond attendu</th>
	<th>Tickets</th>
	<th>CA</th>
	<th>CA mois</th>
	<th>CA année</th>
	{{#paymentModes}}
	<th>{{label}}</th>
	{{/paymentModes}}
	{{#taxes}}
	<th>{{label}} base</th>
	<th>{{label}} TVA</th>
	{{/taxes}}
	{{#categories}}
	<th>{{label}}</th>
	{{/categories}}
	{{#catTaxes}}
	<th>{{cat}} {{label}} base</th>
	<th>{{cat}} {{label}} TVA</th>
	{{/catTaxes}}
</tr>
</thead>
<tbody>
{{#z}}
<tr>
	<td>{{cashRegister}}</td>
	<td>{{sequence}}</td>
	<td>{{openDate}}</td>
	<td>{{closeDate}}</td>
	<td>{{openCash}}</td>
	<td>{{closeCash}}</td>
	<td>{{expectedCash}}</td>
	<td>{{ticketCount}}</td>
	<td>{{cs}}</td>
	<td>{{csPeriod}}</td>
	<td>{{csFYear}}</td>
	{{#payments}}
	<td>{{amount}}</td>
	{{/payments}}
	{{#taxes}}
	<td>{{base}}</td>
	<td>{{amount}}</td>
	{{/taxes}}
	{{#categories}}
	<td>{{amount}}</td>
	{{/categories}}
	{{#catTaxes}}
	<td>{{base}}</td>
	<td>{{amount}}</td>
	{{/catTaxes}}
</tr>
{{/z}}
</tbody>
</table>
</div>
`;

