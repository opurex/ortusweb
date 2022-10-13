Models and records
==================

A model is a name for a data structure and could be thought as a class name. A record is a set of values for a model, and could be thought as an instance.

Model definition
----------------

Models are defined with an object with the following properties:

- `modelName` (string): the name of the model.
- `modelId`(function(record)): the function that get the id of a record.
- `fields` (dictionary): the field definitions (properties) indexed by field name.
- `refField` (string): the name of the field that is used as reference, and acts as the id like within a csv file.
- `lookupFields` (array of string): the name of the fields to check when an other record links to this one. It can be for exemple `reference` and `label` to be able to link a record from its label in a csv file.

### Field definition

- `type`: `string`|`text`|`number`|`boolean`|`date`|`record`
- `default`: the default value. Not defining a default values makes the field required.
- `modelName`: for `type=record`, the `modelName` of the linked record.


RecordFactory
-------------

The record factory can manage records for a given model.

### new RecordFactory(modelDef)

Initialise a RecordFactory for the given model.

### create(values)

Create a new record by reading the given values and setting the other to the default.

`values` is a dictionary of field name as keys and field values as values. The values are automatically converted when necessary.

Errors are reported when they occurs, but they don't block the record to be created.

### hasErrors()

Check if `create` generated errors.

### getErrors()

Get the list of field names that produced an error.

### merge(record, values)

Merge values to an existing record. As for create, the values are automatically converted when necessary. The `record` is updated in place and the function doesn't return anything.

### hasChanges()

Check if `merge` changed the record.

### getChanges()

Get the list of field names that were changed.