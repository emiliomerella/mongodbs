const validMethods = [
  'delete',
  'deleteOne',
  'find',
  'findOne',
  'insert',
  'insertOne',
  'update',
  'updateOne',
];

// const validOperators = [
//   '$gt',
//   '$gte',
//   '$lt',
//   '$lte',
// ];

const buildRequestName = (method, key) => {
  if (method === 'find') {
    method = 'findBy';
  }
  if (method === 'findOne') {
    method = 'findOneBy';
  }
  if (method === 'delete') {
    method = 'deleteBy';
  }
  if (method === 'deleteOne') {
    method = 'deleteOneBy';
  }
  if (method === 'update') {
    method = 'updateBy';
  }
  if (method === 'updateOne') {
    method = 'updateOneBy';
  }
  if (method === 'insert') {
    return method;
  }
  if (method === 'insertOne') {
    return method;
  }

  return `${method}${key.replace(/\b\w/g, l => l.toUpperCase())}`
  .replace(/_([a-z])/g, l => l[1].toUpperCase())
  .replace(/_/g, () => '');
};

const buildRequests = (db, modelName, model, method) => {
  for (const [key, value] of Object.entries(model[method])) {
    const requestName = buildRequestName(method, key);
    if (typeof value === 'string') {
      if (method === 'delete') {
        db.models[modelName][requestName] = search =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const result = await db.collection(modelName).deleteMany(objSearch);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
      }
      if (method === 'deleteOne') {
        db.models[modelName][requestName] = search =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const result = await db.collection(modelName).deleteOne(objSearch);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
      }

      if (method === 'find') {
        db.models[modelName][requestName] = search =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const item = await db.collection(modelName).find(objSearch).toArray();
              resolve(item);
            } catch (e) {
              reject(e);
            }
          });
      }
      if (method === 'findOne') {
        db.models[modelName][requestName] = search =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const item = await db.collection(modelName).findOne(objSearch);
              resolve(item);
            } catch (e) {
              reject(e);
            }
          });
      }

      if (method === 'update') {
        db.models[modelName][requestName] = (search, item) =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const result = await db.collection(modelName).update(objSearch, { $set: item });
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
      }
      if (method === 'updateOne') {
        db.models[modelName][requestName] = (search, item) =>
          new Promise(async (resolve, reject) => {
            try {
              const objSearch = {};
              objSearch[value] = search;
              const result = await db.collection(modelName).updateOne(objSearch, { $set: item });
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
      }
    }
    // if (typeof value === 'object') {
    //   for (const [op, val] of Object.entries(value)) {
    //     const searchObj = {
    //
    //     };
    //     console.log(op, val);
    //   }
    //   if (method === 'find') {
    //     db.models[modelName][requestName] = search => db.collection(modelName).find(searchObj);
    //   }
    //   if (method === 'findOne') {
    //     db.models[modelName][requestName] = search => db.collection(modelName).findOne(searchObj);
    //   }
    // }
  }

  if (method === 'insert') {
    db.models[modelName].insert = newItems =>
      new Promise(async (resolve, reject) => {
        try {
          const result = await db.collection(modelName).insertMany(newItems);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
  }
  if (method === 'insertOne') {
    db.models[modelName].insertOne = newItem =>
      new Promise(async (resolve, reject) => {
        try {
          const result = await db.collection(modelName).insertOne(newItem);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
  }
};

module.exports = (db, conf) =>
  new Promise((resolve, reject) => {
    try {
      db.models = {};
      for (const modelName in conf.models) {
        if (typeof modelName === 'string') {
          db.models[modelName] = {};
          const model = conf.models[modelName];
          for (const method in model) {
            if (validMethods.find(valid => valid === method)) {
              buildRequests(db, modelName, model, method);
            }
          }
        }
      }
      resolve(db);
    } catch (e) {
      reject(e);
    }
  });
