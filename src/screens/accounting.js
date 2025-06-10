function accounting_showZ() {
	let start = new Date(new Date().getTime() - 604800000); // Now minus 7 days
	let stop = new Date(new Date().getTime() + 86400000); // Now + 1 day
	storage_open(function(event) {
		storage_get("options", OPTION_ACCOUNTING_CONFIG, function(option) {
			let values = {
				sales: {},
				taxes: {},
				paymentModes: {},
				customers: {},
				extra: {},
			}
			if (option) {
				// Set values from option
				values = JSON.parse(option.content);
			}
			vue.screen.data = {
				"start": start,
				"stop": stop,
				"accounts": values,
				"missing": {
					sales: {},
					taxes: {},
					customers: {},
					paymentModes: {},
					extra: {},
				},
				"table": new Table().reference("accounting-z-list")

					.column(new TableCol().reference("date").label("Date").type(TABLECOL_TYPE.DATE).visible(true).help("Session opening date."))
					.column(new TableCol().reference("account").label("Account").visible(true).help("Account number for the entry"))
					.column(new TableCol().reference("label").label("Description").visible(true).help("Entry description"))
					.column(new TableCol().reference("debit").label("Debit").visible(true).type(TABLECOL_TYPE.NUMBER2))
					.column(new TableCol().reference("credit").label("Credit").visible(true).type(TABLECOL_TYPE.NUMBER2))
					.column(new TableCol().reference("reference").label("Document").visible(true).help("Reference document name for the entry"))

			}
			vue.screen.component = "vue-accounting-z";
			storage_close();
		});
	});
}

function accounting_ztickets_filter() {
	let start = vue.screen.data.start;
	let stop = vue.screen.data.stop;
	start = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate();
	srvcall_get("api/cash/search/?dateStart=" + start + "&dateStop=" + (stop.getTime() / 1000), _accounting_ztickets_filterCallback);
	gui_showLoading();
}

function _accounting_ztickets_filterCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, accounting_ztickets_filter)) {
		return;
	}
	let zTickets = JSON.parse(response);
	storage_open(function(event) {
		storage_readStores(["cashRegisters", "taxes", "categories", "paymentmodes", "customers"], function(data) {
			_accounting_parseZTickets(data["cashRegisters"], data["paymentmodes"],
				data["taxes"], data["categories"], data["customers"], zTickets);
			storage_close();
		});
	});
}

