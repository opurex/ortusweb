Vue.component("vue-table", {
	props: ["table", "noexport", "nofilter"],
	data: function() {
		return {
			showHelp: false,
			/** Index (int) or reference (string) as key, visible (boolean) as value. */
			defaultColumns: {}
		};
	},
	template: `<div class="table">
	<div class="filters noprint" v-if="table.columns.length > 0 && (!nofilter || !noexport)">
		<h3>Afficher/masquer des colonnes</h3>
		<ul class="filter-actions">
			<li>
				<button type="button" class="btn btn-misc" v-on:click="toggleHelp">
					<template v-if="showHelp">
					<img src="res/img/column_descr_hide.png" alt="" style="height: 26px; padding-right: 5px;" />
					<span style="float: right; margin-top: 5px;">Cacher le descriptif des champs</span>
					</template>
					<template v-else>
					<img src="res/img/column_descr_show.png" alt="" style="height: 26px; padding-right: 5px;" />
					<span style="float: right; margin-top: 5px;">Afficher le descriptif des champs</span>
					</template>
				</button>
			</li>
			<li><button type="button" class="btn btn-misc" v-on:click="checkAllColumns">
			<img src="res/img/column_expand.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Afficher toutes les colonnes</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="uncheckAllColumns">
			<img src="res/img/column_collapse.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Masquer toutes les colonnes</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="invertCheckedColumns">Inverser les colonnes affichées</button></li>
		</ul>
		<ul class="filter-columns" v-if="!nofilter" v-bind:class="{'expand-help': showHelp}">
			<li v-for="(col, index) in table.columns">
				<input v-model="col.visible" v-bind:id="'filter-column-' + index" type="checkbox" />
				<label v-bind:for="'filter-column-' + index">{{col.label}}</label>
				<p class="help" v-if="showHelp">{{col.help}}</p>
			</li>
		</ul>
		<ul class="filter-defaults" v-if="table.reference">
			<li><button type="button" class="btn btn-misc" v-on:click="restoreDefaultColumns">
			<img src="res/img/column_restore_params.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Restaurer l'affichage par défaut</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="saveDefaultColumns">
			<img src="res/img/column_save_params.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Enregistrer comme affichage par défaut</span>
			</button></li>
		</ul>
		<div v-if="table.lines && !noexport">
			<a class="btn btn-add" v-on:click="exportCsvOther">Exporter le tableau</a>
			<a class="btn btn-add" v-on:click="exportCsvExcel">Exporter le tableau (Excel)</a>
		</div>
	</div>
	<h2 v-if="table.title">{{table.title}}</h2>
	<table class="table table-bordered table-hover" v-if="table.lines">
		<thead>
			<tr>
				<template v-for="(col, index) in table.columns">
				<th v-show="col.visible" v-bind:class="col.class">{{col.label}}</th>
				</template>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(line,index) in table.lines">
				<template v-for="(cell, index2) in line">
				<td v-show="table.columns[index2].visible" v-bind:class="table.columns[index2].class">
					<template v-if="cell.type == 'thumbnail'">
					<img class="img img-thumbnail thumbnail" v-bind:src="cell.src" />
					</template>
					<template v-else-if="cell.type == 'bool'">
					<input type="checkbox" disabled="1" v-bind:checked="cell.value" />
					</template>
					<template v-else-if="cell.type == 'html'"><span v-html="cell.value"></span></template>
					<template v-else>{{cell}}</template>
				</td>
				</template>
			</tr>
		</tbody>
		<tfoot v-if="table.footer">
			<tr>
				<th v-for="(col, index) in table.footer" v-show="table.columns[index].visible" v-bind:class="table.columns[index].class">{{col}}</th>
			</tr>
		</tfoot>
	</table>
</div>
`,
	methods: {
		exportCsv: function(withExcelBom) {
			// Get data, exlude hidden columns
			let csvData = [];
			csvData.push([]);
			for (let i = 0; i < this.table.columns.length; i++) {
				let col = this.table.columns[i];
				if (col.visible && col.export !== false) {
					csvData[0].push(col.label);
				}
			}
			for (let i = 0; i < this.table.lines.length; i++) {
				csvData.push([]);
				for (let j = 0; j < this.table.lines[i].length; j++) {
					if (this.table.columns[j].visible && this.table.columns[j].export !== false) {
						if (this.table.lines[i][j].type && this.table.lines[i][j].type == "bool") {
							csvData[i + 1].push(this.table.lines[i][j].value ? "1" : "0");
						} else {
							csvData[i + 1].push(this.table.lines[i][j]);
						}
					}
				}
			}
			if ("footer" in this.table) {
				let line = [];
				for (let i = 0; i < this.table.footer.length; i++) {
					if (this.table.columns[i].visible && this.table.columns[i].export !== false) {
						line.push(this.table.footer[i]);
					}
				}
				csvData.push(line);
			}
			// Generate csv (with some utf-8 tweak)
			let encodedData = new CSV(csvData).encode();
			encodedData = encodeURIComponent(encodedData).replace(/%([0-9A-F]{2})/g,
				function toSolidBytes(match, p1) {
					return String.fromCharCode('0x' + p1);
				});
			if (withExcelBom) {
				encodedData = String.fromCharCode(0xef, 0xbb, 0xbf) + encodedData;
			}
			// Set href for download
			let href = "data:text/csv;base64," + btoa(encodedData);
			window.open(href, "csvexport");
		},
		exportCsvOther: function() {
			this.exportCsv(false);
		},
		exportCsvExcel: function() {
			this.exportCsv(true);
		},
		toggleHelp: function() {
			this.showHelp = !this.showHelp;
		},
		checkAllColumns: function() {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = true;
			}
		},
		uncheckAllColumns: function() {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = false;
			}
		},
		invertCheckedColumns: function() {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = !this.table.columns[i].visible;
			}
		},
		restoreDefaultColumns: function() {
			for (let i = 0; i < this.table.columns.length; i++) {
				let col = this.table.columns[i];
				let key = i;
				if ("reference" in col) {
					key = col.reference;
				}
				if (key in this.defaultColumns) {
					col.visible = this.defaultColumns[key];
				}
			}
		},
		saveDefaultColumns: function() {
			// Read current column visibility and set local default
			let optName = Option_prefName(this.table.reference + ".defaults")
			let columns = {};
			for (let i = 0; i < this.table.columns.length; i++) {
				let col = this.table.columns[i];
				if ('reference' in col) {
					columns[col.reference] = {"visible": col.visible};
					this.defaultColumns[col.reference] = col.visible;
				} else {
					columns[i] = {"visible": col.visible};
					this.defaultColumns[i] = col.visible;
				}
			}
			// Save
			let opt = Option(optName, JSON.stringify(columns));
			table_saveDefaultColumns(opt);
		}
	},
	mounted: function() {
		// Set defaultColumns from the table definition
		for (let i = 0; i < this.table.columns.length; i++) {
			let col = this.table.columns[i];
			if ("reference" in col) {
				this.defaultColumns[col.reference] = col.visible;
			} else {
				this.defaultColumns[i] = col.visible;
			}
		}
		// Read changes from option
		if (!this.table.reference) {
			this.restoreDefaultColumns();
			return;
		}
		let optName = Option_prefName(this.table.reference + ".defaults")
		let thiss = this;
		storage_open(function(event) {
			storage_get("options", optName, function(opt) {
				let columns = thiss.defaultColumns;
				if (opt != null) {
					let optVals = JSON.parse(opt.content);
					for (let key in optVals) {
						let col = optVals[key];
						if (key in thiss.defaultColumns) {
							thiss.defaultColumns[key] = col.visible;
						} else {
							let index = parseInt(key);
							if (index != NaN) {
								thiss.defaultColumns[key] = col.visible;
							}
						}
					}
				}
				thiss.restoreDefaultColumns();
			});
		});
	}
});

