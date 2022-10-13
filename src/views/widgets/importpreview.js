Vue.component("vue-import-preview", {
   	props: {
		newTitle: {type: String},
		editTitle: {type: String},
		untouchedTitle: {type: String},
		modelsLabel: {type: String},
		newRecords: {type: Array, default: function() { return[]; }},
		editedRecords: {type: Array, default: function() { return[]; }},
		editedValues: {type: Array, default: function() { return[]; }},
		untouchedRecords: {type: Array, default: function() { return[]; }},
		linkedRecords: {type: Object, default: function() { return {}; }},
		tableColumns: {type: Array},
		unknownColumns: {type: Array, default: function() { return[]; }},
		errors: {type: Array, default: function() { return[]; }}
	},
	data: function() {
		return {showUnchanged: false};
	},
	template: `<div class="because">
		<template v-if="newRecords.length > 0">
		<h2>{{newTitle}}</h2>
		<vue-import-preview-table v-bind:records="newRecords" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="editedRecords.length > 0">
		<h2>{{editTitle}}</h2>
		<p>Les cases sur fond rouge indiquent les changements.</p>
		<vue-import-preview-table v-bind:records="editedRecords" v-bind:editedValues="editedValues" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="untouchedRecords.length > 0">
		<h2>{{untouchedTitle}}</h2>
		<div><a class="btn btn-add" v-on:click="showUnchanged = !showUnchanged"><template v-if="showUnchanged">Masquer</template><template v-else>Montrer les {{untouchedRecords.length}} {{modelsLabel}}</template></a></div>
		<vue-import-preview-table v-show="showUnchanged" v-bind:records="untouchedRecords" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="unknownColumns.length > 0 || errors.length > 0">
		<h2>Erreurs de lecture</h2>
		<table class="table table-bordered table-hover">
			<thead>
				<tr>
					<th>Ligne</th>
					<th>Erreur</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="unknownColumns.length > 0">
					<td>1</td>
					<td>Les colonnes suivantes ont été ignorées : <template v-for="col in unknownColumns">{{col}} </template>.</td>
				<tr>
				<tr v-for="err in errors">
					<td>{{err.line}}</td>
					<td>{{errorMessage(err)}}</td>
				</tr>
			</tbody>
		</table>
		</template>
		<template v-if="newRecords.length > 0 || editedRecords.length > 0">
		<div>
			<a class="btn btn-edit" v-on:click="save">Enregister les modifications</a>
		</div>
		</template>
</div>`,
    methods: {
	save: function() {
		this.$emit('save', null);
	},
	errorMessage: function(err) {
		if (err.error == "RecordNotFound") {
			return err.column + " : la valeur \"" + err.value + "\" n'a pas pu être retrouvée";
		}
	}
    }
});

Vue.component("vue-import-preview-table", {
	props: ["title", "tableColumns", "records", "editedValues", "linkedRecords"],
	template: `<div class="because">
<h2>{{title}}</h2>
<table class="table table-bordered table-hover">
	<thead>
		<tr>
			<template v-for="(col, index) in tableColumns">
			<th v-bind:class="col.class">{{col.label}}</th>
			</template>
		</tr>
	</thead>
	<tbody>
		<tr v-for="(record, index) in records">
			<template v-for="col in tableColumns">
			<td v-bind:style="hasChanged(index, col.field)">{{fieldValue(record, col)}}</td>
			</template>
		</tr>
	</tbody>
</table>
</div>`,
	methods: {
		fieldValue: function(record, tableColumn) {
			if (!("type" in tableColumn)) {
				return record[tableColumn.field];
			}
			let val = record[tableColumn.field];
			switch (tableColumn.type) {
				case "boolean": return (val ? "Oui" : "Non");
				case "number": return (val === "" ? "" : val.toLocaleString());
				case "rate": return (val * 100).toLocaleString() + "%";
				case "scaleType": switch(type) {
					case 0: case "0": return "-"
					case 1: case "1": return "Poids"
					case 2: case "2": return "Litre"
					case 3: case "3": return "Heure"
				}
				case "date": return new PTDate(val).toString();
				case "record":
					if (val == null) {
						return "";
					}
					let modelName = tableColumn.modelName;
					if (!modelName in this.linkedRecords) {
						console.error("Model name " + modelName + " is not referenced in linkedRecords");
						return "?";
					}
					let linkId = record[tableColumn.field];
					let linkedRecord = this.linkedRecords[modelName].find(r => r.id == linkId);
					if (typeof linkedRecord == "undefined") {
						console.error(modelName + ":" + linkId + " not found in linkedRecords");
						return "?";
					}
					return linkedRecord.label;
				default:
					console.error("Unknown column type \"" + tableColumn.type + "\" for " + tableColumn.field);
					return "?";
			}
		},
		hasChanged: function(index, field) {
			if (this.editedValues && this.editedValues[index][field]) {
				return "font-weight:bold;background-color:#a36052;color:#fff";
			}
			return "";
		}
	},
});
