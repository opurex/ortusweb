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
		<vue-tickets-table v-bind:tickets="data.tickets" v-bind:title="data.tableTitle" v-bind:cashRegisters="data.cashRegisters" v-bind:taxes="data.taxes" v-bind:paymentModes="data.paymentModes" v-bind:customers="data.customers" v-bind:users="data.users"></vue-tickets-table>
	</article>
</section>
</div>
`,
});

Vue.component("vue-tickets-table", {
	props: ["cashRegisters", "customers", "taxes", "tickets", "paymentModes", "users", "title"],
	data: function() {
		let table = new Table().reference("ticket-list")
			.column(new TableCol().reference("cashRegster").label("Caisse").visible(false).help("Le nom de la caisse."))
			.column(new TableCol().reference("sequence").label("Séquence").type(TABLECOL_TYPE.NUMBER).visible(false).help("Le numéro de session de la caisse. Le numéro de séquence augmente à chaque clôture de caisse."))
			.column(new TableCol().reference("number").label("Numéro").type(TABLECOL_TYPE.NUMBER).visible(true).help("Le numéro du ticket de la caisse."))
			.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATETIME).visible(true).help("La date de réalisation de la vente."))
			.column(new TableCol().reference("customer").label("Client").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(false).help("Le compte client associé au ticket."))
			.column(new TableCol().reference("custBalance").label("Balance client").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("La variation totale du solde du compte client. En positif pour les recharges pré-payés ou remboursements, en négatif pour les dépenses ou dettes."))
			.column(new TableCol().reference("finalPrice").label("Montant HT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("Le montant HT du ticket après remise."))
			.column(new TableCol().reference("finalTaxedPrice").label("Montant TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("Le montant TTC du ticket après remise."))
			.column(new TableCol().reference("discountRate").label("Remise").type(TABLECOL_TYPE.PERCENT).visible(false).help("La remise accordée sur la totalité du ticket (incluse dans les montant TTC, HT et de TVA)"))
			.column(new TableCol().reference("discountAmount").label("Montant de remise HT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("La valeur HT de la remise accordée"))
			.column(new TableCol().reference("discountTaxedAmount").label("Montant de remise TTC").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("La valeur TTC de la remise accordée"))
			.column(new TableCol().reference("paymentmodes").label("Encaissement").visible(true).help("Les modes de paiement utilisés à l'encaissement."))
			.column(new TableCol().reference("overPerceived").label("Trop perçu").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("Le montant trop perçu pour les modes de paiement sans rendu-monnaie."));
		this.paymentModes.forEach(pm => {
			table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).class("z-oddcol").help("Le montant des encaissements réalisés avec ce moyen de paiement sur la session."));
		});
		this.taxes.forEach(tax => {
			table.column(new TableCol().reference("tax-" + tax.id + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("Le montant de chiffre d'affaire hors taxe associé au taux de TVA."));
			table.column(new TableCol().reference("tax-" + tax.id + "-amount").label(tax.label + " TVA").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("Le montant de TVA collectée associé au taux de TVA."));
		});
		table
			.column(new TableCol().reference("user").label("Opérateur").visible(false).help("Le nom du compte utilisateur qui a réalisé la vente."))
			.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).visible(true).exportable(false).help("Sélectionner le ticket. Ce champ n'est jamais exporté."));
		return {
			"selectedTicket": null,
			"table": table,
			"tableRef": "table" + String(Math.random()).replace("0.", "").valueOf(),
		};
	},
	template: `<div>
	<vue-table v-bind:table="table" v-bind:ref="tableRef"></vue-table>
	<div v-if="selectedTicket" class="modal-container" v-on:click="closeModal">
		<div style="display: flex; flex-direction: column; align-items: end; gap: 1rem; overflow: hidden;">
			<button type="button" class="btn btn-misc" v-on:click="closeModal">Fermer</button>
			<vue-tickets-content v-if="selectedTicket" v-bind:ticket="selectedTicket"
				v-bind:cashRegisters="cashRegisters" v-bind:customers="customers" v-bind:taxes="taxes" v-bind:paymentModes="paymentModes" v-bind:users="users"></vue-tickets-content>
		</div>
	</div>
