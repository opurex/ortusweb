Vue.component("vue-import-preview", {
	props: {
		newTitle: { type: String },
		editTitle: { type: String },
		unchangedTitle: { type: String },
		modelDef: { type: Object },
		modelsLabel: { type: String },
		importResult: { type: Object, default: function () { return null; } },
		linkedRecords: { type: Object, default: function () { return {}; } },
		tableColumns: { type: Array },
		warnings: { type: Array, default: function () { return []; } }
	},
	data: function () {
		return {
			showErrors: true,
			showWarnings: true,
			showUnchanged: false
		};
	},
	template: `<div class="because" v-if="importResult != null">
		<template v-if="importResult.warnings.length > 0 || importResult.unknownColumns.length > 0">
			<div class="text-flow">
				<h2>Alerts</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showWarnings = !showWarnings">
						<template v-if="showWarnings">Hide</template>
						<template v-else>Show the {{warnCount}} alerts</template>
					</button>
				</div>
			</div>
			<table class="table table-bordered table-hover" v-show="showWarnings">
				<thead>
					<tr>
						<th>Line</th>
						<th>Information</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="importResult.unknownColumns.length > 0">
						<td>1</td>
						<td>The following columns were ignored: 
							<template v-for="col in importResult.unknownColumns">{{col}} </template>
						</td>
					</tr>
					<tr v-for="warn in importResult.warnings">
						<td>{{warn.line}}</td>
						<td>{{warningMessage(warn)}}</td>
					</tr>
				</tbody>
			</table>
		</template>

		<template v-if="importResult.errors.length > 0">
			<div class="text-flow">
				<h2>Read Errors</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showErrors = !showErrors">
						<template v-if="showErrors">Hide</template>
						<template v-else>Show the {{importResult.errors.length}} errors</template>
					</button>
				</div>
			</div>
			<table class="table table-bordered table-hover" v-show="showErrors">
				<thead>
					<tr>
						<th>Line</th>
						<th>Column</th>
						<th>Error</th>
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
			<vue-import-preview-table 
				:records="importResult.newRecords" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.editedRecords.length > 0">
			<h2>{{editTitle}}</h2>
			<p>Cells with a red background indicate changes.</p>
			<vue-import-preview-table 
				:records="importResult.editedRecords" 
				:editedValues="importResult.editedValues" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.unchangedRecords.length > 0">
			<div class="text-flow">
				<h2>{{unchangedTitle}}</h2>
				<div>
					<button type="button" class="btn btn-add" v-on:click="showUnchanged = !showUnchanged">
						<template v-if="showUnchanged">Hide</template>
						<template v-else>Show the {{importResult.unchangedRecords.length}} {{modelsLabel}}</template>
					</button>
				</div>
			</div>
			<vue-import-preview-table 
				v-show="showUnchanged" 
				:records="importResult.unchangedRecords" 
				:linkedRecords="linkedRecords" 
				:tableColumns="tableColumns" 
			/>
		</template>

		<template v-if="importResult.newRecords.length > 0 || importResult.editedRecords.length > 0">
			<div>
				<a class="btn btn-edit" v-on:click="save">Save changes</a>
			</div>
		</template>
	</div>`,
	methods: {
		save: function () {
			this.$emit('save', null);
		},
		errorColumn: function (err) {
			if (err.column != null && err.column !== "") {
				return err.column;
			}
			if ("field" in err.exception) {
				let fieldName = err.exception.field;
				if (this.modelDef != null && fieldName in this.modelDef.fields) {
					if ("label" in this.modelDef.fields[fieldName]) {
						return this.modelDef.fields[fieldName].label;
					}
				}
				return fieldName;
			}
			return "Unknown";
		},
		errorMessage: function (exception) {
			if (exception instanceof InvalidFieldException) {
				switch (exception.constraint) {
					case InvalidFieldConstraints.CSTR_ASSOCIATION_NOT_FOUND:
						return `The value "${exception.value}" could not be found`;
					case InvalidFieldConstraints.CSTR_NOT_NULL:
						return "Cannot be empty";
					default:
						return `The value "${exception.value}" is incorrect`;
				}
			}
			if (exception instanceof MissingReferenceColumnException) {
				return "The column is missing and required to perform the import";
			}
			return exception.message;
		},
		warningMessage: function (warn) {
			if (warn.warning === "InsensitiveMatch") {
				return warn.message;
			}
		}
	},
	computed: {
		warnCount: function () {
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
						<th :class="col.class">{{col.label}}</th>
					</template>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(record, index) in records">
					<template v-for="col in tableColumns">
						<td :style="hasChanged(index, col.field)">{{fieldValue(record, col)}}</td>
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
				case "boolean": return (val ? "Yes" : "No");
				case "number": return ((val === "" || val === null) ? "" : val.toLocaleString());
				case "number2": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
				case "number5": return ((val === "" || val === null) ? "" : val.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 }));
				case "rate": return (val * 100).toLocaleString() + "%";
				case "scaleType":
					switch (val) {
						case 0: case "0": return "-";
						case 1: case "1": return "Weight";
						case 2: case "2": return "Liter";
						case 3: case "3": return "Hour";
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
