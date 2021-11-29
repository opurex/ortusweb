Vue.component("vue-menu", {
	props: ["menu", "user"],
	data: function() {
		return {
			openedMenu: null,
		};
	},
	template: `<nav id="menu" class="navbar">
	<input type="checkbox" id="menu-collapser" aria-expanded="false" v-show="menu.visible">
	<label for="menu-collapser">Menu</label>
	<a class="navbar-brand" href="?p=home">
		<img alt="Logo Pastèque" class="img-responsive img-thumbnail" src="res/img/logo.png">
	</a>
	<ul id="main-menu" v-show="menu.visible">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == index)}" v-for="section, index in menu.sections">
			<button  v-on:click="expandMenu(index)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(index)">{{section.name}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == index">
				<li v-for="item in section.items"><template v-if="item.target"><a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a></template><template v-else><a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a></template></li>
			</ul>
		</li>
	</ul>
	<ul id="user-menu">
		<li class="dropdown" v-bind:class="{expanded: (openedMenu == menu.sections.length)}">
			<button  v-on:click="expandMenu(menu.sections.length)" aria-haspopup="true" v-bind:aria-expanded="isExpanded(menu.sections.length)">{{user}}</button>
			<ul class="dropdown-menu" v-if="openedMenu == menu.sections.length">
				<li v-for="item in menu.user"><template v-if="item.target"><a v-bind:style="item.icon" v-bind:href="item.target">{{item.name}}</a></template><template v-else><a v-bind:style="item.icon" v-on:click="item.action();return false;" href="#">{{item.name}}</a></template></li>
			</ul>
		</li>
	</ul>
</nav>
`,
	methods: {
		expandMenu: function(index) {
			if (this.openedMenu == index) {
				this.openedMenu = null;
			} else {
				this.openedMenu = index;
			}
		},
		isExpanded: function(index) {
			if (this.openedMenu == index) {
				return "true";
			} else {
				return "false";
			}
		}
	},
});

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
				{"target": _menu_getTargetUrl("discountprofiles"), "name": "Profils de remise", "icon": _menu_getIcon("menu_discountprofile.png")},
				{"target": _menu_getTargetUrl("producttags"), "name": "Étiquettes", "icon": _menu_getIcon("menu_producttags.png")},
			]},
			{"name": "Ventes",
			"items": [
				{"target": _menu_getTargetUrl("sales_z"), "name": "Tickets Z", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("sales_tickets"), "name": "Tickets", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesbyproduct"), "name": "Par produit", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesbycategory"), "name": "Par catégorie", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesbyprodandvat"), "name": "TVA par produit", "icon": _menu_getIcon(null)},
				{"target": _menu_getTargetUrl("salesdetails"), "name": "Détail", "icon": _menu_getIcon(null)},
			]},
			{"name": "Configuration",
			"items": [
				{"target": _menu_getTargetUrl("floors"), "name": "Plan de tables", "icon": _menu_getIcon("menu_floors.png")},
				{"target": _menu_getTargetUrl("cashregisters"), "name": "Caisses", "icon": _menu_getIcon("menu_cashregister.png")},
				{"target": _menu_getTargetUrl("paymentmodes"), "name": "Modes de paiement", "icon": _menu_getIcon("menu_paymentmode.png")},
				{"target": _menu_getTargetUrl("currencies"), "name": "Devises", "icon": _menu_getIcon("menu_currencies.png")},
				{"target": _menu_getTargetUrl("taxes"), "name": "TVA", "icon": _menu_getIcon("menu_tax.png")},
				{"target": _menu_getTargetUrl("users"), "name": "Utilisateurs", "icon": _menu_getIcon("menu_user.png")},
				{"target": _menu_getTargetUrl("roles"), "name": "Permissions", "icon": _menu_getIcon("menu_role.png")},
				{"target": _menu_getTargetUrl("resources"), "name": "Personnalisation", "icon": _menu_getIcon("menu_resources.png")},
			]},
		],
		"user": [
			{"target": _menu_getTargetUrl("preferences"), "name": "Préférences", "icon": _menu_getIcon("menu_preferences.png")},
			{"action": login_logout, "name": "Déconnexion", "icon": _menu_getIcon("menu_logout.png")},
		],
		"visible": true,
	}
}
