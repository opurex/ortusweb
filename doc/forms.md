Forms
=====

Forms can be created from typed widgets to uniform the look and behavior of fields.




Form fields
-----------

### vue-catalog-picker

A catalog to select products from.

- `categories` (array): the categories to show. The products are read from the local storage.
- `prdPickCallback` (function(product)): the function called when a product is picked.
- `excludeCompositions` (optional boolean, default false): when true, composition are not listed.

### vue-input-checkbox

For boolean inputs.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `value` (v-model): the value the field will be bound to with v-model.

### vue-input-date

A date input that converts its value to a `YYYY-MM-DD` string.

- `value` (v-model): the value the field will be bound to with v-model.

### vue-input-image

An image upload with thumbnail and reset button.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `modelName` (string): the name of the model the image is used for.
- `modelId` (string): the id of the record the image is used for.
- `hadImage` (boolean): whether the record already has an image when the form is initialized.
- `value` (v-model): the value the field will be bound to with v-model. The actual value is an object with `file` containing the new image file when replaced and `delete` which is true when the image should be deleted.

### vue-input-number

For integer or floating point values.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `value` (v-model): the value the field will be bound to with v-model.
- `required` (optional boolean, default false): if the field is required.
- `step` (optional number, default 1): the increment step.
- `min` (optional number, default null): the minimum value when not null.
- `max` (optional number, default null): the maximum value when not null.

### vue-input-text

For single line text inputs.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `value` (v-model): the value the field will be bound to with v-model.
- `required` (optional boolean, default false): if the field is required.

### vue-input-rate

For rate inputs displayed as percents.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `value` (v-model): the value the field will be bound to with v-model. The actual value is a rate, ranging from 0.0 to 1.0.
- `required` (optional boolean, default false): if the field is required.

### vue-input-textarea

For multi-line text inputs.

- `id` (string): the html id to link the label to the field.
- `label` (string): the label for the input.
- `value` (v-model): the value the field will be bound to with v-model.
- `required` (optional boolean, default false): if the field is required.