</div>`,
	methods: {
		closeModal: function(event) {
			if (event.target == event.currentTarget) {
				this.selectedTicket = null;
			}
		},
		selectTicket: function(index) {
			this.selectedTicket = this.tickets[index];
		}
	},
	watch: {
		tickets: function(newTickets, _oldTickets) {
			let lines = [];
			for (let i = 0; i < newTickets.length; i++) {
				let tkt = newTickets[i];
				let crLbl = "Inconnue";
				let cr = this.cashRegisters.find(e => e.id == tkt.cashRegister);
				if (typeof cr != "undefined") {
					crLbl = cr.label;
				}
				let date = new Date(tkt.date * 1000);
				let customerName = "";
				if (tkt.customer != null) {
					let cust = this.customers.find(e => e.id == tkt.customer);
					if (typeof cust != "undefined") {
						customerName = cust.dispName;
					}
				}
				let pmTotal = 0.0;
				let pmModes = [];
				let taxes = [];
				let actualPrice = 0.0; // total of tax bases, to compute the discount amount until it is stored in the ticket
				this.paymentModes.forEach(pm => {
					pmModes.push({id: pm.id, amount: 0.0, label: pm.label});
				});
				this.taxes.forEach(tax => {
					taxes.push({id: tax.id, base: 0.0, amount: 0.0});
				});
				tkt.payments.forEach(payment => {
					pmTotal += payment.amount;
					let pm = pmModes.find((p) => p.id == payment.paymentMode);
					pm.amount += payment.amount;
				});
				tkt.taxes.forEach(tktTax => {
					let tax = taxes.find((t) => t.id == tktTax.tax);
					tax.base += tktTax.base;
					tax.amount += tktTax.amount;
					actualPrice += tax.base;
				});
				// Compute missing data from the raw ticket
				/* Assume B2C mode is used (taxedPrice is set, price is not reliable). */
				let overPerceived = pmTotal - tkt.finalTaxedPrice;
				let discountAmount = actualPrice / (1.0 - tkt.discountRate) - actualPrice;
				discountAmount = Number.parseFloat(discountAmount.toFixed(2));
				let discountTaxedAmount = tkt.taxedPrice - tkt.finalTaxedPrice;
				// List payment modes
				let pmModesStr = "";
				pmModes.forEach(pm => {
					if (pm.amount == 0.0) {
						return;
					}
					pmModesStr += ", " + pm.label;
				});
				pmModesStr = pmModesStr.substring(2);
				// Retreive username
				let userName = "";
				let user = this.users.find(e => e.id == tkt.user);
				if (typeof user != "undefined") {
					userName = user.name;
				}
				// Fill the table
				line = [crLbl, tkt.sequence, tkt.number, date, customerName, tkt.custBalance, tkt.finalPrice, tkt.finalTaxedPrice, tkt.discountRate, discountAmount, discountTaxedAmount, pmModesStr, overPerceived];
				pmModes.forEach(pm => {
					line.push(pm.amount);
				});
				taxes.forEach(tax => {
					line.push(tax.base);
					line.push(tax.amount);
				});
				line.push(userName);
				// dirty hack with access to the current table in the root element (see mounted/unmounted)
				line.push("<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:vue['" + this.tableRef + "'].selectTicket(" + i + ");\">Afficher</a></div>");
				lines.push(line);
			}
			this.table.resetContent(lines);
			this.selectedTicket = null;
		},
		title: function(newTitle, oldTitle) {
			this.table.title(newTitle);
		}
	},
	mounted: function() {
		// Register a link to the table in the root component for dynamic javascript
		let root = this;
		while (("$parent" in root) && (typeof root.$parent != "undefined")) {
			root = root.$parent;
		}
		root[this.tableRef] = this;
	},
	unmounted: function() {
		// Unregister the table from the root component
		let root = this;
		while ("$parent" in root) {
			root = root.$parent;
		}
		delete root[this.tableRef];
	},
});

Vue.component("vue-tickets-content", {
	props: ["cashRegisters", "customers", "taxes", "paymentModes", "users", "ticket"],
	template: `<div class="ticket">
<pre v-if="ticket">
Ticket :    {{ticketView.cashRegister}} - {{ticketView.number}}
Date :      {{ticketView.date}}
Servi par : {{ticketView.user}}
<template v-if="ticketView.customer">Client :    {{ticketView.customer}}</template>