function _accounting_parseZTickets(cashRegisters, paymentModes, taxes, categories, customers, zTickets) {
	let cashRegistersById = [];
	cashRegisters.forEach(function(cr) {
		cashRegistersById[cr.id] = cr;
	});
	let paymentModesById = [];
	let paymentModeCash = null;
	paymentModes.forEach(function(pm) {
		paymentModesById[pm.id] = pm;
		if (pm.reference == "cash") {
			paymentModeCash = pm;
		}
	});
	let taxesById = [];
	taxes.forEach(function (tax) {
		taxesById[tax.id] = tax;
	});
	let customersById = [];
	customers.forEach(function(cust) {
		customersById[cust.id] = cust;
	});
	vue.screen.data.missing = {
		sales: {},
		taxes: {},
		customers: {},
		paymentModes: {},
		extra: {},
	};
	let lines = [];
	zTickets.forEach(function(z) {
		let totalDebit = 0.0;
		let totalCredit = 0.0;
		var date = new Date(z.openDate * 1000);
		let cashRegister = "";
		if (z.cashRegister in cashRegistersById) {
			cashRegister = cashRegistersById[z.cashRegister].label;
		}
		let ref = cashRegister + "-" + z.sequence;
		z.taxes.forEach(function (tax) {
			if (tax.base == 0.0) {
				return;
			}
			let accountSales = vue.screen.data.accounts.sales?.[tax.tax];
			if (!accountSales) {
				accountSales = "???";
				if (!(tax.tax in vue.screen.data.missing.sales)) {
					vue.screen.data.missing.sales[tax.tax] = taxesById?.[tax.tax]?.label;
				}
			}
			let labelSales = "Sales ";
			if (tax.tax in taxesById) {
				labelSales += taxesById[tax.tax].label;
			}
			let creditSales = "";
			let debitSales = "";
			if (tax.base > 0.0) {
				creditSales = tax.base;
				totalCredit += tax.base;
			} else {
				debitSales = -tax.base;
				totalDebit += -tax.base;
			}
			lines.push([date, accountSales, labelSales, debitSales, creditSales, ref]);
			if (tax.amount != 0.0) {
			let accountTax = vue.screen.data.accounts.taxes?.[tax.tax];
				if (!accountTax) {
					accountTax = "???";
					if (!(tax.tax in vue.screen.data.missing.taxes)) {
						vue.screen.data.missing.taxes[tax.tax] = taxesById?.[tax.tax]?.label;
					}
				}
				let labelTax = "VAT Collected";
				if (tax.tax in taxesById) {
					labelTax += taxesById[tax.tax].label;
				}
				let creditTax = "";
				let debitTax = "";
				if (tax.amount > 0.0) {
					creditTax = tax.amount;
					totalCredit += tax.amount;
				} else {
					debitTax = -tax.amount;
					totalDebit += -tax.amount;
				}
				lines.push([date, accountTax, labelTax, debitTax, creditTax, ref]);
			}
		});
		z.payments.forEach(function(pmt) {
			let label = "Payment Received";
			if (pmt.paymentMode in paymentModesById) {
				// Ignore debt and prepaid, those are accounted in customer's balance
				let mode = paymentModesById[pmt.paymentMode];
				label += mode.label;
				if ((mode.type & 0x2) || (mode & 0x4)) {
					return;
				}
			}
			let account = vue.screen.data.accounts.paymentModes?.[pmt.paymentMode];
			if (!account) {
				account = "???";
				if (!(pmt.paymentMode in vue.screen.data.missing.paymentModes)) {
					vue.screen.data.missing.paymentModes[pmt.paymentMode] = paymentModesById?.[pmt.paymentMode]?.label;
				}
			}
			let credit = "";
			let debit = "";
			if (pmt.amount > 0.0) {
				debit = pmt.amount;
				totalDebit += pmt.amount;
			} else {
				credit = -pmt.amount;
				totalCredit += -pmt.amount;
			}
			lines.push([date, account, label, debit, credit, ref]);
		});
		z.custBalances.forEach(function(cust) {
			let account = vue.screen.data.accounts.customers?.[cust.customer];
			if (!account) {
				account = "???";
				if (!(cust.customer in vue.screen.data.missing.customers)) {
					vue.screen.data.missing.customers[cust.customer] = customersById?.[cust.customer]?.dispName;
				}
			}
			let label = "Customer Balance";
			let credit = "";
			let debit = "";
			if (cust.customer in customersById) {
				label += customersById[cust.customer].dispName;
			}
			if (cust.balance > 0.0) {
				credit = cust.balance;
				totalCredit += cust.balance;
			} else {
				debit = -cust.balance;
				totalDebit += -cust.balance;
			}
			lines.push([date, account, label, debit, credit, ref]);
		});
		let closeError = 0.0;
		if (z.closeCash != null && z.expectedCash != null) {
			closeError = z.closeCash - z.expectedCash;
		}
		if (closeError != 0.0) {
			let label = "Cash Register Error";
			let account = null;
			if (paymentModeCash) {
				account = vue.screen.data.accounts.paymentModes?.[paymentModeCash.id];
				if (!account) {
					account = "???";
					if (!(paymentModeCash.id in vue.screen.data.missing.paymentModes)) {
						vue.screen.data.missing.paymentModes[paymentModeCash.id] = paymentModeCash.label;
					}
				}
			} else {
				account = "???";
			}
			let debit = "";
			let credit = "";
			if (closeError > 0.0) {
				debit = closeError;
				totalDebit += closeError;
			} else {
				credit = -closeError;
				totalCredit += -closeError;
			}
			lines.push([date, account, label, debit, credit, ref]);
		}
		let unbalance = totalDebit - totalCredit;
		if (Math.abs(unbalance) > 0.005) {
			let credit = "";
			let debit = "";
			let account, label;
			if (unbalance > 0.0) {
				label = "Exceptional Product";
				let key = "extraCredit";
				account = vue.screen.data.accounts.extra?.[key];
				if (!account) {
					account = "???";
					if (!(key in vue.screen.data.missing.extra)) {
						vue.screen.data.missing.extra[key] = label;
					}
				}
				credit = unbalance;
			} else {
				label = "Exceptional Loss";
				let key = "extraDebit";
				account = vue.screen.data.accounts.extra?.[key];
				if (!account) {
					account = "???";
					if (!(key in vue.screen.data.missing.extra)) {
						vue.screen.data.missing.extra[key] = label;
					}
				}
				debit = -unbalance;
			}
			lines.push([date, account, label, debit, credit, ref]);
		}
	});
	vue.screen.data.table.resetContent(lines);
	gui_hideLoading();
}

