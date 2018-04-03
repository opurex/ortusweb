var view_table = `
<div class="box">
{{#title}}<h2>{{.}}</h2>{{/title}}
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

