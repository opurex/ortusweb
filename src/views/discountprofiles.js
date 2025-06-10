Vue.component("vue-discountprofile-list", {
	props: ["data"],
	data: function() {
		return {
			dpTable: new Table().reference("discountProfile-list")
				.column(new TableCol().reference("label").label("Name").visible(true).searchable(true).help("The name of the discount profile as shown on the POS buttons."))
				.column(new TableCol().reference("rate").label("Discount").type(TABLECOL_TYPE.PERCENT).visible(true).help("The discount applied."))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false).visible(true))
		};
	},
	template: `
<div class="discountprofile-list">
	<section class="box box-medium">
		<header>
			<nav class="browser">
				<ul>
					<li><a href="?p=home">Home</a></li>
					<li><h1>Discount Profile List</h1></li>
				</ul>
			</nav>
			<nav class="navbar">
				<ul>
					<li><a class="btn btn-add" href="?p=discountprofile">Add a Discount Profile</a></li>
					<li><a class="btn btn-add" href="?p=discountprofileImport">Import a File</a></li>
				</ul>
			</nav>
		</header>
		<article class="box-body">
			<vue-table v-bind:table="dpTable"></vue-table>
		</article>
	</section>
</div> `,

methods: {
		editUrl: function(profile) {
			return "?p=discountprofile&id=" + profile.id;
		},
	},
	mounted: function() {
		let thiss = this;
		this.data.discountProfiles.forEach(function(dp) {
			let line = [
				dp.label, dp.rate,
				"<div class=\"btn-group pull-right\" role=\"group\"><a class=\"btn btn-edit\" href=\"" + thiss.editUrl(dp) + "\">Edit</a></div>"
			];
			thiss.dpTable.line(line);
		})
	},
});

Vue.component("vue-discountprofile-form", {
	props: ["data"],
	template: `<div class="discountprofile-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=discountprofiles">Discount Profile List</a></li>
				<li><h1>Edit a Discount Profile</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-discountprofile-form" class="form-large" onsubmit="javascript:discountprofile_saveProfile(); return false;">
			<vue-input-text label="Label" v-model="data.discountProfile.label" v-bind:required="true" id="edit-label" />
			<vue-input-rate label="Discount" v-model.number="data.discountProfile.rate" id="edit-rate" />
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`
});

Vue.component("vue-discountprofile-import", {
	props: ["data"],
	data: function() {
		return {
			csv: null,
			linkedRecords: { },
			importResult: null,
			tableColumns: [
				{field: "label", label: "Label"},
				{field: "rate", label: "Discount", type: "rate"},
			]
		};
	},
	template: `<div class="discountprofile-import">
<section class="box box-large">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=discountprofiles">Profile List</a></li>
				<li><h1>Edit Discount Profiles via CSV File</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li>
					<label for="csv-file">File</label>
					<input ref="csvRef" type="file" accept="text/csv" id="csv-file" name="csv" v-on:change="readCsv" />
				</li>
			</ul>
		</nav>
	</header>
	<div class="box-body">
		<vue-import-preview newTitle="New Profiles" editTitle="Modified Profiles" unchangedTitle="Unchanged Profiles" modelsLabel="profiles"
			v-bind:modelDef="data.modelDef"
			v-bind:importResult="importResult"
			v-bind:linkedRecords="linkedRecords"
			v-bind:tableColumns="tableColumns"
			v-on:save="saveChanges" />
	</div>
</section>
</div>`,
	methods: {
		readCsv: function (event) {
			let fileName = event.target.files[0].name;
			let thiss = this;
			let reader = new FileReader();
			let callback = function(data) {
				thiss.importResult = data;
			}
			reader.onload = function(readerEvent) {
				let fileContent = readerEvent.target.result;
				_discountprofiles_parseCsv(fileContent, callback);
			};
			reader.readAsText(event.target.files[0]);
		},
		saveChanges: function() {
			discountprofiles_saveDiscountProfiles();
		},
		reset: function() {
			this.csv = null;
			this.$refs.csvRef.value = "";
			this.importResult = null;
		},
	}
});
