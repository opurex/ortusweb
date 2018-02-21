var view_table = `
<div class="box">
<table class="table table-bordered table-hover">
<thead>
<tr>
	{{#headers}}
	<th>{{.}}</th>
	{{/headers}}
</tr>
</thead>
<tbody>
	{{#lines}}
	<tr>
		{{#.}}
		<td>{{.}}</td>
		{{/.}}
	</tr>
	{{/lines}}
</tbody>
</table>
</div>
`;

