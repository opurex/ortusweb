Vue.component("vue-menu", {
	props: ["menu"],
	template: `<nav id="menu" class="navbar navbar-fixed-top navbar-inverse container-fluid"><div class="navbar-header">
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
	<ul class="nav navbar-nav">
		<li class="dropdown" v-for="section in menu.sections">
			<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-extended="false">{{section.name}}</a>
			<ul class="dropdown-menu">
				<li v-for="item in section.items"><a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a></li>
			</ul>
		</li>
	</ul>
</div></nav>
`});

// TODO: this section should be moved in the controller
function _menu_getTargetUrl(target) {
	return "?p=" + target;
}
function _menu_getIcon(icon) {
	// TODO: the default style should be in the CSS file
	let style = "background-repeat: no-repeat; background-position: 2px 50%; padding-left: 25px;";
	if (icon) {
		return style + " background-image:url('res/img/" + icon + "');";
	} else {
		return style + " background-image:url('res/img/menu_default.png');";
	}
}
function menu_init() {
	return {
		"sections": [
			{"name": "Catalogue",
			"items": [
				{"target": _menu_getTargetUrl("categories"), "name": "Categories", "icon": _menu_getIcon("menu_category.png")},
				{"target": _menu_getTargetUrl("products"), "name": "Produits", "icon": _menu_getIcon("menu_product.png")},
				{"target": _menu_getTargetUrl("tariffareas"), "name": "Zones tarifaires", "icon": _menu_getIcon("menu_tariffarea.png")},
				{"target": _menu_getTargetUrl("customers"), "name": "Clients", "icon": _menu_getIcon("menu_customer.png")},
			]},
			{"name": "Ventes",
			"items": [
				{"target": _menu_getTargetUrl("sales_z"), "name": "Tickets Z", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesbyproduct"), "name": "Par produit", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesdetails"), "name": "Détail", "icon": _menu_getIcon(null)},
			]},
			{"name": "Configuration",
			"items": [
				{"target": _menu_getTargetUrl("floors"), "name": "Plan de tables", "icon": _menu_getIcon("menu_floors.png")},
				{"target": _menu_getTargetUrl("cashregisters"), "name": "Caisses", "icon": _menu_getIcon("menu_cashregister.png")},
				{"target": _menu_getTargetUrl("paymentmodes"), "name": "Modes de paiement", "icon": _menu_getIcon("menu_paymentmode.png")},
				{"target": _menu_getTargetUrl("users"), "name": "Utilisateurs", "icon": _menu_getIcon("menu_user.png")},
				{"target": _menu_getTargetUrl("roles"), "name": "Permissions", "icon": _menu_getIcon("menu_role.png")},
				{"target": _menu_getTargetUrl("resources"), "name": "Personnalisation", "icon": _menu_getIcon("menu_resources.png")},
			]},
		]
	}
}
