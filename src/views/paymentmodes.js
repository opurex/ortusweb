Vue.component("vue-paymentmode-list", {
	props: ["data"],
	data: function() {
		return {
			paymentModesTable: new Table().reference("paymentmode-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("The image for the payment mode button. This field cannot be exported."))
				.column(new TableCol().reference("reference").label("Reference").visible(false).help("The reference must be unique for each payment mode."))
				.column(new TableCol().reference("label").label("Name").visible(true).help("The name of the payment mode as shown on the register buttons."))
				.column(new TableCol().reference("visible").label("Active").type(TABLECOL_TYPE.BOOL).visible(true).help("Whether the payment mode can be used for payments."))
				.column(new TableCol().reference("roles").label("Roles").visible(true).help("Roles allowed to use this payment mode."))
				.column(new TableCol().reference("dispOrder").label("Order").type(TABLECOL_TYPE.NUMBER).visible(false).help("Display order."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="paymentmode-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Payment Modes List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=paymentmode">Add a payment mode</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<p class="warning" v-if="data.cashWarning"><strong>Warning:</strong> For the cash drawer opening/closing amounts to work, the payment mode for cash must have the reference <em>cash</em></p>
		<vue-table v-bind:table="paymentModesTable"></vue-table>
	</article>
</section>
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
	},
	mounted: function() {
		let thiss = this;
		this.data.paymentModes.forEach(pm => {
			let line = [
				thiss.imageSrc(pm),
				pm.reference, pm.label,
				pm.visible,
				pm.roles.join(", "), pm.dispOrder,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(pm) + "\">Edit</a></div>",
			];
			this.paymentModesTable.line(line);
		});
	},
});

Vue.component("vue-paymentmode-form", {
	props: ["data"],
	template: `<div class="paymentmode-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=paymentmodes">Payment Modes List</a></li>
				<li><h1>Edit a Payment Mode</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-paymentmode-form" class="form-large" onsubmit="javascript:paymentmodes_savePaymentMode(); return false;">
			<fieldset>
				<legend>Payment Mode</legend>
				<div class="form-group">
					<label for="edit-label">Label for payment</label>
					<input id="edit-label" type="text" v-model="data.paymentMode.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-backlabel">Label for return</label>
					<input id="edit-backlabel" type="text" v-model="data.paymentMode.backLabel" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.paymentMode.hasImage" id="paymentmode-image" class="img img-thumbnail" v-bind:src="imageSrc(data.paymentMode)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:paymentmodes_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</div>
				<div class="form-group">
					<label for="edit-reference">Reference</label>
					<input id="edit-reference" type="text" v-model="data.paymentMode.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Order</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.paymentMode.dispOrder">
				</div>
				<div class="form-group">
					<label for="edit-type">Type</label>
					<select id="edit-type" v-model="data.paymentMode.type">
						<option value="0">Standard</option>
						<option value="1">Requires assignment to a registered customer</option>
						<option value="3">Registers a customer debt</option>
						<option value="5">Uses pre-paid balance</option>
					</select>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="visible" v-model="data.paymentMode.visible">
					<label for="edit-visible">Active</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Denominations</legend>
				<table>
					<thead>
						<tr><th></th><th>Value</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="(value, index) in data.paymentMode.values">
							<td>
								<img v-if="value.hasImage" v-bind:id="'value-image-' + index" class="thumbnail thumbnail-text" v-bind:src="imageValueSrc(data.paymentMode, value)" />
								<input v-bind:id="'edit-value-image-' + value.value" type="file" accept="image/*" />
								<a v-if="data.hadValueImage[value.value]" class="btn btn-del" v-on:click="toggleValueImage(value);return false;" >{{data.deleteValueImageButton[value.value]}}</a>
							</td>
							<td><input type="number" v-model="value.value" step="0.01" /></td>
							<td><button type="button" class="btn btn-delete" v-on:click="deleteValue(index)">X</button></td>
						</tr>
					</tbody>
				</table>
				<div class="form-control">
					<nav><button class="btn btn-add" type="button" v-on:click="addValue">Add a value</button></nav>
				</div>
			</fieldset>
			<fieldset>
				<legend>Change Returns</legend>
				<table>
					<thead>
						<tr><th>Min. excess</th><th>Return mode</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="(ret, index) in data.paymentMode.returns">
							<td><input type="number" v-model="ret.minAmount" step="0.01" /></td>
							<td><select v-model="ret.returnMode" required="true">
								<option disabled value="">Select</option>
								<!-- if payment mode doesn't exist yet -->
								<option v-if="!data.paymentMode.id" v-bind:value.int="-1">{{currentModeLabel()}}</option>
								<option v-for="pm in data.paymentModes" :key="pm.id" v-bind:value="pm.id">{{pm.label}}</option>
							</select></td>
							<td><button type="button" class="btn btn-delete" v-on:click="deleteReturn(index)">X</button></td>
						</tr>
					</tbody>
				</table>
				<div class="form-control">
					<nav><button class="btn btn-add" type="button" v-on:click="addReturn">Add a return</button></nav>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
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
		currentModeLabel: function() {
			if (this.data.paymentMode.label) {
				return this.data.paymentMode.label;
			} else {
				return "Same payment mode";
			}
		}
	}
});
