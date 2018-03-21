# mongodbs

This module allows your server to connect to multiple mongodb databases.
Current features are:

* create connection(s) using a JSON configuration file
* put database instance(s) into the express request

Database instance(s) will be available in req.dbs[dbName]

## Dependencies

* mongodb
* assert

## How to use the module (soon available)

Install

```
npm install --save mongodbs
```

Create a /path/to/conf.json configuration file like the following

```
conf.json

[
  {
    "dbName": "myMongoDB",
    "dbUrl": "localhost:27017/"
  },
  ...
]
```

Import in your server main file

```
const express = require('express');
const mongodbs = require('mongodbs');
...
```

Initialize and use as middleware

```
const app = express();
const dbs = await mongodbs.connect('/path/to/conf.json');
app.use(mongodbs.use(dbs));
...
const port = 8080; // your port for this server
app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
```

or

```
const app = express();
mongodbs.connect('/path/to/conf.json')
.then(dbs => {  
  app.use(mongodbs.use(dbs));
  ...
  const port = 8080; // your port for this server
  app.listen(port, () => console.log(`my awesome server is listening on port ${port}`));
});
```

Then in your routes you'll have

```
app.get('/', (req, res, next) => {
  const db = req.dbs.myMongoDB;
  const coll = db.collection('myCollection');

  // [here you can perform mongodb CRUD operations as usual]
});
```

## Roadmap

* support mongodb connection options
* CRUD operations facilities
* response outware
