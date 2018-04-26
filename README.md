# mongodbs

This module allows your server to connect to multiple mongodb databases.<br>
For every database instance connected it will create facilities to access data with basic CRUD operations (see **Methods Facility** section [below](#facility)).

Current features are:

* create connection(s) using a JSON configuration file
* create data CRUD methods using a JSON configuration file
* put database instance(s) into the express request

Database instance(s) will be optionally available in req.dbs[dbName]

### Dependencies

* mongodb
* assert

### Configure

Install module in your server

```
npm install --save mongodbs
```

Create a /path/to/conf.json configuration file like the following.<br>

###### <a id="conf"></a>conf.json
```

[
  {
    "dbName": "myMongoDB",
    "dbHost": "localhost:27017/",
    "dbOptions": {
      poolSize: 10
    },
    "models": {
      "items": {
        "findOne": {
          "_id": "_id"
        },
        "find": {
          "name": "name",
          "category": "cat"
        },
        "updateOne": {
          "_id": "_id",
        },
        "update": {
          "name": "name"
        },
        "insert": {},
        "insertOne": {},
        "deleteOne": {
          "_id": "_id",
        },
        "delete": {
          "name": "name"
        }
      }
    }
  },
  ...
]
```
For a detailed explanation of conf params, please see the sections [Configuration details](#conf_det) and [Methods Facility](#facility) below.<br>
Have a look at the json.sample files, you'll find examples of valid configurations
* **mongo.json.sample**
* **mongo-replicaSet.json.sample**
* **mongo-shards.json.sample**

### Setup

Import in your server main file and initialize it

###### index.js
```
const express = require('express');
const mongo = require('mongodbs');
...

// you can set some options (see options.json.sample as reference)
const options = {
  ...
};
...

const app = express();
const mongodbs = await mongo(app, '/path/to/conf.json', options);
...


const port = 8080; // your port for this server
app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
```

or

```
const app = express();
mongo(app, '/path/to/conf.json', options)
.then(mongodbs => {  
  ...
  const port = 8080; // your port for this server
  app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
});
```

### Use

If you set options, and set addDbsToReq to true (_default_) then in your routes you'll have

###### myRoute.js
```
app.get('/', (req, res, next) => {
  const db = req.dbs.myMongoDB;
  const coll = db.collection('myCollection');

  // here you can perform mongodb CRUD operations as usual
});
```

If you want you can also use the response outware by adding it as the latest middleware of a route, and adding a `mongoResponse` object to the `res` express object

###### myController.js
```
const myController = (req, res, next) => {
  // do stuffs
  res.mongoResponse = {
    statusCode: 200,
    data: { ... }
  };
  next();
};
```

###### myRoute.js
```
const out = require('mongodbs').response;

app.get('/', myController, out);
```

The `out` middleware will send the response back to the client.

### <a id="conf_det"></a>Configuration details

Here is the list of valid configuration parameters:
* dbName (_String_) &ndash; the name of database you'll be connected to
* dbHost (_String_ or _Array_) &ndash; the host(s) your mongo instance is running on<br>
Notes:
 * a connection string must follow the rules of official mongodb (see [mongodb - URI Connection Settings](http://mongodb.github.io/node-mongodb-native/3.0/reference/connecting/connection-settings/) for details)
 * if you set an array of hosts, the **replicaSet** param must be set as well
* replicaSet (_String_) &ndash; the replicaSet name for your mongo connection
* dbOptions (_Object_) &ndash; the options for your mongo connection (see [mongodb - URI Connection Settings](http://mongodb.github.io/node-mongodb-native/3.0/reference/connecting/connection-settings/) for details)
* models (_Object_) &ndash; the configuration for methods facility (see next section for details)

### <a id="facility"></a>Methods Facility

The module takes your models settings from the _conf.json_ file.<br>
It examines the "models" entry for every database configuration and build access methods facility for you.

This is the reference of a "models" entry.

```
{
  "collection": {
    "method": {
      "name": "field"
    }
  }
}
```
where
* **collection** represents the collection in your DB you'll be querying with the created methods<br>
* **method** is one of the CRUD operations<br>
_Permitted values here are: **delete**, **deleteOne**, **find**, **findOne**, **insert**, **insertOne**, **update** and **updateOne**<br>(Each one does what you expect it does)_
* **name** is the value used for the method named
* **field** is the field name you would to query for in the collection

you'll find the generated methods like the following<br>
_dbs.databaseName.models.collection.methodName_

Note that:
* a method not permitted will be ignored
* the `method + name` formula will be camel-cased (_**findOne** + **_id** becomes **findOneById**_)
* any value for the **insert** method will be ignored (_current version_)

#### Example
Given the [conf.json](#conf) above you'll have these methods:
* findOneById
* findByName
* findByCategory
* updateOneById
* updateByName
* insert
* insertOne
* deleteOneById
* deleteByName

Note that:
* insert and insertOne methods differs for args they expect to receive<br>
insert expect ad array of multiple object, insertOne a single object.


For example in your app you can use these facilities by doing this
```
const out = require('mongodbs').response;

const myController = (req, res, next) => {
  try {
    const items = await req.dbs.myMongoDB.models.items.findByName(req.params.name);
    res.mongoResponse = {
      statusCode: items.length ? 200 : 204,
      data: items
    };
    next();
  } catch(e) {
    res.status(500).send(e);
  }
};

app.get('/items/:name', myController, out);
```

### Tests

By default the only enabled test is for the models methods facility.<br>
You can edit the `package.json` file to enable the tests for replicaSet and shards. In this case be sure your mongo servers are configured and running accordingly with **mongo-replicaSet.json.sample** and **mongo-shards.json.sample** files.

### Roadmap

* CRUD combined operations
* aggregations
* cursors facility

### Changelog

##### v1.1.0

* Add support for replicaSet
* Add support for sharding
* Add support for mongo connect options

##### v1.0.0

* Created facility methods to perform basic CRUD operations over the database.
* Added the `addDbsToReq` option to optionally add the database instances into the express request.
* Added tests of the facility methods created by the module.
* `connect` and `use` methods are now deprecated.

##### v0.5.0

* Added the possibility to use **mongodbs** by passing your `app` express and a json configuration file. This behaviour is the same as what you would obtain by the calls to `connect` an `use` in sequence (*v0.4*).
* Added response outware.
* `connect` and `use` methods are not deprecated yet.
