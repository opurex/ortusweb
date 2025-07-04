Vue.component("vue-user-list", {
	props: ["data"],
	data: function() {
		return {
			userTable: new Table().reference("user-list")
				.column(new TableCol().reference("image").label("Image").type(TABLECOL_TYPE.THUMBNAIL).exportable(false))
				.column(new TableCol().reference("name").label("Name"))
				.column(new TableCol().reference("role").label("Role"))
				.column(new TableCol().reference("card").label("Card"))
				.column(new TableCol().reference("operation").label("Operation").type(TABLECOL_TYPE.HTML).exportable(false))
		};
	},
	template: `<div class="user-list">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><h1>User List</h1></li>
			</ul>
		</nav>
		<nav class="navbar">
			<ul>
				<li><a class="btn btn-add" href="?p=user">Add a User</a></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<vue-table v-bind:table="userTable"></vue-table>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(user) {
			return srvcall_imageUrl("user", user);
		},
		editUrl: function(user) {
			return "?p=user&id=" + user.id;
		},
	},
	mounted: function() {
		this.data.users.forEach(u => {
			this.userTable.line([
				this.imageSrc(u), u.name, this.data.roles[u.role].name, u.card,
				`<nav><a class="btn btn-edit" href="${this.editUrl(u)}">Edit</a></nav>`
			]);
		});
	}
});

Vue.component("vue-user-form", {
	props: ["data"],
	data: function() { return {"passwordFieldType": "password"}; },
	template: `<div class="user-form">
<section class="box box-medium">
	<header>
		<nav class="browser">
			<ul>
				<li><a href="?p=home">Home</a></li>
				<li><a href="?p=users">User List</a></li>
				<li><h1>Edit a User</h1></li>
			</ul>
		</nav>
	</header>
	<article class="box-body">
		<form id="edit-category-form" class="form-large" onsubmit="javascript:user_saveUser(); return false;">
			<div class="form-group">
				<label for="edit-name">Name</label>
				<input id="edit-name" type="text" v-model="data.user.name" required="true" />
			</div>
			<div class="form-group">
				<label for="edit-image">Image</label>
				<img v-if="data.user.hasImage" id="user-image" class="img img-thumbnail" v-bind:src="imageSrc(data.user)" />
				<input id="edit-image" type="file" accept="image/*" />
				<a v-if="data.hadImage" class="btn btn-del" onclick="javascript:user_toggleImage();return false;" >{{data.deleteImageButton}}</a>
			</div>
			<div class="form-group">
				<label for="edit-role">Role</label>
				<select id="edit-role" v-model="data.user.role">
					<option disabled value="">Select</option>
					<option v-for="role in data.roles" :key="role.id" v-bind:value="role.id">{{role.name}}</option>
				</select>
			</div>
			<div class="form-group">
				<label for="edit-card">Card</label>
				<input id="edit-card" type="text" v-model="data.user.card" />
			</div>
			<div class="form-group" v-if="!data.user.id">
				<label for="edit-password">Password</label>
				<input id="edit-password" :type="passwordFieldType" v-model="data.user.password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Show/Hide</button>
			</div>
			<div class="form-group">
				<input class="form-control" id="edit-active" type="checkbox" v-model="data.user.active">
				<label for="edit-dispOrder">Active</label>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>

<section class="box box-tiny" v-if="data.user.id">
	<header>
		<h2>Reset Password</h2>
	</header>
	<article class="box-body">
		<form id="edit-reset-user-password" class="form-tiny" onsubmit="javascript:users_updatePassword(); return false;">
			<div class="form-group">
				<label for="edit-reset-password">New Password</label>
				<input :type="passwordFieldType" id="edit-reset-password" />
				<button class="btn" type="button" v-on:click="togglePasswordVisibility">Show/Hide</button>
			</div>
			<div class="form-control">
				<button class="btn btn-primary btn-send" type="submit">Save</button>
			</div>
		</form>
	</article>
</section>
</div>`,
	methods: {
		imageSrc: function(user) {
			if (user.hasImage) {
				return login_getHostUrl() + "/api/image/user/" + user.id + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/user/default?Token=" + login_getToken();
			}
		},
		togglePasswordVisibility() {
			this.passwordFieldType = (this.passwordFieldType === "password") ? "text" : "password";
			return false;
		},
	}
});