Article     P.U.   Qté Total/TVA
--------------------------------
<template v-for="line in ticketView.lines">
{{line.label}}
{{padBefore(line.price, 16)}}{{padBefore("x" + line.quantity, 6)}}{{padBefore(line.taxedPrice, 8)}} {{getTaxCode(line)}}<template v-if="line.discountRate">
* Remise {{padBefore(line.discountRate, 5)}} {{padBefore(line.discountAmount, 17)}}</template></template>
<template v-if="ticketView.discountRate">--------------------------------
Total avant remise {{padBefore(ticketView.taxedPrice,13)}}
Remise {{ticketView.discountRate}} {{padBefore(ticketView.discountAmount, 21)}}</template>

TVA               Base   Montant
<template v-for="tax,i in ticketView.taxes">{{padAfter(taxToCode(i) + ". " + tax.label, 12)}}{{padBefore(tax.base, 10)}}{{padBefore(tax.amount,10)}}
</template>
Sous-total {{padBefore(ticketView.finalPrice, 21)}}
TVA        {{padBefore(ticketView.taxSum, 21)}}

<div style="font-weight: bold; transform: scale(1.0, 2.0);">Total      {{padBefore(ticketView.finalTaxedPrice, 21)}}</div>


<template v-for="pm in ticketView.payments"><template v-if="pm.label.length> 20">{{pm.label}}
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
			for (let i = 0; i < this.ticketView.taxes.length; i++) {
				if (this.ticketView.taxes[i].tax == taxId) {
					return this.taxToCode(i);
				}
			}
			return "?";
		},
	},
	computed: {
		"ticketView": function() {
			// Get cash register label
			let crLbl = "";
			let cr = this.cashRegisters.find(e => e.id == this.ticket.cashRegister, this);
			if (typeof cr != "undefined") {
				crLbl = cr.label;
			}
			// Get user's name
			let userName = "";
			let user = this.users.find(e => e.id == this.ticket.user, this);
			if (typeof user != "undefined") {
				userName = user.name;
			}
			// Get customer's name
			let customerName = null;
			if (this.ticket.customer != null) {
				let cust = this.customers.find(e => e.id == this.ticket.customer, this);
				if (typeof cust != "undefined") {
					customerName = cust.dispName;
				}
			}
			// Build ticket
			let tkt = {
				cashRegister: crLbl,
				number: this.ticket.number,
				date: tools_dateTimeToString(new Date(this.ticket.date * 1000)),
				user: userName,
				customer: customerName,
				lines: [],
				payments: [],
				taxes: [],
				discountRate: (this.ticket.discountRate == 0.0) ? null : ((this.ticket.discountRate*100).toLocaleString() + "%"),
				discountAmount: (this.ticket.finalTaxedPrice - this.ticket.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
				taxedPrice: this.ticket.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				finalPrice: this.ticket.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				finalTaxedPrice: this.ticket.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				taxSum: (this.ticket.finalTaxedPrice - this.ticket.finalPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
			}
			for (let i = 0; i < this.ticket.lines.length; i++) {
				let tktline = this.ticket.lines[i];
				let line = {};
				line.label = tktline.productLabel;
				line.price = tktline.taxedUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				line.quantity = tktline.quantity.toLocaleString();
				line.discountRate = (tktline.discountRate == 0.0) ? null : ((tktline.discountRate*100).toLocaleString() + "%"),
				line.discountAmount = (tktline.finalTaxedPrice - tktline.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }),
				line.taxedPrice = tktline.taxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				line.finalTaxedPrice = tktline.finalTaxedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 });
				tkt.lines.push(line);
			}
			for (let i = 0; i < this.ticket.taxes.length; i++) {
				let tkttax = this.ticket.taxes[i];
				let taxLabel = "";
				let tax = this.taxes.find(e => e.id == tkttax.tax);
				if (typeof tax != "undefined") {
					taxLabel = tax.label;
				}
				let taxView = {
					label: taxLabel,
					base: tkttax.base.toLocaleString(undefined, { minimumFractionDigits: 2 }),
					amount: tkttax.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				};
				tkt.taxes.push(taxView);
			}
			for (let i = 0; i < this.ticket.payments.length; i++) {
				let tktpm = this.ticket.payments[i];
				let pmLabel = "";
				let pmMode = this.paymentModes.find(e => e.id == tktpm.paymentMode);
				if (typeof pmMode != "undefined") {
					if (tktpm.amount >= 0) {
						pmLabel = pmMode.label;
					} else {
						pmLabel = pmMode.backLabel;
					}
				}
				let pm = {
					label: pmLabel,
					amount: tktpm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				}
				tkt.payments.push(pm);
			}
			return tkt;
		},
	},
});
