# VIEW/MATERIALIZED VIEW in RethinkDB

This is just a train of thoughts about how to reproduce the functionality of a SQL VIEW/MATERIALIZED VIEW in rethinkDB.


## Setup

You need **the following software**:
- RethinkDB (download it from http://rethinkdb.com). Install and start it (command is global, but remember to use a test data directory, something like `rethinkdb -d /data/rethinkdb_data/`). You can then connect to the web console at `http://localhost:8080/#`. You can query the db from the _Data Explorer_ tab.
- Node.js, and the rethinkdb package (install via npm) to run `test.js` (the example)

The **data model** is:
- One db `test1` with one table `sales`.
  You can add elements in it in the form:
  ```json
    {
        "desc" : "fourth sale in october",
        "date" : ISODate("2014-10-14T23:00:00.000Z")
    }
  ```
  by running
  ```javascript
	// execute only once
	r.dbCreate("test1")
	r.db("test1").tableCreate("sales")
	
	// execute many times to populate the table with entries with different dates
	r.db('test1').table("sales").insert({desc: "second sales in november", date: r.time(2014, 11, 6, '+08:00')})
  ```

## Presentation
The **"presentation"** (such a pretentious word) goes like that:

1. You can easily create the aggregation by querying in ReQL: `r.db('test1').table("sales").group([r.row("date").year(), r.row("date").month()]).count()`

2. However, there is no equivalent to the mongo `$out`, so your only option is query via a client and then re-insert the data in a new table

3. The option of monitoring for changes on a table is available also in rethinkDB. It is kind of more "official" than the mongoDB equivalent "hack" of tailing the oplog. It is called [change feeds](http://rethinkdb.com/docs/changefeeds/javascript)

4. You can create a cursor that is returning an object every time a specific table is updated. In the example below (also in `test.js`, I create a changefeed on the `sales` table:

	```javascript
	connect().then(function(conn){
		r.table('sales').changes().run(conn)
		.then(function(cursor){
			// do something with the cursor
		});
	});
	```

5. What you can do with the cursor is iterate on it using `forEach`.
	```javascript
	cursor.each(function(err, item){

	```
	the `item` object is as follows:
	```json
	{
		old_val: {...},
		new_val: {...}	
	}

	```

6. Outside of the db also here, like in mongoDB. However, a BIG BIG plus is that each change "notification" have access to the _old_ value of each object in addition to the _new_ one (in mongodb, there was no way to retrieve the old value of the row from the oplog, as it contains only the changes to apply).


Bedtime reading, if you like the topic:
- http://rethinkdb.com/docs/rethinkdb-vs-mongodb/
- http://rethinkdb.com/docs/comparison-tables/
