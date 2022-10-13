Import from csv
===============

Importing data from csv files uses two classes: the `CsvParser` to convert a file to objects, and the `vue-import-preview` widget to display the changes. Sending data to the API and updating them locally is handled manually.

The CsvParser
-------------

`CvsParser` is defined in `src/csvparser.js`. Everything is defined within the constructor and it can convert the content of a csv file to objects.

It uses a `RecordFactory` to create and merge values from the partial data defined in the csv and the actual values of existing records or set the default values.

### new CsvParser(recordDef, mappingDef, existingRecords, linkedRecords)

`recordDef` is the model definition of what is imported. It is one of the structure defined in `src/model/` files.

`mappingDef` is an object with accepted headers as keys (column header) and field name as values (as defined in `recordDef`). Headers are case-insensitive. Multiple column headers can be bound to the same field to accept aliases. It shares values with vue-import-preview widget.

`existingRecords` is the list of already registered records, to detect new ones from edited ones. It is often the result of `storage_readStore`.

`linkedRecords` is the same kind as `existingRecords`, but for fields that links to other records. The value of those fields are the id of the linked record, so the list must be passed to check if the link is not broken and get a display value. It is an array of `{ "modelDef": def, "records": array of records}`, with the array of records often being the result of a `storage_readStore`.

### parseContent(content)

`content` is the csv content as string.

It returns an object with the following keys, that can be passed to a `vue-import-preview` widget:

- `newRecords`: the array of records to create.
- `editedRecords`: the array of edited records, with values already modified.
- `editedValues`: the array of edited field names for each record (array of arrays).
- `unchangedRecords`: the array of records that are present in the csv but are left untouched.
- `unknownColumns`: the array of column headers that could not be mapped and was ignored.
- `errors`: the array of errors that happened when reading the csv.

The errors can be a linked record being not found. An error object has the following attributes :

- `line`: the line number, starting from 1 (for the actual csv line 2, line 1 being headers).
- `field`: the modelDef field name.
- `column`: the column header.
- `error`: an error code ("RecordNotFound").
- `value`: the field value that caused the error.


The vue-import-preview widget
-----------------------------

The widget is defined in `src/views/widgets/importpreview.js`. It lists the changes returned by a `CsvParser`, and emits the `save` signal when confirmed (use `v-on:save="myfunction"` when using the widget). It has the following properties:

- `newTitle`: the title to show for new records.
- `editTitle`: the title to show for edited records.
- `untouchedTitle`: the title to show for unmodified records.
- `modelsLabel`: the model name to display on show/hide unmodified records button.
- `newRecords`: the new records, as returned by `CsvParser.parseContent`.
- `editedRecords`: the edited records, as returned by `CsvParser.parseContent`.
- `editedValues`: the edited values, as returned by `CsvParser.parseContent`.
- `untouchedRecords`: the unmodified records, as returned by `CsvParser.parseContent`.
- `linkedRecords`: the dictionary of linked records, with model name as key and array of records as value.
- `tableColumns`: the definition of each column to show.
- `unknownColumns`: the ignored columns, as returned by `CsvParser.parseContent`.
- `errors`: the list of errors, as returned by `CsvParser.parseContent`.


The full chain
--------------

Create a vue with a form with a file input, and a `vue-import-preview` widget. Add a function for `v-on:change` of the input, which reads the content of the input file:

```
let fileName = event.target.files[0].name;
let thiss = this;
let reader = new FileReader();
let callback = function(data) {
    // Data contains the result of a CsvParser.parseContent,
    // Update the vue-import-preview with this data.
}
reader.onload = function(readerEvent) {
    let fileContent = readerEvent.target.result;
    let data = function(fileContent, callback) {
        // Initialize a CsvParser here
        let parser = new CsvParser(...);
        let imported = parser.parse(fileContent);
        callback(imported);
    }
};
reader.readAsText(event.target.files[0]);
```

Add `v-on:save` on the `vue-import-preview` to send the new and modified records to the API and update the local cache.
