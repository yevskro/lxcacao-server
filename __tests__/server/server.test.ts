import supertest from 'supertest';
import app, { User } from '../../src/servers/httpApp';
import setupDbHelper from '../db/helpers/setupDbHelper';

describe('get /user', () => {
  afterAll(async () => {
    await User.poolEnd();
  });

  it('can clear and setup a testdb', async () =>
    expect(await setupDbHelper()).toBe(true));

  it('dfd', async () => {
    const res = await supertest(app)
      .get('/user/1/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });
});
