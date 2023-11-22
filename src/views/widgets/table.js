/** Type constants for column types. */
const TABLECOL_TYPE = {
	STRING: "string",
	/** Number without fixing precision. */
	NUMBER: "number",
	/** Number with fixed 2 decimals. */
	NUMBER2: "number2",
	/** Number with fixed 5 decimals. */
	NUMBER5: "number5",
	BOOL: "bool",
	/** Date without time. */
	DATE: "date",
	/** Date and time. */
	DATETIME: "datetime",
	/** Time without date. */
	TIME: "time",
	THUMBNAIL: "thumb",
	HTML: "html",

}

/**
 * Table definition for the vue-table component.
 */
class Table
{
	#mRef;
	#mTitle;
	#mColumns;
	#mLines;
	#mFooter;
	#mExportable;
	/** Reactive property for VueJS, do not manipulate it by hand. */
	ready;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuelines;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuecolumns;
	/** Reactive proxy for VueJS, do not manipulate it by hand. */
	vuefooter;

	/** Chainable empty constructor. */
	constructor() {
		this.#mRef = null;
		this.#mTitle = null;
		this.#mColumns = [];
		this.#mLines = [];
		this.#mFooter = [];
		this.#mExportable = true;
		this.ready = false;
		this.vuelines = this.#mLines;
		this.vuecolumns = this.#mColumns;
		this.vuefooter = this.#mFooter;
	}
	/**
         * getter/setter.
         * @param ref When defined, set the reference and return the instance for chaining.
         * When not set, get the reference.
         * @return `This` for the setter, reference for the getter.
         */
	reference(ref) {
		if (arguments.length == 0) {
			return this.#mRef;
		}
		this.#mRef = ref;
		return this;
	}
	/**
         * getter/setter.
         * @param t When defined, set the title and return the instance for chaining.
         * When not set, get the title.
         * @return `This` for the setter, title for the getter.
         */
	title(t) {
		if (arguments.length == 0) {
			return this.#mTitle;
		}
		this.#mTitle = t;
		return this;
	}
	/**
	 * getter/adder
	 * @param c The index of the column to get or a new column to add.
	 * When the column has no reference set, it sets the column index
	 * as reference.
	 * @return `This` when used to add a column, the column when used
	 * as a getter.
	 */
	column(c) {
		if (typeof c == "number") {
			return this.#mColumns[c];
		}
		if (c.reference() == null) {
			c.reference(this.#mColumns.length.toString());
		}
		this.#mColumns.push(c);
		return this;
	}
	/**
	 * Get all columns.
	 */
	columns() {
		return this.#mColumns;
	}
	/**
	 * Get the number of columns.
	 */
	columnLength() {
		return this.#mColumns.length;
	}
	/**
	 * getter/adder
	 * @param l The index of the line to get or a new line to add.
	 * Adding a line will the the table as ready.
	 * Use raw data when adding lines, the values will be formated
	 * according to the type of the column.
	 * @return `This` when used to add a line, the line when used
	 * as a getter.
	 */
	line(l) {
		if (typeof l == "number") {
			return this.#mLines[l];
		}
		this.#mLines.push(l);
		this.ready = true;
	}
	/**
	 * Indicate that the table is ready, without adding any line.
	 */
	noResult() {
		this.ready = true;
	}
	/**
	 * Get the number of lines.
	 */
	lineLength() {
		return this.#mLines.length;
	}
	/**
	 * Get all lines.
	 */
	lines() {
		return this.#mLines;
	}
	/** Sort lines in place */
	sort(sortFunction) {
		this.#mLines.sort(sortFunction);
	}
	/**
	 * Reset the table and optionaly set new content.
	 * Remove all lines and footer, keep the references.
	 * When used without argements, the table is not ready anymore.
	 * @param lines The new table content.
	 * @param footer The new table footer.
	 */
	resetContent(lines, footer) {
		this.#mLines.splice(0);
		this.#mFooter.splice(0);
		if (arguments.length == 0) {
			this.ready = false;
		} else {
			this.#mLines.push(...lines);
			if (arguments.length > 1) {
				this.#mFooter.push(...footer);
			}
			this.ready = true;
		}
	}
	/**
	 * getter/setter. Setter keeps the reference.
	 * @param f When defined, set the footer and return the instance for chaining.
         * When not set, get the footer.
	 * Use display values when setting the footer, they are not affected
	 * by the type of the column.
         * @return `This` for the setter, footer for the getter.
         */
	footer(f) {
		if (arguments.length == 0) {
			return this.#mFooter;
		}
		this.#mFooter.splice(0);
		this.#mFooter.push(...f);
		return this;
	}
	/**
         * getter/setter.
         * @param e When defined, set exportable and return the instance for chaining.
         * When not set, check if exportable.
         * @return `This` for the setter, exportable for the getter.
         */
	exportable(e) {
		if (arguments.length == 0) {
			return this.#mExportable;
		}
		this.#mExportable = e;
		return this;
	}
	/**
	 * Remove all lines, footer and columns, set ready to false.
	 * Use this to update the columns without breaking object reference
	 * and reactivity.
	 */
	reset() {
		this.ready = false;
		this.#mFooter.splice(0);
		this.#mLines.splice(0);
		this.#mColumns.splice(0);
	}
	/**
	 * Export the visible columns to a csv file.
	 * @param withExcelBom Whether to add Byte Order Mask for Excel or not.
	 * @return The csv content as a binary string.
	 */
	getCsv(withExcelBom) {
		let csvData = [];
		// Create the header
		csvData.push([]);
		for (let i = 0; i < this.columnLength(); i++) {
			let col = this.column(i);
			if (col.isVisible && col.exportable() !== false) {
				csvData[0].push(col.label());
			}
		}
		// Add lines
		for (let i = 0; i < this.lineLength(); i++) {
			csvData.push([]);
			let line = this.line(i);
			for (let j = 0; j < this.line(i).length; j++) {
				let col = this.column(j);
				if (col.isVisible && col.exportable()) {
					csvData[i + 1].push(col.formatCsv(line[j]));
				}
			}
		}
		if (this.footer().length > 0) {
			let line = [];
			for (let i = 0; i < this.footer().length; i++) {
				let col = this.column(i);
				if (col.isVisible && col.exportable()) {
					line.push(this.footer()[i]);
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
		return encodedData;
	}
}

/**
 * Table column definition for the vue-table component.
 */
class TableCol
{
	#mRef;
	#mLabel;
	#mHelp;
	#mType;
	#mClass;
	#mExportable;
	#mSearchable;
	#mVisible;
	/** Visibility status. As a read/write property for VueJS. */
	isVisible;

	/** Chainable empty constructor. */
	constructor() {
		this.#mRef = null;
		this.#mLabel = "";
		this.#mHelp = "";
		this.#mType = TABLECOL_TYPE.STRING;
		this.#mExportable = true;
		this.#mSearchable = false;
		this.#mVisible = true;
		this.#mClass = "";
		this.isVisible = true;
	}
	/**
         * getter/setter.
         * @param ref When defined, set the reference and return the instance for chaining.
         * When not set, get the reference.
         * @return `This` for the setter, reference for the getter.
         */
	reference(ref) {
		if (arguments.length == 0) {
			return this.#mRef;
		}
		this.#mRef = ref;
		return this;
	}
	/**
         * getter/setter.
         * @param lbl When defined, set the label and return the instance for chaining.
         * When not set, get the label.
         * @return `This` for the setter, label for the getter.
         */
	label(lbl) {
		if (arguments.length == 0) {
			return this.#mLabel;
		}
		this.#mLabel = lbl;
		return this;
	}
	/**
         * getter/setter.
         * @param h When defined, set the help text and return the instance for chaining.
         * When not set, get the help text.
         * @return `This` for the setter, help for the getter.
         */
	help(h) {
		if (arguments.length == 0) {
			return this.#mHelp;
		}
		this.#mHelp = h;
		return this;
	}
	/**
         * getter/setter.
         * @param t When defined, set the type and return the instance for chaining.
         * When not set, get the type. See TABLECOL_TYPE constants.
         * @return `This` for the setter, type for the getter.
         */
	type(t) {
		if (arguments.length == 0) {
			return this.#mType;
		}
		this.#mType = t;
		return this;
	}
	/**
         * getter/setter.
         * @param e When defined, set exportable and return the instance for chaining.
         * When not set, check if exportable.
         * @return `This` for the setter, exportable for the getter.
         */
	exportable(e) {
		if (arguments.length == 0) {
			return this.#mExportable;
		}
		this.#mExportable = e;
		return this;
	}
	/**
         * getter/setter.
         * @param s When defined, set searchable and return the instance for chaining.
         * When not set, check if searchable.
         * @return `This` for the setter, searchable for the getter.
         */
	searchable(s) {
		if (arguments.length == 0) {
			return this.#mSearchable;
		}
		this.#mSearchable = s;
		return this;
	}
	/**
         * getter/setter.
	 * For the actual visibility state, see `isVisible`.
         * @param v When defined, set the default visibility and return the instance for chaining.
         * When not set, get the default visibility.
         * @return `This` for the setter, default visibility for the getter.
         */
	visible(v) {
		if (arguments.length == 0) {
			return this.#mVisible;
		}
		this.#mVisible = v;
		this.isVisible = v;
		return this;
	}
	/**
         * getter/setter.
         * @param c When defined, set the css class and return the instance for chaining.
         * When not set, get the css class.
         * @return `This` for the setter, css class for the getter.
         */
	class(c) {
		if (arguments.length == 0) {
			return this.#mClass;
		}
		this.#mClass = c;
		return this;
	}
	/** Return true when type is NUMBER*. */
	isNumber() {
		return this.#mType == TABLECOL_TYPE.NUMBER
				|| this.#mType == TABLECOL_TYPE.NUMBER2
				|| this.#mType == TABLECOL_TYPE.NUMBER5;
	}
	isDateOrTime() {
		return this.#mType == TABLECOL_TYPE.DATE
				|| this.#mType == TABLECOL_TYPE.DATETIME
				|| this.#mType == TABLECOL_TYPE.TIME;
	}
	/** Format value for csv export. */
	formatCsv(value) {
		switch (this.#mType) {
			case TABLECOL_TYPE.BOOL:
				return value ? "1" : "0";
			case TABLECOL_TYPE.NUMBER:
				return tools_stringToNumber(value.toLocaleString());
			case TABLECOL_TYPE.NUMBER2:
				return tools_stringToNumber(value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}));
			case TABLECOL_TYPE.NUMBER5:
				return tools_stringToNumber(value.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5}));
			case TABLECOL_TYPE.PERCENT:
				return (value * 100).toLocaleString() + "%"
			case TABLECOL_TYPE.DATE:
				return tools_dateToString(value);
			case TABLECOL_TYPE.DATETIME:
				return tools_dateTimeToString(value);
			case TABLECOL_TYPE.TIME:
				return tools_timeToString(value);
			default:
				return value;
		}
	}
}

