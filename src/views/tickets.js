Vue.component("vue-tickets-list", {
	props: ["data"],
	template: `<div class="tickets-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Tickets</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="tickets-filter" onsubmit="javascript:tickets_search();return false;">
				<div class="form-group">
					<label for="start">From</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">To</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-group">
					<label for="cashregister">Cash Register</label>
					<select id="filter-cashregister" name="cashregister" v-model="data.cashRegisterId">
						<option v-for="cr in data.cashRegisters" v-bind:value="cr.id">{{cr.label}}</option>
						<option value="">All cash registers</option>
					</select>
				</div>

				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Search</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body" id="report-content">
		<vue-tickets-table 
			v-bind:tickets="data.tickets" 
			v-bind:title="data.tableTitle" 
			v-bind:cashRegisters="data.cashRegisters" 
			v-bind:taxes="data.taxes" 
			v-bind:paymentModes="data.paymentModes" 
			v-bind:customers="data.customers" 
			v-bind:users="data.users">
		</vue-tickets-table>
	</article>
</section>
</div>
`,
});

Vue.component("vue-tickets-table", {
	props: ["cashRegisters", "customers", "taxes", "tickets", "paymentModes", "users", "title"],
	data: function() {
		let table = new Table().reference("ticket-list")
			.column(new TableCol().reference("cashRegister").label("Cash Register").visible(false).help("The name of the cash register."))
			.column(new TableCol().reference("sequence").label("Sequence").type(TABLECOL_TYPE.NUMBER).visible(false).help("The session number of the cash register. The sequence number increases at each cash register closing."))
			.column(new TableCol().reference("number").label("Number").type(TABLECOL_TYPE.NUMBER).visible(true).help("The ticket number from the cash register."))
			.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATETIME).visible(true).help("The date of the sale."))
			.column(new TableCol().reference("customer").label("Customer").footerType(TABLECOL_FOOTER.CUSTOM, "Total").visible(false).help("The customer account associated with the ticket."))
			.column(new TableCol().reference("custBalance").label("Customer Balance").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The total variation of the customer's account balance. Positive for prepaid recharges or refunds, negative for expenses or debts."))
			.column(new TableCol().reference("finalPrice").label("Amount excl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The ticket amount excluding tax after discount."))
			.column(new TableCol().reference("finalTaxedPrice").label("Amount incl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(true).help("The ticket amount including tax after discount."))
			.column(new TableCol().reference("discountRate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(false).help("The discount applied on the entire ticket (included in TTC, HT and VAT amounts)."))
			.column(new TableCol().reference("discountAmount").label("Discount Amount excl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The discount value excluding tax."))
			.column(new TableCol().reference("discountTaxedAmount").label("Discount Amount incl. tax").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The discount value including tax."))
			.column(new TableCol().reference("paymentModes").label("Payments").visible(true).help("The payment methods used for the payment."))
			.column(new TableCol().reference("overPerceived").label("Overpaid").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount overpaid for payment methods without change given."));

		this.paymentModes.forEach(pm => {
			table.column(new TableCol().reference("pm-" + pm.reference).label(pm.label).type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).class("z-oddcol").help("The amount paid with this payment method during the session."));
		});

		this.taxes.forEach(tax => {
			table.column(new TableCol().reference("tax-" + tax.id + "-base").label(tax.label + " base").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount of turnover excluding tax associated with the VAT rate."));
			table.column(new TableCol().reference("tax-" + tax.id + "-amount").label(tax.label + " VAT").type(TABLECOL_TYPE.NUMBER2).footerType(TABLECOL_FOOTER.SUM).visible(false).help("The amount of VAT collected associated with the VAT rate."));
		});

		table
			.column(new TableCol().reference("user").label("Operator").visible(false).help("The user account name who performed the sale."))
			.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).visible(true).exportable(false).help("Select the ticket. This field is never exported."));

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
				<button type="button" class="btn btn-misc" v-on:click="closeModal">Close</button>
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
				let crLbl = "Unknown";
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
				// Retrieve username
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
				line.push("<div class=\"btn-group pull-right\" role=\"group\"><button type=\"button\" class=\"btn btn-edit\" onclick=\"javascript:vue['" + this.tableRef + "'].selectTicket(" + i + ");\">Show</button></div>");
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
Ticket:    {{ticketView.cashRegister}} - {{ticketView.number}}
Date:      {{ticketView.date}}
Served by: {{ticketView.user}}
<template v-if="ticketView.customer">Customer:  {{ticketView.customer}}</template>

Item       Unit Price  Qty  Total/Tax
------------------------------------
<template v-for="line in ticketView.lines">
{{line.label}}
{{padBefore(line.price, 16)}}{{padBefore("x" + line.quantity, 6)}}{{padBefore(line.taxedPrice, 8)}} {{getTaxCode(line)}}<template v-if="line.discountRate">
* Discount {{padBefore(line.discountRate, 5)}} {{padBefore(line.discountAmount, 17)}}</template></template>
<template v-if="ticketView.discountRate">--------------------------------
Total before discount {{padBefore(ticketView.taxedPrice,13)}}
Discount {{ticketView.discountRate}} {{padBefore(ticketView.discountAmount, 21)}}</template>

VAT                Base      Amount
<template v-for="tax,i in ticketView.taxes">{{padAfter(taxToCode(i) + ". " + tax.label, 12)}}{{padBefore(tax.base, 10)}}{{padBefore(tax.amount,10)}}
</template>
Subtotal {{padBefore(ticketView.finalPrice, 21)}}
VAT      {{padBefore(ticketView.taxSum, 21)}}

<div style="font-weight: bold; transform: scale(1.0, 2.0);">Total    {{padBefore(ticketView.finalTaxedPrice, 21)}}</div>

<template v-for="pm in ticketView.payments"><template v-if="pm.label.length > 20">{{pm.label}}
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
			const codes = "abcdefghijklmnopqrstuvwxyz";
			return i >= 0 && i < codes.length ? codes[i] : "?";
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
			let cr = this.cashRegisters.find(e => e.id == this.ticket.cashRegister);
			if (typeof cr != "undefined") {
				crLbl = cr.label;
			}
			// Get user's name
			let userName = "";
			let user = this.users.find(e => e.id == this.ticket.user);
			if (typeof user != "undefined") {
				userName = user.name;
			}
			// Get customer's name
			let customerName = null;
			if (this.ticket.customer != null) {
				let cust = this.customers.find(e => e.id == this.ticket.customer);
				if (typeof cust != "undefined") {
					customerName = cust.dispName;
				}
			}
			// Build ticket view object
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
				line.discountRate = (tktline.discountRate == 0.0) ? null : ((tktline.discountRate*100).toLocaleString() + "%");
				line.discountAmount = (tktline.finalTaxedPrice - tktline.taxedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 });
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
					pmLabel = (tktpm.amount >= 0) ? pmMode.label : pmMode.backLabel;
				}
				let pm = {
					label: pmLabel,
					amount: tktpm.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
				};
				tkt.payments.push(pm);
			}
			return tkt;
		},
	},
});
