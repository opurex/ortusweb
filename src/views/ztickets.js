Vue.component("vue-zticket-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<form id="ztickets-filter" onsubmit="javascript:ztickets_filter();return false;">
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
	<div class="box-body" id="z-content" v-if="data.z">
		<div class="box">
			<h2>Tickets Z du {{data.startDisp}} au {{data.stopDisp}}</h2>
			<table class="table table-bordered table-hover">
				<thead>
					<tr>
						<th colspan="8">Session de caisse</th>
						<th colspan="3" class="z-oddcol">Chiffre d'affaire</th>
						<th v-bind:colspan="data.paymentModes.length">Encaissements</th>
						<th v-bind:colspan="data.taxes.length * 2" class="z-oddcol">Taxes</th>
						<th v-bind:colspan="data.categories.length">CA par catégorie</th>
						<th v-bind:colspan="data.catTaxes.length * 2" class="z-oddcol">Taxes par catégorie</th>
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
						<th v-for="pm in data.paymentModes">{{pm.label}}</th>
						<template v-for="tax in data.taxes">
							<th class="z-oddcol">{{tax.label}} base</th>
							<th class="z-oddcol">{{tax.label}} TVA</th>
						</template>
						<th v-for="cat in data.categories">{{cat.label}}</th>
						<template v-for="catTax in data.catTaxes">
							<th class="z-oddcol">{{catTax.cat}} {{catTax.label}} - base</th>
							<th class="z-oddcol">{{catTax.cat}} {{catTax.label}} - TVA</th>
						</template>
					</tr>
				</thead>
				<tbody>
					<tr v-for="z in data.z">
						<td>{{z.cashRegister}}</td>
						<td>{{z.sequence}}</td>
						<td>{{z.openDate}}</td>
						<td>{{z.closeDate}}</td>
						<td>{{z.openCash}}</td>
						<td>{{z.closeCash}}</td>
						<td>{{z.expectedCash}}</td>
						<td>{{z.ticketCount}}</td>
						<td class="z-oddcol">{{z.cs}}</td>
						<td class="z-oddcol">{{z.csPeriod}}</td>
						<td class="z-oddcol">{{z.csFYear}}</td>
						<td v-for="p in z.payments">{{p.amount}}</td>
						<template v-for="t in z.taxes">
							<td class="z-oddcol">{{t.base}}</td>
							<td class="z-oddcol">{{t.amount}}</td>
						</template>
						<td v-for="c in z.categories">{{c.amount}}</td>
						<template v-for="ct in z.catTaxes">
							<td class="z-oddcol">{{ct.base}}</td>
							<td class="z-oddcol">{{ct.amount}}</td>
						</template>
					</tr>
				</tbody>
				<tfoot>
					<tr>
						<th colspan="7">Totaux</th>
						<th>{{data.total.tickets}}</th>
						<th class="z-oddcol">{{data.total.cs}}</th>
						<th colspan="2" class="z-oddcol"></th>
						<th v-for="pmTotal in data.total.paymentModeTotal">{{pmTotal}}</th>
						<template v-for="taxTotal in data.total.taxTotal">
							<th class="z-oddcol">{{taxTotal.base}}</th>
							<th class="z-oddcol">{{taxTotal.amount}}</th>
						</template>
						<th v-for="catTotal in data.total.categoryTotal">{{catTotal}}</th>
						<template v-for="catTaxTotal in data.total.catTaxTotal">
							<th class="z-oddcol">{{catTaxTotal.base}}</th>
							<th class="z-oddcol">{{catTaxTotal.amount}}</th>
						</template>
					</tr>
				</tfoot>
			</table>
		</div>
	</div>
</div>
</div>
`});

