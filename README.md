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
(_conf.json.sample in the source repo is an example of this_)

###### <a id="conf"></a>conf.json
```

[
  {
    "dbName": "myMongoDB",
    "dbUrl": "localhost:27017/",
    "models": {
      "items": {
        "findOne": {
          "_id": "_id"
        },
        "find": {
          "name": "name",
          "category": "cat"
        },
        "update": {
          "_id": "_id",
          "name": "name"
        },
        "insert": {},
        "delete": {
          "_id": "_id",
          "name": "name"
        }
      }
    }
  },
  ...
]
```

### Setup

Import in your server main file and initialize it

###### index.js
```
const express = require('express');
const mongo = require('mongodbs');
...

// you can also set some options (see options.json.sample as reference)
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
_Permitted values here are: **delete**, **find**, **findOne**, **insert** and **update**<br>(Each one does what you expect it does)_
* **name** is the value used for the method named
* **field** is the field name you would to query for in the collection

you will find the generate method like the following<br>
_dbs.databaseName.models.collection.methodName_

Note that:
* a method not permitted will be ignored
* the `method + name` formula will be camel-cased
* any value for the **insert** method will be ignored (_current version_)

#### Example
Given the [conf.json](#conf) above you'll have these methods:
* findOneById
* findByName
* findByCategory
* updateById
* updateByName
* insert
* deleteById
* deleteByName

For example in your app you can use these facilities by doing like this
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

### Roadmap

* support mongodb connection options (..., replicaSet, sharding)
* CRUD combined operations
* aggregations
* stream operations

### Changelog

##### v1.0.0

* Created facility methods to perform basic CRUD operations over the database.
* Added the `addDbsToReq` option to optionally add the database instances into the express request.
* Added tests of the facility methods created by the module.
* `connect` and `use` methods are now deprecated.

##### v0.5.0

* Added the possibility to use **mongodbs** by passing your `app` express and a json configuration file. This behaviour is the same as what you would obtain by the calls to `connect` an `use` in sequence (*v0.4*).
* Added response outware.
* `connect` and `use` methods are not deprecated yet.
