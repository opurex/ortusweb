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
<h2>Tickets Z du {{start}} au {{stop}}</h2>
<table class="table table-bordered table-hover">
<thead>
<tr>
	<th colspan="8">Session de caisse</th>
	<th colspan="3" class="z-oddcol">Chiffre d'affaire</th>
	<th colspan="{{paymentModesCount}}">Encaissements</th>
	<th colspan="{{taxesCount}}" class="z-oddcol">Taxes</th>
	<th colspan="{{categoriesCount}}">CA par catégorie</th>
	<th colspan="{{catTaxesCount}}" class="z-oddcol">Taxes par catégorie</th>
</tr>
<tr>
	<th>Caisse</th>
	<th>N°</th>
	<th>Ouverture</th>
	<th>Clôture</th>
	<th>Fond ouverture</th>
	<th>Fond clôture</th>
	<th>Fond attendu</th>
	<th>Tickets</th>
	<th class="z-oddcol">CA</th>
	<th class="z-oddcol">CA mois</th>
	<th class="z-oddcol">CA année</th>
	{{#paymentModes}}
	<th>{{label}}</th>
	{{/paymentModes}}
	{{#taxes}}
	<th class="z-oddcol">{{label}} base</th>
	<th class="z-oddcol">{{label}} TVA</th>
	{{/taxes}}
	{{#categories}}
	<th>{{label}}</th>
	{{/categories}}
	{{#catTaxes}}
	<th class="z-oddcol">{{cat}} {{label}} - base</th>
	<th class="z-oddcol">{{cat}} {{label}} - TVA</th>
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
	<td class="z-oddcol">{{cs}}</td>
	<td class="z-oddcol">{{csPeriod}}</td>
	<td class="z-oddcol">{{csFYear}}</td>
	{{#payments}}
	<td>{{amount}}</td>
	{{/payments}}
	{{#taxes}}
	<td class="z-oddcol">{{base}}</td>
	<td class="z-oddcol">{{amount}}</td>
	{{/taxes}}
	{{#categories}}
	<td>{{amount}}</td>
	{{/categories}}
	{{#catTaxes}}
	<td class="z-oddcol">{{base}}</td>
	<td class="z-oddcol">{{amount}}</td>
	{{/catTaxes}}
</tr>
{{/z}}
</tbody>
</table>
</div>
`;

