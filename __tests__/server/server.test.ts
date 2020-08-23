import supertest from 'supertest';
/* make sure a local docker containerized instance of the server is running */
describe('get /user', () => {
  const server = 'localhost:3000';

  it('dfd', (done) => {
    supertest(server)
      .get('/user/1/recipes/1')
      .set('Accept', 'application/json')
      .expect(401)
      .end((err) => {
        if (err) throw err;
        done();
      });
    // .then((res) => expect(res.body.name).toStrictEqual());
  });
});
