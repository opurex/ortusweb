Vue.component("vue-tickets-list", {
	props: ["data"],
	template: `<div class="tickets-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Tickets</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:tickets_search();return false;">
				<div class="form-group">
					<label for="start">Du</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">au</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<label for="cashregister">Caisse</label>
					<select id="filter-cashregister" name="cashregister" v-model="data.cashRegisterId">
						<option v-for="cr in data.cashRegisters" v-bind:value="cr.id">{{cr.label}}</option>
						<option value="">Toutes les caisses</option>
					</select>
				</div>

				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content" style="display:flex;flex-direction:row;align-items:center;justify-content:space-around">
		<vue-table v-bind:table="data.table" ref="ticketTable"></vue-table>
		<vue-tickets-content v-if="data.selectedTicket" v-bind:ticket="data.selectedTicket"></vue-tickets-content>
	</article>
</section>
</div>
`});

Vue.component("vue-tickets-content", {
	props: ["ticket"],
	template: `<div class="ticket">
<pre v-if="ticket">
Ticket :    {{ticket.cashRegister}} - {{ticket.number}}
Date :      {{ticket.date}}
Servi par : {{ticket.user}}
<template v-if="ticket.customer">Client :    {{ticket.customer}}</template>


Article      Prix          Total
--------------------------------
<template v-for="line in ticket.lines">
{{line.label}}
{{padBefore(line.price, 17)}}{{padBefore("x" + line.quantity, 5)}}{{padBefore(line.taxedPrice, 10)}}
<template v-if="line.discountRate">
* Remise {{padBefore(line.discountRate, 5)}} {{padBefore(line.discountAmount, 17)}}
</template>
</template>
<template v-if="ticket.discountRate">
Total avant remise {{padBefore(ticket.taxedPrice,13)}}
Remise {{ticket.discountRate}} {{padBefore(ticket.discountAmount, 21)}}
</template>


TVA          Base        Montant
--------------------------------
<template v-for="tax in ticket.taxes">
{{padAfter(tax.label, 10)}}{{padBefore(tax.base, 7)}}{{padBefore(tax.amount,15)}}
</template>


Sous-total {{padBefore(ticket.finalPrice, 21)}}
Total      {{padBefore(ticket.finalTaxedPrice, 21)}}
Dont TVA   {{padBefore(ticket.taxSum, 21)}}

<template v-for="pm in ticket.payments"><template v-if="pm.label.length> 20">{{pm.label}}
{{padBefore(pm.amount, 32)}}</template><template v-else>{{padAfter(pm.label, 20)}}{{padBefore(pm.amount, 12)}}</template>
</template>
</pre>
</div>
`,
	methods: {
		padBefore: function(txt, size) {
			let pad = "";
			for (let i = 0; i < size - txt.length; i++) {
				pad += " ";
			}
			return pad + txt;
		},
		padAfter: function(txt, size) {
			let pad = "";
			for (let i = 0; i < size - txt.length; i++) {
				pad += " ";
			}
			return txt + pad;
		}
	}
});
