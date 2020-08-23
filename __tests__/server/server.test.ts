import supertest from 'supertest';
import app, { User } from '../../src/servers/httpApp';
import testSetupDbHelper from '../helpers/testSetupDbHelper';
/* this test is not testing authorized gmail users yet */

describe('/user routes', () => {
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
    expect(Object.keys(res.body).length).toBe(12);
  });

  it('cannot get a non friends recipe', async () => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.deleteFriendByMainPeerId(1, 2);
    await User.deleteFriendByMainPeerId(2, 1);

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });

  it('cannot get a blocked friends recipe', async () => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.createBlock({ main_user_id: 1, peer_user_id: 2 });

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
  });

  it('can get a nonblocked friends all recipes', async () => {
    await User.deleteBlockByMainPeerId(1, 2);
    const idData = await User.createRecipe({
      name: 'Apple Split',
      time: '35m',
      type: 'Desert',
      private: false,
      main_user_id: 2,
      origin_user_id: 2,
      origin_user_full_name: 'Jim Carrey',
    });

    expect(typeof idData.id).toBe('number');
    const res = await supertest(app)
      .get('/user/2/recipes')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(2);
    expect(res.body[0].name).toStrictEqual('Apple Split');
    expect(Object.keys(res.body[0]).length).toBe(12);
  });
});
