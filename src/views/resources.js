Vue.component("vue-resources-list", {
	props: ["data"],
	template: `<div class="resource-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>Customization</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<table>
			<col />
			<col style="width:10%; min-width: 5em;" />
			<thead>
				<tr>
					<th>Name</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="resource in data.resources">
					<td>{{resource.dispName}}</td>
					<td><nav><a class="btn btn-edit" v-bind:href="editUrl(resource)">Edit</a></nav></td>
				</tr>
				<tr>
					<td>Customer Contact Details</td>
					<td><nav><a class="btn btn-edit" href="?p=resource&label=option.customer.customFields">Edit</a></nav></td>
				</tr>
			</tbody>
		</table>
		<p>To allow your receipts to serve as invoices, the following information must be added in the header or footer of the receipt: (see <a href="https://www.service-public.fr/professionnels-entreprises/vosdroits/F31808" target="_blank">service-public.fr</a>)</p>
		<ul>
			<li>Company name and Siren or Siret number, RCS or RM registration number (if available), legal form and capital amount,</li>
			<li>Registered office address and establishment name,</li>
			<li>Also remember to assign a customer account for identification;</li>
		</ul>
	</article>
</section>
</div>`,
	methods: {
		editUrl: function(res) {
			return "?p=resource&label=" + res.label;
		},
	}
});

Vue.component("vue-resource-form", {
	props: ["data"],
	template: `<div class="resource-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=resources">Customization</a></li>
				<li><h1>{{data.resource.dispName}}</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-resource-form" class="form-tiny" onsubmit="javascript:resources_saveResource(); return false;">
			<div class="form-group">
				<label for="edit-reference" style="display:none">Value</label>
				<textarea v-if="data.resource.type == data.resTypes.Resource_TYPE_TEXT" style="font-family:monospace; width:auto !important" id="edit-textarea" v-bind:cols="data.resource.textWidth" rows="7" v-model="data.resource.content"></textarea>
				<template v-else>
					<img v-if="data.hasImage" id="resource-image" class="img img-thumbnail" v-bind:src="imageData(data.resource)" />
					<input id="edit-image" type="file" accept="image/*" />
					<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:resources_toggleImage();return false;">{{data.deleteContentButton}}</a>
				</template>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageData: function(res) {
			if (res.content != null) {
				return "data:;base64," + res.content;
			} else {
				return "";
			}
		}
	}
});

Vue.component("vue-customercontact", {
	props: ["data"],
	data: function() {
		return {
			fields: []
		};
	},
	template: `<div class="preferences">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=resources">Customization</a></li>
				<li><h1>Customer Account Contact Details</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-preferences-form" class="form-large" v-on:submit.prevent="save()">
			<p>Customize the labels of customer contact fields to reuse them for other purposes.</p>
			<div class="form-group" v-for="f in fields">
				<vue-input-text v-bind:id="f.label" v-bind:label="f.default" v-model="f.value" v-bind:placeholder="f.default"></vue-input-text>
			</div>

			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		save: function() {
			let customFields = {};
			this.fields.forEach(f => {
				if (f.value != "" && f.value != f.default) {
					customFields[f.label] = f.value;
				}
			});
			let newOption = new Option(OPTION_CUSTOMER_FIELDS, JSON.stringify(customFields));
			resources_saveCustomFields(newOption);
		}
	},
	mounted: function() {
		let thiss = this;
		this.data.contactFields.forEach(f => {
			thiss.fields.push(f);
		});
	},
});
