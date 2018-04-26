/* eslint no-undef: off */

const mongo = require('..');
const fs = require('fs');

// dbs instance getter
const dbsMock = jest.fn();

beforeAll(async (done) => {
  // define fake express app
  const app = () => ({});
  app.use = () => ({});

  const conf = fs.readFileSync(`${__dirname}/../mongo-replicaSet.json.sample`, 'utf8');
  const options = fs.readFileSync(`${__dirname}/../options.json.sample`, 'utf8');

  const dbs = await mongo(app, JSON.parse(conf), JSON.parse(options));

  dbs.mongoReplica1.dropDatabase();
  dbs.mongoReplica2.dropDatabase();

  dbsMock.mockReturnValue(dbs);
  done();
});

describe('mongodbs db model creation', () => {
  test('should have created connections to mongoReplica1 and mongoReplica2', (done) => {
    const dbs = dbsMock();

    expect(dbs).toEqual(expect.any(Object));
    expect(dbs.mongoReplica1).toEqual(expect.any(Object));
    expect(dbs.mongoReplica2).toEqual(expect.any(Object));
    done();
  });

  test('should have created `findOneById` functions in `mongoReplica1` and `mongoReplica2`', (done) => {
    const dbs = dbsMock();

    expect(dbs.mongoReplica1.models).toEqual(expect.any(Object));
    expect(dbs.mongoReplica2.models).toEqual(expect.any(Object));
    expect(dbs.mongoReplica1.models.items).toEqual(expect.any(Object));
    expect(dbs.mongoReplica2.models.items).toEqual(expect.any(Object));
    expect(dbs.mongoReplica1.models.items.findOneById).toEqual(expect.any(Function));
    expect(dbs.mongoReplica2.models.items.findOneById).toEqual(expect.any(Function));
    expect(dbs.mongoReplica1.models.items.findBySomething).toEqual(undefined);
    expect(dbs.mongoReplica2.models.items.findBySomething).toEqual(undefined);
    done();
  });
});
