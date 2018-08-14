Vue.component("vue-table", {
	props: ["table"],
	template: `
<div class="box">
	<div class="filters noprint">
		<ul class="filter-columns">
			<li v-for="(col, index) in table.columns">
				<input v-model="col.visible" v-bind:id="'filter-column-' + index" type="checkbox" />
				<label v-bind:for="'filter-column-' + index">{{col.label}}</label>
			</li>
		</ul>
	</div>
	<h2 v-if="table.title">{{table.title}}</h2>
	<table class="table table-bordered table-hover" v-if="table.lines">
		<thead>
			<tr>
				<template v-for="(col, index) in table.columns">
				<th v-show="col.visible">{{col.label}}</th>
				</template>
			</tr>
		</thead>
		<tbody>
			<tr v-for="(line,index) in table.lines">
				<template v-for="(cell, index2) in line">
				<td v-show="table.columns[index2].visible">{{cell}}</td>
				</template>
			</tr>
		</tbody>
	</table>
</div>
`});

