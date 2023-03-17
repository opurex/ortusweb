Tables and lists
================

The `vue-table` component is dedicated to showing lists or tables with column filtering and csv exporting.

Properties
----------

- `table`: the table definition (see below)
- `noexport` (boolean, default false): when true, export to csv is not available.
- `nofilter` (boolean, default false): when true, column filtering is not available.

Table definition
----------------

The `table` property holds most of the table definition.

- `reference` (optional but recommended): the table id used to store the default display. When two tables shares the same reference across the application, their settings are shared too.
- `title` (optional): the title to show above the table, in an h2.
- `columns` (array of column definitions): the columns definition (see below).
- `lines` (array of lines): the table data (see below).
- `footer` (line): the footer data, which has the same structure as a line.

Column definition
-----------------

Each column is defined by an object with the following properties:

- `reference` (string): column identifier.
- `label` (string): column header.
- `help` (string): the description of the column.
- `export` (optional boolean, default true): when false, the column is not exported to csv even when it is visible.
- `visible` (boolean) whether the column is displayed by default (true) or hidden (false).
- `searchable` (optional boolean, default false) whether this column is searched when visible.
- `export_as_number` (optional boolean, default false): when true, the number is reformatted when exported to avoid being considered a string by spreadsheet softwares.

Lines
-----

Each line is an array of values, in the same order as column definitions. They can hold a raw value or an object:

- `type` (`thumbnail`|`bool`|`html`): set special formatting of the value.
- `value`: the underlying value to transform.

`thumbnail` is given an url as value. It will be included in an `img` tag.

`bool` is converted to a checkbox.

`html` is included without escaping.