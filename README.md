# mongodbs

This module allows your server to connect to multiple mongodb databases.
Current features are:

* create connection(s) using a JSON configuration file
* put database instance(s) into the express request

Database instance(s) will be available in req.dbs[dbName]

### Dependencies

* mongodb
* assert

### How to use the module

Install

```
npm install --save mongodbs
```

Create a /path/to/conf.json configuration file like the following

###### conf.json
```

[
  {
    "dbName": "myMongoDB",
    "dbUrl": "localhost:27017/"
  },
  ...
]
```

Import in your server main file and initialize it

###### index.js
```
const express = require('express');
const mongo = require('mongodbs');
...

const app = express();
const mongodbs = await mongo(app, '/path/to/conf.json');
...

const port = 8080; // your port for this server
app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
```

or

```
const app = express();
mongo(app, '/path/to/conf.json')
.then(mongodbs => {  
  ...
  const port = 8080; // your port for this server
  app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
});
```

Then in your routes you'll have

###### myRoute.js
```
app.get('/', (req, res, next) => {
  const db = req.dbs.myMongoDB;
  const coll = db.collection('myCollection');

  // here you can perform mongodb CRUD operations as usual
});
```

You can also use the response outware by adding it as the latest middleware of the app, and adding a `mongoResponse` object to the `res` express object

###### index.js
```
const app = express();
...
app.use(mongo.response());

const port = 8080; // your port for this server
app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
```

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

The outware will send the response back to the client.

### Roadmap

* support mongodb connection options
* CRUD operations facilities

### Changelog

##### v0.5.0

* Added the possibility to use **mongodbs** by passing your `app` express and a json configuration file. This behaviour is the same as what you would obtain by the calls to `connect` an `use` in sequence (*v0.4*).
* Added response outware.
* `connect` and `use` methods are not deprecated yet.
