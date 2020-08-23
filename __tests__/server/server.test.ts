import supertest from 'supertest';
import app, { User } from '../../src/servers/httpApp';
import testSetupDbHelper from '../helpers/testSetupDbHelper';

describe('get /user', () => {
  afterAll(async () => {
    await User.poolEnd();
  });

  it('can clear and setup a testdb', async () =>
    expect(await testSetupDbHelper()).toBe(true));

  it('can get a friends recipe', async () => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toStrictEqual('Banana Split');
    expect(res.body.time).toStrictEqual('35m');
    expect(res.body.private).toBe(false);
    expect(res.body.ingredients).toStrictEqual([]);
    expect(res.body.how_to_prepare).toStrictEqual([]);
    expect(res.body.main_user_id).toBe(1);
    expect(res.body.origin_user_id).toBe(1);
    expect(res.body.origin_user_full_name).toStrictEqual('Yev Skro');
  });
});
