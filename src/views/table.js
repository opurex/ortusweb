Vue.component("vue-table", {
	props: ["table", "noexport", "nofilter"],
	template: `<div class="table">
	<div class="filters noprint" v-if="!nofilter && !noexport">
		<p v-if="!nofilter">Afficher/masquer des colonnes</p>
		<ul class="filter-columns" v-if="!nofilter">
			<li v-for="(col, index) in table.columns">
				<input v-model="col.visible" v-bind:id="'filter-column-' + index" type="checkbox" />
				<label v-bind:for="'filter-column-' + index">{{col.label}}</label>
			</li>
		</ul>
		<div v-if="table.lines && !noexport">
			<a class="btn btn-add" v-on:click="exportCsvOther">Exporter les résultats</a>
			<a class="btn btn-add" v-on:click="exportCsvExcel">Exporter les résultats (Excel)</a>
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
					if (this.table.columns[i].visible) {
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
		}
	}});

