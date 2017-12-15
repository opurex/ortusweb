var view_menu = `
<div class="navbar-header">
	<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#main-menu" aria-expanded="false">
	<span class="sr-only">Toggle menu</span>
	<span class="icon-bar"></span>
	<span class="icon-bar"></span>
	<span class="icon-bar"></span>
	</button>
	<a class="navbar-brand" href="?p=home">
		<img alt="Logo Pastèque" class="img-responsive img-thumbnail" src="res/img/logo.png">
	</a>
</div>
<div class="collapse navbar-collapse" id="main-menu">
	{{#sections}}
	<ul class="nav navbar-nav">
		<li class="dropdown">
			<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-extended="false">{{name}}</a>
		<ul class="dropdown-menu">
			{{#items}}
			<li><a style="background-image:url('res/img/{{#icon}}{{.}}{{/icon}}{{^icon}}menu_default.png{{/icon}}'); background-repeat: no-repeat; background-position: 2px 50%; padding-left: 25px;" href="?p={{target}}">{{name}}</a></li>
			{{/items}}
			</ul>
		</li>
	</ul>
	{{/sections}}
</div>`;

