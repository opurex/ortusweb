Vue.component("vue-import-preview", {
   	props: {
		newTitle: {type: String},
		editTitle: {type: String},
		unchangedTitle: {type: String},
		modelDef: {type: Object},
		modelsLabel: {type: String},
		importResult: {type: Object, default: function() { return null; }},
		linkedRecords: {type: Object, default: function() { return {}; }},
		tableColumns: {type: Array},
		warnings: {type: Array, default: function() { return[]; }}
	},
	data: function() {
		return {
			showErrors: true,
			showWarnings: true,
			showUnchanged: false
		};
	},
	template: `<div class="because" v-if="importResult != null">
		<template v-if="importResult.warnings.length > 0 || importResult.unknownColumns.length > 0">
		<div class="text-flow">
			<h2>Alertes</h2>
			<div><button type="button" class="btn btn-add" v-on:click="showWarnings = !showWarnings"><template v-if="showWarnings">Masquer</template><template v-else>Montrer les {{warnCount}} alertes</template></button></div>
		</div>
		<table class="table table-bordered table-hover" v-show="showWarnings">
			<thead>
				<tr>
					<th>Ligne</th>
					<th>Information</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="importResult.unknownColumns.length > 0">
					<td>1</td>
					<td>Les colonnes suivantes ont été ignorées : <template v-for="col in importResult.unknownColumns">{{col}} </template></td>
				<tr>
				<tr v-for="warn in importResult.warnings">
					<td>{{warn.line}}</td>
					<td>{{warningMessage(warn)}}</td>
				</tr>
			</tbody>
		</table>
		</template>
		<template v-if="importResult.errors.length > 0">
		<div class="text-flow">
			<h2>Erreurs de lecture</h2>
			<div><button type="button" class="btn btn-add" v-on:click="showErrors = !showErrors"><template v-if="showErrors">Masquer</template><template v-else>Montrer les {{importResult.errors.length}} erreurs</template></button></div>
		</div>
		<table class="table table-bordered table-hover" v-show="showErrors">
			<thead>
				<tr>
					<th>Ligne</th>
					<th>Colonne</th>
					<th>Erreur</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="err in importResult.errors">
					<td>{{err.line}}</td>
					<td>{{errorColumn(err)}}</td>
					<td>{{errorMessage(err.exception)}}</td>
				</tr>
			</tbody>
		</table>
		</template>
		<template v-if="importResult.newRecords.length > 0">
		<h2>{{newTitle}}</h2>
		<vue-import-preview-table v-bind:records="importResult.newRecords" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="importResult.editedRecords.length > 0">
		<h2>{{editTitle}}</h2>
		<p>Les cases sur fond rouge indiquent les changements.</p>
		<vue-import-preview-table v-bind:records="importResult.editedRecords" v-bind:editedValues="importResult.editedValues" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="importResult.unchangedRecords.length > 0">
		<div class="text-flow">
			<h2>{{unchangedTitle}}</h2>
			<div><button type="button" class="btn btn-add" v-on:click="showUnchanged = !showUnchanged"><template v-if="showUnchanged">Masquer</template><template v-else>Montrer les {{importResult.unchangedRecords.length}} {{modelsLabel}}</template></button></div>
		</div>
		<vue-import-preview-table v-show="showUnchanged" v-bind:records="importResult.unchangedRecords" v-bind:linkedRecords="linkedRecords" v-bind:tableColumns="tableColumns" />
		</template>
		<template v-if="importResult.newRecords.length > 0 || importResult.editedRecords.length > 0">
		<div>
			<a class="btn btn-edit" v-on:click="save">Enregister les modifications</a>
		</div>
		</template>
</div>`,
    methods: {
	save: function() {
		this.$emit('save', null);
	},
	errorColumn: function(err) {
		if (err.column != null && err.column != "") {
			return err.column;
		}
		if ("field" in err.exception) {
			let fieldName = err.exception.field;
			if (this.modelDef != null) {
				if (fieldName in this.modelDef.fields) {
					if ("label" in this.modelDef.fields[fieldName]) {
						return this.modelDef.fields[fieldName].label;
					}
				}
			}
			return fieldName;
		}
		return "Inconnue";
	},
	errorMessage: function(exception) {
		if (exception instanceof InvalidFieldException) {
			switch (exception.constraint) {
				case InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND:
					return "La valeur \"" + exception.value + "\" n'a pas pu être retrouvée";
				case InvalidFieldConstraints.CSTR_NOT_NULL:
					return "Ne peut être vide";
				default:
					return "La valeur \"" + exception.value + "\" est incorrecte";
			}
		}
		if (exception instanceof MissingReferenceColumnException) {
			return "La colonne est manquante et nécessaire pour pouvoir effectuer l'import";
		}
		return exception.message;

	},
	warningMessage: function(warn) {
		if (warn.warning == "InsensitiveMatch") {
			return warn.message;
		}
	},
    },
    computed: {
	warnCount: function() {
		let count = this.importResult.warnings.length;
		if (this.importResult.unknownColumns.length > 0) {
			count++;
		}
		return count;
	}
    }
});

Vue.component("vue-import-preview-table", {
	props: ["title", "tableColumns", "records", "editedValues", "linkedRecords"],
	template: `<div class="because">
<h2 v-if="title">{{title}}</h2>
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
				case "number": return ((val === "" || val === null) ? "" : val.toLocaleString());
				case "number2": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
				case "number5": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5}));
				case "rate": return (val * 100).toLocaleString() + "%";
				case "scaleType": switch(val) {
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