/** Custom preferences for Table */
class TablePrefs
{
	/** The default of the defaults. It could be a constant. */
	static linePerPageSystem = 250;
	/** The customized default. */
	static linePerPageSystemCustom = null;
	/** The table default. */
	#linePerPage;
	#columnVisibility;

	/** Empty constructor. */
	constructor() {
		this.linePerPage = null;
		this.#columnVisibility = new Map();
	}

	/**
	 * Import preferences from an object generated with export().
	 * @return `This` for chaining.
	 */
	import(object) {
		if (!"columns" in object) {
			this.legacyImport(object);
			return;
		}
		for (let key in object.columns) {
			this.setColumnVisibility(key, object.columns[key]);
		}
		if ("linePerPage" in object) {
			this.linePerPage = object.linePerPage;
		}
		return this;
	}

	/** Old column export format. */
	#legacyImport(object) {
		// Legacy column format
		for (let key in object) {
			let col = optVals[key];
			this.setColumnVisibility(key, col.visible);
		}
		return this;
	}

	/** Export the preferences to a jsonable object. */
	export() {
		let option = {"columns": {}};
		this.#columnVisibility.forEach((visible, ref) => {
			option.columns[ref] = visible;
		});
		if (this.linePerPage) {
			option.linePerPage = this.linePerPage;
		}
		return option;
	}

	setColumnVisibility(ref, visible) {
		this.#columnVisibility.set(ref, visible);
	}

	getColumnVisibility(ref) {
		return this.#columnVisibility.get(ref);
	}

	setLinePerPage(count) {
		this.linePerPage = count;
	}

	/**
	 * Get the preferred line per page count.
	 * @return Table preference if set, otherwise system custom default,
	 * otherwise system default.
	 */
	getLinePerPage() {
		if (this.linePerPage != null) {
			return this.linePerPage
		} else if (TablePrefs.linePerPageSystemCustom != null) {
			return TablePrefs.linePerPageSystemCustom;
		}
		return TablePrefs.linePerPageSystem;
	}

	/**
	 * Get the preferred default line per page count for all tables.
	 * @return System custom default if set, otherwise system default.
	 */
	static getSystemDefaultLinePerPage() {
		if (TablePrefs.linePerPageSystemCustom != null) {
			return TablePrefs.linePerPageSystemCustom;
		}
		return TablePrefs.linePerPageSystem;
	}
}

