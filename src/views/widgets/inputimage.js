Vue.component("vue-input-image", {
	props: {
		id: {
			type: String,
			required: true,
		},
		label: {
			type: String,
			required: true,
		},
		modelName: {
			type: String,
			required: true,
		},
		modelId: {
			type: String,
		},
		hadImage: {
			type: Boolean,
			required: true,
		},
		value: { required: true },
	},
	data: function() {
		return {
			hasImage: this.hadImage,
			deleteImage: false,
			localValue: null,
			refreshImage: false,
			imgSrc: null,
		}
	},
	template:`<div class="form-group">
	<label v-bind:for="id">Image</label>
	<img v-if="hasImage" v-bind:src="imgSrc" />
	<input v-if="!deleteImage" v-bind:id="id" v-bind:value="localValue" v-on:change="fileChanged" type="file" accept="image/*" />
	<button type="button" v-if="hadImage" v-on:click="toggleImage" class="btn btn-del">{{deleteImageButton}}</button>
</div>
`,
	methods: {
		toggleImage: function() {
			if (this.hasImage) {
				this.hasImage = false;
				this.deleteImage = true;
				this.localValue = null;
				this.$emit('input', {'file': null, 'delete': true });
			} else {
				this.hasImage = true;
				this.deleteImage = false;
			}
		},
		fileChanged: function(event) {
			this.deleteImage = false;
			this.$emit('input', {'file': event.target.files[0], 'delete': this.deleteImage });
		},
		imageSrc: function() {
			if (this.hasImage && this.modelId) {
				return login_getHostUrl() + "/api/image/" + encodeURIComponent(this.modelName) + "/" + encodeURIComponent(this.modelId) + "?Token=" + login_getToken();
			} else {
				return login_getHostUrl() + "/api/image/" + encodeURIComponent(this.modelName) + "/default?Token=" + login_getToken();
			}
		}
	},
	mounted: function() {
		this.imgSrc = this.imageSrc();
	},
	computed: {
		deleteImageButton: {
			get: function() {
				return (this.hasImage ? "Supprimer" : "Restaurer");
			},
		}
	},
	watch: {
		hadImage: function(newVal, oldVal) {
			this.hasImage = newVal;
			this.refreshImage = true;
			this.deleteImage = false;
			this.localValue = null;
			this.imgSrc = this.imageSrc();
		},
		value: function(newVal, oldVal) {
			if (newVal == null) {
				// Force refresh
				this.imgSrc = null;
				this.imgSrc = this.imageSrc();
			}
		},
	}
});
