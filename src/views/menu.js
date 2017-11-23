var view_menu = `
<div class="navbar-header">
	<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-menu" aria-expanded="false">
	<span class="sr-only">Toggle menu</span>
	<span class="icon-bar"></span>
	<span class="icon-bar"></span>
	<span class="icon-bar"></span>
	</button>
	<a class="navbar-brand" href="?p=home">
		<img alt="Logo Pastèque" class="img-responsive img-thumbnail" src="templates/pasteque-bootstrap/img/logo.png">
	</a>
</div>
<div class="collapse navbar-collapse" id="main-menu">
	{{#sections}}
	<ul class="nav navbar-nav">
		<li class="dropdown">
			<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-extended="false">{{name}}</a>
		<ul class="dropdown-menu">
			{{#item}}
			<li><a href="./?{{target}}">{{name}}</a></li>
			{{/item}}
			</ul>
		</li>
	</ul>
	{{/sections}}
</div>`;


