/* eslint no-undef: off */

const mongo = require('..');
const fs = require('fs');

// dbs instance getter
const dbsMock = jest.fn();

beforeAll(async (done) => {
  // define fake express app
  const app = () => ({});
  app.use = () => ({});

  const conf = fs.readFileSync(`${__dirname}/../mongo.json.sample`, 'utf8');
  const options = fs.readFileSync(`${__dirname}/../options.json.sample`, 'utf8');

  const dbs = await mongo(app, JSON.parse(conf), JSON.parse(options));

  dbs.mongoDatabase.dropDatabase();

  dbsMock.mockReturnValue(dbs);
  done();
});

describe('mongodbs db model creation', () => {
  test('should have created a connection to mongoDatabase', (done) => {
    const dbs = dbsMock();

    expect(dbs).toEqual(expect.any(Object));
    expect(dbs.mongoDatabase).toEqual(expect.any(Object));
    done();
  });

  test('should have created a `items` functions suite in `mongoDatabase.models` Object', (done) => {
    const dbs = dbsMock();

    expect(dbs.mongoDatabase.models).toEqual(expect.any(Object));
    expect(dbs.mongoDatabase.models.items).toEqual(expect.any(Object));
    expect(dbs.mongoDatabase.models.items.findOneById).toEqual(expect.any(Function));
    expect(dbs.mongoDatabase.models.items.findByName).toEqual(expect.any(Function));
    expect(dbs.mongoDatabase.models.items.findBySomething).toEqual(undefined);
    done();
  });
});

describe('find on empty database', () => {
  test('search for `_id` should return an empty item\'s array', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findOneById('123')
    .then((item) => {
      expect(item).toEqual(null);
      done();
    });
  });

  test('search for `name` should return an empty item\'s array', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findByName('foo')
    .then((item) => {
      expect(item).toEqual(expect.any(Array));
      expect(item[0]).toEqual(undefined);
      done();
    });
  });

  test('search for `category` should return an empty item\'s array', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findByCategory('test')
    .then((item) => {
      expect(item).toEqual(expect.any(Array));
      expect(item[0]).toEqual(undefined);
      done();
    });
  });

  test('try searching for `otherField` should return an Error', (done) => {
    const dbs = dbsMock();

    try {
      dbs.mongoDatabase.models.items.findByOtherField('123');
    } catch (e) {
      expect(e).toEqual(expect.any(Error));
      done();
    }
  });
});

describe('insert items on db', () => {
  test('insert item should add a doc into the `items` collection', (done) => {
    const dbs = dbsMock();
    const data = {
      _id: '123',
      name: 'foo',
      category: 'test',
    };

    dbs.mongoDatabase.models.items.insertOne(data)
    .then((result) => {
      expect(result.result).toEqual({ n: 1, ok: 1 });
      done();
    })
    .catch(e => done(e));
  });

  test('insert item should add multiple docs into the `items` collection', (done) => {
    const dbs = dbsMock();
    const data = [
      {
        _id: '456',
        name: 'fools',
        category: 'test',
      },
      {
        _id: '789',
        name: 'fools',
        category: 'tests',
      },
    ];

    dbs.mongoDatabase.models.items.insert(data)
    .then((result) => {
      expect(result.result).toEqual({ n: 2, ok: 1 });
      done();
    })
    .catch(e => done(e));
  });

  test('search for `_id` should return an Object', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findOneById('123')
    .then((item) => {
      expect(item).toEqual(expect.any(Object));
      expect(item._id).toBe('123');

      done();
    });
  });

  test('search for `name` should return an Object', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findByName('foo')
    .then((item) => {
      expect(item).toEqual(expect.any(Array));
      expect(item.length).toBe(1);
      expect(item[0]).toEqual(expect.any(Object));
      expect(item[0].name).toBe('foo');

      done();
    });
  });
});

describe('update items on db', () => {
  test('update item by _id should modify a doc in the `items` collection', (done) => {
    const dbs = dbsMock();
    const data = {
      name: 'fooDoc',
    };

    dbs.mongoDatabase.models.items.updateOneById('123', data)
    .then((result) => {
      expect(result.result).toEqual({ n: 1, nModified: 1, ok: 1 });
      done();
    })
    .catch(e => done(e));
  });

  test('search for `_id` should return an Object with name equals to `fooDoc`', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findOneById('123')
    .then((item) => {
      expect(item).toEqual(expect.any(Object));
      expect(item.name).toBe('fooDoc');

      done();
    });
  });

  test('search for `name` should return an Object', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findByName('fooDoc')
    .then((item) => {
      expect(item).toEqual(expect.any(Array));
      expect(item.length).toBe(1);
      expect(item[0]).toEqual(expect.any(Object));
      expect(item[0]._id).toBe('123');

      done();
    });
  });
});

describe('delete items from db', () => {
  test('delete item by `_id` (\'123\') should delete a doc from the `items` collection', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.deleteOneById('123')
    .then((result) => {
      expect(result.result).toEqual({ n: 1, ok: 1 });
      done();
    })
    .catch(e => done(e));
  });

  test('search for `_id` (\'123\') should return null', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findOneById('123')
    .then((item) => {
      expect(item).toBe(null);

      done();
    });
  });

  test('delete items by `name` (\'fools\') should delete a doc from the `items` collection', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.deleteByName('fools')
    .then((result) => {
      expect(result.result).toEqual({ n: 2, ok: 1 });
      done();
    })
    .catch(e => done(e));
  });

  test('search for `name` (\'fools\') should return null', (done) => {
    const dbs = dbsMock();

    dbs.mongoDatabase.models.items.findByName('fooDoc')
    .then((item) => {
      expect(item).toEqual(expect.any(Array));
      expect(item[0]).toEqual(undefined);

      done();
    });
  });
});
