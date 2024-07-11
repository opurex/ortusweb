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
	<article class="box-body" id="report-content">
		<vue-table v-bind:table="data.table" ref="ticketTable"></vue-table>
		<div v-if="data.selectedTicket" class="modal-container">
			<div style="display: flex; flex-direction: column; align-items: end; gap: 1rem; overflow: hidden;">
				<button type="button" class="btn btn-misc" onclick="javascript:_tickets_selectTicket(null);">Fermer</button>
				<vue-tickets-content v-if="data.selectedTicket" v-bind:ticket="data.selectedTicket"></vue-tickets-content>
			</div>
		</div>
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


Article     P.U.   Qté Total/TVA
--------------------------------
<template v-for="line in ticket.lines">
{{line.label}}
{{padBefore(line.price, 16)}}{{padBefore("x" + line.quantity, 6)}}{{padBefore(line.taxedPrice, 8)}} {{getTaxCode(line)}}<template v-if="line.discountRate">
* Remise {{padBefore(line.discountRate, 5)}} {{padBefore(line.discountAmount, 17)}}</template></template>
<template v-if="ticket.discountRate">--------------------------------
Total avant remise {{padBefore(ticket.taxedPrice,13)}}
Remise {{ticket.discountRate}} {{padBefore(ticket.discountAmount, 21)}}</template>

TVA               Base   Montant
<template v-for="tax,i in ticket.taxes">{{padAfter(taxToCode(i) + ". " + tax.label, 12)}}{{padBefore(tax.base, 10)}}{{padBefore(tax.amount,10)}}
</template>
Sous-total {{padBefore(ticket.finalPrice, 21)}}
TVA        {{padBefore(ticket.taxSum, 21)}}

<div style="font-weight: bold; transform: scale(1.0, 2.0);">Total      {{padBefore(ticket.finalTaxedPrice, 21)}}</div>


<template v-for="pm in ticket.payments"><template v-if="pm.label.length> 20">{{pm.label}}
{{padBefore(pm.amount, 32)}}</template><template v-else>{{padAfter(pm.label, 20)}}{{padBefore(pm.amount, 12)}}
</template>
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
		},
		taxToCode: function(i) {
			switch (i) {
				case 0: return "a";
				case 1: return "b";
				case 2: return "c";
				case 3: return "d";
				case 4: return "e";
				case 5: return "f";
				case 6: return "g";
				case 7: return "h";
				case 8: return "i";
				case 9: return "j";
				case 10: return "k";
				case 11: return "l";
				case 12: return "m";
				case 13: return "n";
				case 14: return "o";
				case 15: return "p";
				case 16: return "q";
				case 17: return "r";
				case 18: return "s";
				case 19: return "t";
				case 20: return "u";
				case 21: return "v";
				case 22: return "w";
				case 23: return "x";
				case 24: return "y";
				case 25: return "z";
				default: return "?";
			}
		},
		getTaxCode: function(line) {
			let taxId = line.tax;
			for (let i = 0; i < this.ticket.taxes.length; i++) {
				if (this.ticket.taxes[i].tax == taxId) {
					return this.taxToCode(i);
				}
			}
			return "?";
		},
	}
});
