/* eslint no-undef: off */

const mongo = require('..');
const fs = require('fs');

// dbs instance getter
const dbsMock = jest.fn();

beforeAll.skip(async (done) => {
  // define fake express app
  const app = () => ({});
  app.use = () => ({});

  const conf = fs.readFileSync(`${__dirname}/../mongo-shards.json.sample`, 'utf8');
  const options = fs.readFileSync(`${__dirname}/../options.json.sample`, 'utf8');

  const dbs = await mongo(app, JSON.parse(conf), JSON.parse(options));

  dbs.mongoShard.dropDatabase();

  dbsMock.mockReturnValue(dbs);
  done();
});

describe.skip('mongodbs db model creation', () => {
  test('should have created a connection to mongoShard', (done) => {
    const dbs = dbsMock();

    expect(dbs).toEqual(expect.any(Object));
    expect(dbs.mongoShard).toEqual(expect.any(Object));
    done();
  });

  test('should have created `findOneById` function in `mongoShard`', (done) => {
    const dbs = dbsMock();

    expect(dbs.mongoShard.models).toEqual(expect.any(Object));
    expect(dbs.mongoShard.models.items).toEqual(expect.any(Object));
    expect(dbs.mongoShard.models.items.findOneById).toEqual(expect.any(Function));
    expect(dbs.mongoShard.models.items.findBySomething).toEqual(undefined);
    done();
  });
});
