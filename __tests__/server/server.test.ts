import supertest from 'supertest';
import httpServer from '../../src/servers/server';

describe('get /user', () => {
  it('dfd', () => {
    supertest(httpServer)
      .get('/user/1/recipes')
      .expect(200)
      .end((err) => {
        if (err) throw err;
      });
  });
});
