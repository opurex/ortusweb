Vue.component("vue-paymentmode-list", {
	props: ["data"],
	template: `<div>
<div class="box">
	<nav class="navbar navbar-default">
		<div class="navbar-form navbar-left">
			<a class="btn btn-add" href="?p=paymentmode">Ajouter un mode de paiement</a>
		</div>
	</nav>
	<div class="box-body">
		<table class="table table-bordered table-hover">
			<col />
			<col style="width:10%; min-width: 5em;" />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Désignation</th>
					<th>Ordre d'affichage</th>
					<th>Opération</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="pm in data.paymentModes">
					<td><img class="img img-thumbnail thumbnail pull-left" v-bind:src="imageSrc(pm)" />{{pm.label}}</td>
					<td>{{pm.dispOrder}}</td>
					<td><div class="btn-group pull-right" role="group"><a class="btn btn-edit" v-bind:href="editUrl(pm)">Edit</a></div></td>
				</tr>
			</tbody>
		</table>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(pm) {
			if (pm.hasImage) {
				return login_getHostUrl() + "/api/image/paymentmode/" + pm.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/paymentmode/default?Token=" + login_getToken();
			}
		},
		editUrl: function(pm) {
			return "?p=paymentmode&id=" + pm.id;
		},
	}
});

Vue.component("vue-paymentmode-form", {
	props: ["data"],
	template: `<div>
<div class="box">
	<div class="box-body">
		<h1>Édition d'un mode de paiement</h1>
		<form id="edit-paymentmode-form" onsubmit="javascript:paymentmodes_savePaymentMode(); return false;">
			<h2>Mode de paiement</h2>
			<dl class="dl-horizontal">
				<dt><label for="edit-label">Désignation</label></dt>
				<dd><input class="form-control" id="edit-label" type="text" v-model="data.paymentMode.label" required="true" /></dd>

				<dt><label for="edit-image">Image</label></dt>
				<dd>
					<img v-if="data.paymentMode.hasImage" id="paymentmode-image" class="img img-thumbnail" v-bind:src="imageSrc(data.paymentMode)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:paymentmodes_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</dd>

				<dt><label for="edit-reference">Référence</label></dt>
				<dd><input class="form-control" id="edit-reference" type="text" v-model="data.paymentMode.reference" required="true" /></dd>

				<dt><label for="edit-dispOrder">Ordre</label></dt>
				<dd><input class="form-control" id="edit-dispOrder" type="number" v-model.number="data.paymentMode.dispOrder"></dd>

				<dt>Type</dt>
				<dd><select v-model="data.paymentMode.type">
					<option value="0">Standard</option>
					<option value="1">Nécéssite l'assignation à un client enregistré</option>
					<option value="3">Enregistre une dette client</option>
					<option value="5">Utilise le solde pré-payé</option>
				</select></dd>
			</dl>

			<h2>Valeurs faciales</h2>
			<table class="table table-bordered table-hover">
				<thead>
					<tr><th></th><th>Valeur</th><th></th></tr>
				</thead>
				<tbody>
					<tr v-for="(value, index) in data.paymentMode.values">
						<td><img v-if="value.hasImage" v-bind:id="'value-image-' + index" class="img img-thumbnail" v-bind:src="imageValueSrc(data.paymentMode, value)" />
					<input v-bind:id="'edit-value-image-' + value.value" type="file" accept="image/*" />
					<a v-if="data.hadValueImage[value.value]" class="btn btn-del" v-on:click="toggleValueImage(value);return false;" >{{data.deleteValueImageButton[value.value]}}</a></td>
						<td><input type="number" v-model="value.value" step="0.01" /></td>
						<td><div class="btn-group pull-right" role="group"><button type="button" class="btn btn-delete" v-on:click="deleteValue(index)">X</button></div></td>
					</tr>
				</tbody>
				<tfoot>
					<tr><td colspan="3"><button class="btn btn-add" type="button" v-on:click="addValue">Ajouter une valeur</button></td></tr>
				</tfoot>
			</table>

			<h2>Rendus monnaie</h2>
			<table class="table table-bordered table-hover">
				<thead>
					<tr><th>Excédent min.</th><th>Mode de rendu</th><th></th></tr>
				</thead>
				<tbody>
					<tr v-for="(ret, index) in data.paymentMode.returns">
						<td><input type="number" v-model="ret.minAmount" step="0.01" /></td>
						<td><select v-model="ret.returnMode" required="true">
							<option disabled value="">Sélectionner</option>
							<option v-for="pm in data.paymentModes" :key="pm.id" v-bind:value="pm.id">{{pm.label}}</option>
						</select></td>
						<td><button type="button" class="btn btn-delete" v-on:click="deleteReturn(index)">X</button></td>
					</tr>
				</tbody>
				<tfoot>
					<tr><td colspan="3"><button class="btn btn-add" type="button" v-on:click="addReturn">Ajouter un rendu</button></td></tr>
				</tfoot>
			</table>
			<dl class="dl-horizontal">
			</dl>

			<div class="form-group">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
			</div>
			</form>
		</div>
	</div>
</div>
</div>`,
	methods: {
		imageSrc: function(pm) {
			return srvcall_imageUrl("paymentmode", pm);
		},
		imageValueSrc: function(pm, pmValue) {
			if (pmValue.hasImage) {
				return login_getHostUrl() + "/api/image/paymentmodevalue/" + pm.id + "-" + pmValue.value + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/paymentmodevalue/default?Token=" + login_getToken();
			}
		},
		toggleValueImage: function(value) {
			paymentmodes_toggleValueImage(value);
			return false;
		},
		addValue(event) {
			let val = PaymentModeValue_default(this.data.paymentMode);
			this.data.paymentMode.values.push(val);
		},
		addReturn(event) {
			let ret = PaymentModeReturn_default(this.data.paymentMode);
			this.data.paymentMode.returns.push(ret);
		},
		deleteValue: function(index) {
			paymentmodes_removeValue(index);
		},
		deleteReturn: function(index) {
			paymentmodes_removeReturn(index);
		},
	}
});
