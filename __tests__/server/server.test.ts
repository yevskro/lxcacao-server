import supertest from 'supertest';
import { Server } from 'http';
import app, { User } from '../../src/servers/httpApp';

describe('get /user', () => {
  let server: Server;
  beforeAll((done) => {
    server = app.listen(3001, () => done());
    server.on('close', () => User.poolEnd());
  });

  afterAll((done) => {
    server.close(() => {
      console.log('server closing');
      done();
    });
  });

  it('dfd', async () => {
    const res = await supertest(server)
      .get('/user/1/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    expect(true).toBe(true);
  });
});
