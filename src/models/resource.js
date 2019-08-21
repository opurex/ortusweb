const Resource_TYPE_TEXT = 0;
const Resource_TYPE_IMAGE = 1;
const Resource_TYPE_BIN = 2;

function Resource_default() {
	return {
		"label": "",
		"type": Resource_TYPE_TEXT,
		"content": null,
	};
}
