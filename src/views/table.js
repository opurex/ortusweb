Vue.component("vue-table", {
	props: ["table"],
	template: `
<div class="box">
	<h2 v-if="table.title">{{table.title}}</h2>
	<table class="table table-bordered table-hover">
		<thead>
			<tr>
				<th v-for="header in table.headers">{{header}}</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="line in table.lines">
				<td v-for="cell in line">{{cell}}</td>
			</tr>
		</tbody>
	</table>
</div>
`});

