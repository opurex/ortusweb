Vue.component("vue-accounting-z", {
	props: ["data"],
	template: `<div class="accounting-z">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Écritures comptables des tickets Z</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<form id="ztickets-filter" onsubmit="javascript:accounting_ztickets_filter();return false;">
				<div class="form-group">
					<label for="start">Ouverture entre le</label>
					<vue-inputdate id="start" v-model="data.start" />
				</div>
				<div class="form-group">
					<label for="stop">et le</label>
					<vue-inputdate id="stop" v-model="data.stop" />
				</div>
				<div class="form-control">
					<button class="btn btn-primary btn-send" type="submit">Rechercher</button>
				</div>
			</form>
		</nav>
	</header>
	<article class="box-body">
		<p class="warning">Cet écran vous permet d'exporter vos tickets Z sous la forme d'écritures comptables pour simplifier l'import dans un logiciel tiers de comptabilité. Ce tableau ne peut pas faire office de journal de caisse directement.</p>
		<template v-if="hasMissing()">
			<p>Le numéro de compte pour les lignes suivantes n'est pas configuré :</p>
			<ul v-for="miss in missingList">
				<li>{{miss}}</li>
			</ul>
		</template>
		<vue-table v-bind:table="data.table" ref="table"></vue-table>
	</article>
</section>
</div>
`,
	computed: {
		missingList: function() {
			let missList = [];
			let thiss = this;
			Object.keys(this.data.missing.sales).forEach(function(miss) {
				missList.push("Ventes " + thiss.data.missing.sales[miss]);
			});
			Object.keys(this.data.missing.taxes).forEach(function(miss) {
				missList.push("TVA collectée " + thiss.data.missing.taxes[miss]);
			});
			Object.keys(this.data.missing.paymentModes).forEach(function(miss) {
				missList.push("Encaissements " + thiss.data.missing.paymentModes[miss]);
			});
			Object.keys(this.data.missing.customers).forEach(function(miss) {
				missList.push("Balance client " + thiss.data.missing.customers[miss]);
			});
			Object.keys(this.data.missing.extra).forEach(function(miss) {
				missList.push(thiss.data.missing.extra[miss]);
			});
			return missList;
		},
	},
	methods: {
		hasMissing: function() {
			return this.missingList.length > 0;
		}
	}
});

Vue.component("vue-accounting-config", {
	props: ["data"],
	template : `<div class="accounting-config">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Configuration de la comptabilité</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-accounting-form" class="form-large" onsubmit="javascript:accounting_saveConfig(); return false;">
			<fieldset>
				<legend>Ventes</legend>
				<template v-for="t in data.taxes">
					<vue-input-text v-bind:label="sales_label(t)" v-model="data.values.sales[t.id]" v-bind:id="'edit-sales-' + t.id" placeholder="70XXX" />
				</template>
				<vue-input-text label="Produit exceptionnel" v-model="data.values.extra.extraCredit" id="extraCredit" placeholder="7788X" />
				<vue-input-text label="Perte exceptionnelle" v-model="data.values.extra.extraDebit" id="extraDebit" placeholder="6788X" />
			</fieldset>
			</fieldset>
			<fieldset>
				<legend>TVA collectée</legend>
				<template v-for="t in data.taxes">
					<vue-input-text v-bind:label="taxes_label(t)" v-model="data.values.taxes[t.id]" v-bind:id="'edit-tax-' + t.id" placeholder="44571XX" />
				</template>
			</fieldset>
			<fieldset>
				<legend>Encaissements</legend>
				<template v-for="p in data.paymentModes">
					<vue-input-text v-bind:label="pm_label(p)" v-model="data.values.paymentModes[p.id]" v-bind:id="'edit-pm-' + p.id" placeholder="5XXXXX" />
				</template>
			</fieldset>
			<fieldset>
				<legend>Balance client</legend>
				<template v-for="c in data.customers" >
					<vue-input-text v-bind:label="cust_label(c)" v-model="data.values.customers[c.id]" v-bind:id="'edit-cust-' + c.id" placeholder="4111XXX" />
				</template>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		sales_label: function(tax) {
			return "Ventes " + tax.label;
		},
		taxes_label: function(tax) {
			return "TVA collectée " + tax.label;
		},
		pm_label: function(pm) {
			return "Encaissements " + pm.label;
		},
		cust_label(cust) {
			return "Balance client " + cust.dispName;
		}
	}
});
