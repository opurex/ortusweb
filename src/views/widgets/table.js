Vue.component("vue-table", {
	props: ["table", "noexport", "nofilter"],
	data: function () {
		return {
			showHelp: false,
			/** Index (int) or reference (string) as key, visible (boolean) as value. */
			defaultColumns: {},
			searchString: "",
			/** True when search is done and the results should be used. */
			useSearch: false,
			/** True when the search will be modified. */
			searchPending: false,
			/** List of line indexes matching the search input. */
			searchResults: [],
			linePerPage: 250,
			linePerPageDefault: 250,
			currentPage: 0,
		};
	},
	computed: {
		pageCount: function() {
			let lineCount = this.table.lines.length;
			if (this.useSearch) {
				lineCount = this.searchResults.length;
			}
			let pages = Math.floor(lineCount / this.linePerPage);
			if (lineCount % this.linePerPage > 0) {
				pages++;
			}
			if (pages > 0 && this.currentPage >= pages) {
				this.currentPage = pages - 1;
			}
			return pages;
		},
		searchable: function() {
			for (let column of this.table.columns) {
				if ("searchable" in column && column.searchable) {
					return true;
				}
			}
			return false;
		}
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
	<nav class="table-pagination">
		<div class="form-group">
			<label for="pageNum">Page</label>
			<button type="button" aria-label="Première page" title="Première page" v-on:click="movePage(-2)" v-bind:disabled="currentPage == 0">&lt;&lt;</button>
			<button type="button" aria-label="Page précédente" title="Page précédente" v-on:click="movePage(-1)" v-bind:disabled="currentPage == 0">&lt;</button>
			<select id="pageNum" v-model.number="currentPage" v-bind:disabled="pageCount == 1">
				<option v-for="i in pageCount" v-bind:value="i - 1">{{ i }}</option>
			</select>
			<button type="button" aria-label="Page suivante"  title="Page suivante" v-on:click="movePage(1)" v-bind:disabled="currentPage == pageCount - 1">&gt;</button>
			<button type="button" aria-label="Dernière page"  title="Dernière page" v-on:click="movePage(2)" v-bind:disabled="currentPage == pageCount - 1">&gt;&gt;</button>
		</div>
		<div class="form-group">
			<label for="pageSize">Nb par page</label>
			<select v-model.number="linePerPage" id="pageSize">
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="250">250</option>
				<option value="500">500</option>
				<option value="-1">Tout</option>
			</select>
		</div>
		<vue-input-text id="search" label="Rechercher" v-model="searchString" v-if="searchable" />
	</nav>
	<table class="table table-bordered table-hover" v-if="table.lines">
		<thead>
			<tr>
				<template v-for="(col, index) in table.columns">
				<th v-show="col.visible" v-bind:class="col.class">{{col.label}}</th>
				</template>
			</tr>
		</thead>
		<tbody>
			<template v-for="(line,index) in table.lines">
			<tr v-if="visibleLine(index)">
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
			</template>
		</tbody>
		<tfoot v-if="table.footer">
			<tr>
				<th v-for="(col, index) in table.footer" v-show="table.columns[index].visible" v-bind:class="table.columns[index].class">{{col}}</th>
			</tr>
		</tfoot>
	</table>
	<nav class="table-pagination">
		<div class="form-group">
			<label for="pageNum2">Page</label>
			<button type="button" aria-label="Première page" title="Première page" v-on:click="movePage(-2)" v-bind:disabled="currentPage == 0">&lt;&lt;</button>
			<button type="button" aria-label="Page précédente" title="Page précédente" v-on:click="movePage(-1)" v-bind:disabled="currentPage == 0">&lt;</button>
			<select id="pageNum2" v-model.number="currentPage" v-bind:disabled="pageCount == 1">
				<option v-for="i in pageCount" v-bind:value="i - 1">{{ i }}</option>
			</select>
			<button type="button" aria-label="Page suivante"  title="Page suivante" v-on:click="movePage(1)" v-bind:disabled="currentPage == pageCount - 1">&gt;</button>
			<button type="button" aria-label="Dernière page"  title="Dernière page" v-on:click="movePage(2)" v-bind:disabled="currentPage == pageCount - 1">&gt;&gt;</button>
		</div>
		<div class="form-group">
			<label for="pageSize2">Nb par page</label>
			<select v-model.number="linePerPage" id="pageSize2">
				<option value="50">50</option>
				<option value="100">100</option>
				<option value="250">250</option>
				<option value="500">500</option>
				<option value="-1">Tout</option>
			</select>
		</div>
	</nav>
</div>
`,
	methods: {
		exportCsv: function (withExcelBom) {
			// Get data, exclude hidden columns
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
						} else if (this.table.columns[j].export_as_number && this.table.columns[j].export_as_number !== false && typeof this.table.lines[i][j] !== "number") {
							csvData[i + 1].push(tools_stringToNumber(this.table.lines[i][j]));
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
			if (this.table.columns[i].export_as_number && this.table.columns[i].export_as_number !== false && typeof this.table.footer[i] !== "number") {
				line.push(tools_stringToNumber(this.table.footer[i]));
			} else {
							line.push(this.table.footer[i]);
			}
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
		exportCsvOther: function () {
			this.exportCsv(false);
		},
		exportCsvExcel: function () {
			this.exportCsv(true);
		},
		toggleHelp: function () {
			this.showHelp = !this.showHelp;
		},
		checkAllColumns: function () {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = true;
			}
		},
		uncheckAllColumns: function () {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = false;
			}
		},
		invertCheckedColumns: function () {
			for (let i = 0; i < this.table.columns.length; i++) {
				this.table.columns[i].visible = !this.table.columns[i].visible;
			}
		},
		loadDefaultColumns: function() {
			// Set defaultColumns from the table definition
			for (let i = 0; i < this.table.columns.length; i++) {
				let col = this.table.columns[i];
				if ("reference" in col) {
					this.defaultColumns[col.reference] = col.visible;
				} else {
					this.defaultColumns[i.toString()] = col.visible;
				}
			}
			// Read changes from option
			if (!this.table.reference) {
				this.restoreDefaultColumns();
				return;
			}
			let optNames = [
					Option_prefName(this.table.reference + ".defaults"),
					OPTION_PREFERENCES,
			];
			let thiss = this;
			storage_open(function (event) {
				storage_get("options", optNames, function (opts) {
					let columns = thiss.defaultColumns;
					let linePerPage = null;
					let tableOpt = opts[optNames[0]];
					let prefOpt = opts[optNames[1]];
					if (prefOpt != null) {
						let optVals = JSON.parse(prefOpt.content);
						if ("tablePageSize" in optVals) {
							linePerPage = optVals.tablePageSize;
							thiss.linePerPageDefault = linePerPage;
						}
					}
					if (tableOpt != null) {
						let optVals = JSON.parse(tableOpt.content);
						if ("columns" in optVals) {
							for (let key in optVals.columns) {
								if (key in thiss.defaultColumns) {
									thiss.defaultColumns[key] = optVals.columns[key];
								}
							}
						} else {
							// Legacy column format
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
						// Override general preferences
						if ("linePerPage" in optVals) {
							linePerPage = optVals.linePerPage;
						}
					}
					if (linePerPage != null) {
						thiss.linePerPage = linePerPage;
					}
					thiss.restoreDefaultColumns();
				});
			});
		},
		restoreDefaultColumns: function () {
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
		saveDefaultColumns: function () {
			// Read current column visibility and set local default
			let optName = Option_prefName(this.table.reference + ".defaults")
			let option = {"columns": {}};
			for (let i = 0; i < this.table.columns.length; i++) {
				let col = this.table.columns[i];
				if ('reference' in col) {
					option.columns[col.reference] = col.visible;
					this.defaultColumns[col.reference] = col.visible;
				} else {
					option.columns[i.toString()] = col.visible;
					this.defaultColumns[i.toString()] = col.visible;
				}
			}
			if (this.linePerPage != this.linePerPageDefault) {
				option.linePerPage = this.linePerPage;
			}
			// Save
			let opt = Option(optName, JSON.stringify(option));
			table_saveDefaultColumns(opt);
		},
		visibleLine: function(index) {
			if (this.linePerPage == -1 && !this.useSearch) {
				return true;
			}
			let start = this.currentPage * this.linePerPage;
			let stop = start + this.linePerPage
			if (!this.useSearch) {
				return index >= start && index < stop;
			} else {
				let searchIndex = this.searchResults.indexOf(index);
				if (searchIndex == -1) {
					return false;
				}
				return this.linePerPage == -1 || (searchIndex >= start && searchIndex < stop);
			}
		},
		movePage: function(delta) {
			switch (delta) {
				case -1:
					if (this.currentPage > 0) {
						this.currentPage -= 1;
					}
					break;
				case 1:
					if (this.currentPage < this.pageCount - 1) {
						this.currentPage += 1;
					}
					break;
				case -2:
					this.currentPage = 0;
					break;
				case 2:
					this.currentPage = this.pageCount - 1;
					break;
			}
		},
		runSearch: function() {
			this.searchResults = [];
			let lowVal = this.searchString.toLowerCase();
			for (let i = 0; i < this.table.lines.length; i++) {
				for (let j = 0; j < this.table.columns.length; j++) {
					let col = this.table.columns[j];
					if (col.visible && ("searchable" in col) && col.searchable) {
						if (this.table.lines[i][j].toLowerCase().includes(lowVal)) {
							this.searchResults.push(i);
							continue;
						}
					}
				}
			}
			this.searchPending = false;
			this.useSearch = true;
		}
	},
	watch: {
		searchString: function(value) {
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
			if (value == "") {
				this.useSearch = false;
				this.searchPending = false;
				return;
			}
			this.searchPending = true;
			let time = 1000;
			switch (value.length) {
				case 2:
					time = 600;
				case 3:
					time = 500;
				case 4:
					time = 400;
				default:
					time = 250;
			}
			this.searchTimer = setTimeout(() => {
				this.runSearch();
			}, time);
		},
		'table.columns': function(newValue, oldValue) {
			if (oldValue.length == 0) {
				// Initialization after search with dynamic columns
				this.loadDefaultColumns();
			}
		}
	},
	mounted: function () {
		this.loadDefaultColumns();
	}
});

