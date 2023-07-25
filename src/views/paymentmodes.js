Vue.component("vue-paymentmode-list", {
	props: ["data"],
	data: function() {
		return {
			paymentModesTable: new Table().reference("paymentmode-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false).visible(true).help("L'image du bouton du mode de paiement. Ce champ ne peut être exporté."))
				.column(new TableCol().reference("reference").label("Référence").visible(false).help("La référence doit être unique pour chaque mode de paiement."))
				.column(new TableCol().reference("label").label("Désignation").visible(true).help("Le nom du mode de paiement tel qu'affiché sur les boutons de la caisse."))
				.column(new TableCol().reference("visible").label("Actif").type(TABLECOL_TYPE.BOOL).visible(true).help("Si le mode de paiement peut être encaissé ou non."))
				.column(new TableCol().reference("roles").label("Rôles").visible(true).help("Les rôles autorisés à encaisser avec ce mode de paiement."))
				.column(new TableCol().reference("dispOrder").label("Ordre").type(TABLECOL_TYPE.NUMBER).visible(false).help("L'ordre d'affichage."))
				.column(new TableCol().reference("operation").label("Opération").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `<div class="paymentmode-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Accueil</a></li>
				<li><h1>Liste des modes de paiement</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=paymentmode">Ajouter un mode de paiement</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<p class="warning" v-if="data.cashWarning"><strong>Attention :</strong> Pour que les montants du fond de caisse à l'ouverture et à la clôture puisse fonctionner, le mode de paiements équivalent aux espèces doit avoir la référence <em>cash</em></p>
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
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + this.editUrl(pm) + "\">Modifier</a></div>",
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
				<li><a href="?p=home">Accueil</a></li>
				<li><a href="?p=paymentmodes">Liste des modes de paiement</a></li>
				<li><h1>Édition d'un mode de paiement</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-paymentmode-form" class="form-large" onsubmit="javascript:paymentmodes_savePaymentMode(); return false;">
			<fieldset>
				<legend>Mode de paiement</legend>
				<div class="form-group">
					<label for="edit-label">Désignation à l'encaissement</label>
					<input id="edit-label" type="text" v-model="data.paymentMode.label" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-backlabel">Désignation au rendu</label>
					<input id="edit-backlabel" type="text" v-model="data.paymentMode.backLabel" />
				</div>
				<div class="form-group">
					<label for="edit-image">Image</label>
					<img v-if="data.paymentMode.hasImage" id="paymentmode-image" class="img img-thumbnail" v-bind:src="imageSrc(data.paymentMode)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:paymentmodes_toggleImage();return false;" >{{data.deleteImageButton}}</a>
				</div>
				<div class="form-group">
					<label for="edit-reference">Référence</label>
					<input id="edit-reference" type="text" v-model="data.paymentMode.reference" required="true" />
				</div>
				<div class="form-group">
					<label for="edit-dispOrder">Ordre</label>
					<input id="edit-dispOrder" type="number" v-model.number="data.paymentMode.dispOrder">
				</div>
				<div class="form-group">
					<label for="edit-type">Type</label>
					<select id="edit-type" v-model="data.paymentMode.type">
						<option value="0">Standard</option>
						<option value="1">Nécéssite l'assignation à un client enregistré</option>
						<option value="3">Enregistre une dette client</option>
						<option value="5">Utilise le solde pré-payé</option>
					</select>
				</div>
				<div class="form-group">
					<input id="edit-visible" type="checkbox" name="visible" v-model="data.paymentMode.visible">
					<label for="edit-visible">Actif</label>
				</div>
			</fieldset>
			<fieldset>
				<legend>Valeurs faciales</legend>
				<table>
					<thead>
						<tr><th></th><th>Valeur</th><th></th></tr>
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
					<nav><button class="btn btn-add" type="button" v-on:click="addValue">Ajouter une valeur</button></nav>
				</div>
			</fieldset>
			<fieldset>
				<legend>Rendus monnaie</legend>
				<table>
					<thead>
						<tr><th>Excédent min.</th><th>Mode de rendu</th><th></th></tr>
					</thead>
					<tbody>
						<tr v-for="(ret, index) in data.paymentMode.returns">
							<td><input type="number" v-model="ret.minAmount" step="0.01" /></td>
							<td><select v-model="ret.returnMode" required="true">
								<option disabled value="">Sélectionner</option>
								<!-- if payment mode doesn't exist yet ... -->
								<option v-if="!data.paymentMode.id" v-bind:value.int="-1">{{currentModeLabel()}}</option>
								<option v-for="pm in data.paymentModes" :key="pm.id" v-bind:value="pm.id">{{pm.label}}</option>
							</select></td>
							<td><button type="button" class="btn btn-delete" v-on:click="deleteReturn(index)">X</button></td>
						</tr>
					</tbody>
				</table>
				<div class="form-control">
					<nav><button class="btn btn-add" type="button" v-on:click="addReturn">Ajouter un rendu</button></nav>
				</div>
			</fieldset>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Enregistrer</button>
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
				return "Même moyen de paiement";
			}
		}
	}
});
