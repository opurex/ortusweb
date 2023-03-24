Local cache reading and writing
===============================

JSAdmin works with a local cache to speed up things once the cache is set. The data are stored in an IndexedDB. Database access helpers are set in `storage.js`, that allows to make synchronous calls.

Initializing the database
-------------------------

The initialization and upgrades are done automatically when opening the database first. Upgrade are done by dropping the database and installing the newer version.

- `_storage_install` initializes the database. It is called automatically from `storage_open` when required.
- `storage_drop` destroys the database.

Database access
---------------

The connection to the database is initialized with `storage_open`, which accepts two callbacks for success and error events. You should call `storage_close` within each callbacks to cleanly close the connection when not used.

The connection handler is stored in a global variable so you don't need to handle it within the callbacks. Otherwise the low level event is passed to the callback.

### storage_open(success, error)

Asynchronously open a connection to the database. `storage_close` should be called within the `success` callback.

- `success` (function(event)): the function called when the connection is opened, with the connection event as parameter. As the handler is automatically handled, it can be ignored as long as there are no parallel accesses.
- `error` (function(event)): the function called when the connection could not be opened, with the error event as parameter.

### storage_close()

Close the database connection. It closes the connection from the global handle automatically set from `storage_open`.

Reading data
------------

Reading data can be done with three functions: `storage_readStore`, `storage_readStores`, `storage_get` and `storage_getIndex`. Each of these must be called within the `storage_open` success callback so you don't need to bother with the connection handler.

### storage_readStore(storeName, callback, errorCallback)

Get all records from a table.

- `storeName` (string): the table/model name to read.
- `callback` (function(records)): the function called on success, with the array of objects as parameter.
- `errorCallback` (function(event)): the function called on error, with the error event as parameter.

### storage_readStores(storeNames, callback, errorCallback)

Does the same as `storage_readStore`, but reads from multiple tables at once.

- `storeNames` (array of strings): the tables/models to read.
- `callback` (function(dictionary of `storeName`: `array of objects`)): the function called on success, with a dictionary holding the array of objects indexed by the store name.
- `errorCallback` (function(event)): the function called on error, with the error event as parameter.

###  storage_get(storeName, id, callback, errorCallback)

Read a single or multiple record from the database by id.

- `storeName` (string): the table/model name to read.
- `id` (mixed): the record id to find, or an array of ids.
- `callback` (function(object)): the function called on success, with the record as parameter. When multiple records are read, data is an object with the record id as key and the record as value. When no record is found, the value is `undefined`
- `errorCallback` (function(event)): the function called on error.

###  storage_getIndex(storeName, index, val, callback, errorCallback)

Search for a specific record from an indexed field, which is assumed to be unique. It can also be used to look for multiple records from multiple values.

- `storeName` (string): the table/model name to read.
- `index` (string): the indexed field name.
- `value` (mixed): the indexed field value to look for. When a single value, a single record is passed to the callback or null when no record is found. When an array of values, multiple records are searched, one for each value.
- `callback` (function(object)): the function called on success, with the record or array of records (when using an array for `value`) as parameter.
- `errorCallback` (function(event)): the function called on error.


Writing data
------------

###  storage_sync(syncData, progress, error, complete)

Refreshes the database. The previous records are dropped.

- `syncData` contains all the records, indexed by store name.
- `progress` (function(model, i, event)): the function called when records are written. `model` holds the store name, `i` is the store index (up to `SYNC_MODELS.length - 1`) or `delete` when the store is first cleared, `event` holds the database event.
- `error` (function(event)): the function called when an error happens.
- `complete` (function(event)): the function called when the last request is done, with the database event as parameter.

###  storage_write(storeName, record, successCallback, errorCallback)

Write a single or multiple records. Multiple records are written within a transaction.

- `storeName` (string): the table/model name to write.
- `record` (record or array of records): the object(s) to write.
- `successCallback` (function(record)): the function called on success, with the written record(s).
- `errorCallback` (function(event)): the function called on error, with the error event as parameter.

Deleting data
-------------

### storage_delete(storeName, id, successCallback, errorCallback)

Drop records.

- `storeName` (string): the table/model name to read.
- `id` (mixed): the record id to delete or array of record ids.
- `callback` (function(object)): the function called on success.
- `errorCallback` (function(event)): the function called on error.