function accounting_showConfig() {
	gui_showLoading();
	storage_open(function(event) {
		storage_readStores(["taxes", "paymentmodes", "customers"], function(data) {
				vue.screen.data = {
					taxes: data.taxes,
					paymentModes: data.paymentmodes,
					customers: data.customers,
					values: {
						sales: {},
						taxes: {},
						paymentModes: {},
						customers: {},
						extra: {},
					}
				};
			storage_get("options", OPTION_ACCOUNTING_CONFIG, function(option) {
				let values = vue.screen.data.values; // no values
				if (option) {
					// Set values from option
					values = JSON.parse(option.content);
				}
				["sales", "taxes", "paymentModes", "customers", "extra"].forEach(function(key) {
					if (!(key in values)) {
						values[key] = {};
					}
				});
				Object.keys(values.sales).forEach(tid => {
					vue.screen.data.values.sales[tid] = values?.sales?.[tid]
				});
				Object.keys(values.taxes).forEach(tid => {
					vue.screen.data.values.taxes[tid] = values?.taxes?.[tid]
				});
				Object.keys(values.paymentModes).forEach(pmId => {
					vue.screen.data.values.paymentModes[pmId] = values?.paymentModes?.[pmId];
				});
				Object.keys(values.customers).forEach(custId => {
					vue.screen.data.values.customers[custId + ""] = values?.customers?.[custId];
				});
				Object.keys(values.extra).forEach(id => {
					vue.screen.data.values.extra[id] = values?.extra?.[id];
				});
				vue.screen.component = "vue-accounting-config";
				storage_close();
				gui_hideLoading();
			});
		});
	});
}

function accounting_saveConfig() {
	gui_showLoading();
	// Remove empty string values
	let values = {
		sales: {},
		taxes: {},
		paymentModes: {},
		customers: {},
		extra: {},
	};
	for (key in values) {
		for (id in vue.screen.data.values[key]) {
			if (vue.screen.data.values[key][id] != "") {
				values[key][id] = vue.screen.data.values[key][id];
			}
		}
	}
	let config = Option(OPTION_ACCOUNTING_CONFIG, JSON.stringify(values));
	srvcall_post("api/option", config, accounting_saveConfigCallback);
}

function accounting_saveConfigCallback(request, status, response) {
	if (srvcall_callbackCatch(request, status, response, accounting_saveConfig)) {
		return;
	}
	let data = JSON.parse(response);
	storage_open(function(event) {
		storage_write("options", data, appData.localWriteDbSuccess, appData.localWriteDbError);
	}, appData.localWriteDbOpenError);
}