Vue.component("vue-table", {
	props: {
		table: {
			type: Table,
			required: true
		},
		exportable: {
			type: Boolean,
			default: true
		},
		filterable: {
			type: Boolean,
			default: true
		}
	},
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
			tablePrefs: new TablePrefs(),
			/** The actual line per page shown, reactive property. */
			linePerPage: TablePrefs.linePerPageSystem,
			/** 0-based page index. Displayed as currentPage + 1 */
			currentPage: 0,
			// Global
			"TABLECOL_TYPE": TABLECOL_TYPE,
			"tools_dateToString": tools_dateToString,
			"tools_dateTimeToString": tools_dateTimeToString,
			"tools_timeToString": tools_timeToString
		};
	},
	computed: {
		pageCount: function() {
			if (this.linePerPage == -1) {
				this.currentPage = 0;
				return 1;
			}
			let lineCount = this.table.lineLength();
			if (this.useSearch) {
				lineCount = this.searchResults.length;
			}
			if (lineCount == 0) {
				this.currentPage = 0;
				return 1;
			}
			let pages = Math.floor(lineCount / this.linePerPage);
			if (lineCount % this.linePerPage > 0) {
				pages++;
			}
			if (this.currentPage >= pages) {
				this.currentPage = pages - 1;
			}
			return pages;
		},
		searchable: function() {
			for (let column of this.table.columns()) {
				if (column.searchable()) {
					return true;
				}
			}
			return false;
		}
	},
		template: `<div class="table">
	<div class="filters noprint" v-if="table.vuecolumns.length > 0 && (filterable || exportable)">
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
		<ul class="filter-columns" v-if="filterable" v-bind:class="{'expand-help': showHelp}">
			<li v-for="(col, index) in table.vuecolumns">
				<input v-model="col.isVisible" v-bind:id="'filter-column-' + index" type="checkbox" />
				<label v-bind:for="'filter-column-' + index">{{col.label()}}</label>
				<p class="help" v-if="showHelp">{{col.help()}}</p>
			</li>
		</ul>
		<ul class="filter-defaults" v-if="table.reference()">
			<li><button type="button" class="btn btn-misc" v-on:click="restoreDefaultPreferences">
			<img src="res/img/column_restore_params.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Restaurer l'affichage par défaut</span>
			</button></li>
			<li><button type="button" class="btn btn-misc" v-on:click="savePreferences">
			<img src="res/img/column_save_params.png" alt="" style="height: 26px; padding-right: 5px;" />
			<span style="float: right; margin-top: 5px;">Enregistrer comme affichage par défaut</span>
			</button></li>
		</ul>
		<div v-if="table.ready && table.exportable()">
			<a class="btn btn-add" v-on:click="exportCsvOther">Exporter le tableau</a>
			<a class="btn btn-add" v-on:click="exportCsvExcel">Exporter le tableau (Excel)</a>
		</div>
	</div>
	<h2 v-if="table.title()">{{table.title()}}</h2>
	<nav class="table-pagination" v-if="table.ready">
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
	<table class="table table-bordered table-hover" v-if="table.ready">
		<thead>
			<tr>
				<template v-for="(col, index) in table.vuecolumns">
				<th v-show="col.isVisible" v-bind:class="col.class()">{{col.label()}}</th>
				</template>
			</tr>
		</thead>
		<tbody>
			<template v-for="(line,index) in table.vuelines">
			<tr v-if="visibleLine(index)">
				<template v-for="(value, colIndex) in line">
					<td v-if="table.vuecolumns[colIndex].isVisible" v-bind:class="[table.vuecolumns[colIndex].class(), {numeric: table.vuecolumns[colIndex].isNumber(), datetime: table.vuecolumns[colIndex].isDateOrTime()}]">
						<template v-if="value === undefined || value === null || value === ''"></template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.THUMBNAIL">
							<img class="img img-thumbnail thumbnail" v-bind:src="value" />
						</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.BOOL">
							<input type="checkbox" disabled="1" v-bind:checked="value" />
						</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.NUMBER5">{{ value == 0.0 ? value : value.toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 5}) }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.NUMBER2">{{ value == 0.0 ? value : value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.NUMBER">{{ value.toLocaleString() }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.PERCENT">{{ (value * 100).toLocaleString() + "%" }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.HTML"><span v-html="value"></span></template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.DATE">{{ tools_dateToString(value) }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.DATETIME">{{ tools_dateTimeToString(value) }}</template>
						<template v-else-if="table.vuecolumns[colIndex].type() == TABLECOL_TYPE.TIME">{{ tools_timeToString(value) }}</template>
						<template v-else>{{value}}</template>
					</td>

				</template>
			</tr>
			</template>
		</tbody>
		<tfoot v-if="table.vuefooter.length > 0">
			<tr>
				<th v-for="(val, index) in table.vuefooter" v-show="table.vuecolumns[index].isVisible" v-bind:class="table.vuecolumns[index].class()">{{val}}</th>
			</tr>
		</tfoot>
	</table>
	<nav class="table-pagination" v-if="table.ready">
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
		// CSV functions
		exportCsv: function (withExcelBom) {
			let csv = this.table.getCsv(withExcelBom);
			// Set href for download
			let href = "data:text/csv;base64," + btoa(csv);
			window.open(href, "csvexport");
		},
		exportCsvOther: function () {
			this.exportCsv(false);
		},
		exportCsvExcel: function () {
			this.exportCsv(true);
		},
		// Check column buttons functions
		toggleHelp: function () {
			this.showHelp = !this.showHelp;
		},
		checkAllColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = true;
			}
		},
		uncheckAllColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = false;
			}
		},
		invertCheckedColumns: function () {
			for (let i = 0; i < this.table.columnLength(); i++) {
				this.table.column(i).isVisible = !this.table.column(i).isVisible;
			}
		},
		// Preferences load/save functions
		loadPreferences: function() {
			let loadTablePrefs = true;
			if (!this.table.reference()) {
				loadTablePrefs = false;
			}
			let optNames = [];
			optNames.push(OPTION_PREFERENCES);
			if (loadTablePrefs) {
				optNames.push(Option_prefName(this.table.reference() + ".defaults"));
			};
			let thiss = this;
			storage_open(function (event) {
				storage_get("options", optNames, function (opts) {
					let prefOpt = opts[optNames[0]];
					if (prefOpt != null) {
						let optVals = JSON.parse(prefOpt.content);
						if ("tablePageSize" in optVals) {
							TablePrefs.linePerPageSystemCustom = optVals.tablePageSize;
						}
					}
					if (loadTablePrefs) {
						let tableOpt = opts[optNames[1]];
						if (tableOpt != null) {
							let optVals = JSON.parse(tableOpt.content);
							thiss.tablePrefs.import(optVals);
						}
					}
					thiss.linePerPage = thiss.tablePrefs.getLinePerPage();
					thiss.restoreDefaultPreferences();
				});
			});
		},
		savePreferences: function () {
			// Read current column visibility and set local default
			let optName = Option_prefName(this.table.reference() + ".defaults")
			let option = {"columns": {}};
			// Set current settings as the new default
			this.table.columns().forEach(col => {
				this.tablePrefs.setColumnVisibility(col.reference(), col.isVisible);
			});
			if (this.linePerPage != TablePrefs.getSystemDefaultLinePerPage()) {
				this.tablePrefs.setLinePerPage(this.linePerPage);
			} else {
				this.tablePrefs.setLinePerPage(null);
			}
			// Save
			let opt = Option(optName, JSON.stringify(this.tablePrefs.export()));
			table_saveDefaultColumns(opt);
		},
		// Visibility functions
		restoreDefaultPreferences: function () {
			this.table.columns().forEach(col => {
				let ref = col.reference();
				if (this.tablePrefs.getColumnVisibility(ref) != null) {
					col.isVisible = this.tablePrefs.getColumnVisibility(ref);
				} else {
					col.isVisible = col.visible();
				}
			});
			this.linePerPage = this.tablePrefs.getLinePerPage();
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
		// Pagination
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
		// Search
		runSearch: function() {
			this.searchResults = [];
			let lowVal = this.searchString.toLowerCase();
			for (let i = 0; i < this.table.lineLength(); i++) {
				for (let j = 0; j < this.table.columnLength(); j++) {
					let col = this.table.column(j);
					if (col.visible && (col.searchable())) {
						if (this.table.line(i)[j].toLowerCase().includes(lowVal)) {
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
		}
	},
	mounted: function () {
		this.loadPreferences();
	}
});
