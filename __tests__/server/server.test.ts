import supertest from 'supertest';
import {
  UpdateRecipeData,
  RecipeData,
  IdData,
  CreateRecipeData,
} from 'src/models/User';
import app, { User } from '../../src/servers/httpApp';
import testSetupDbHelper from '../helpers/testSetupDbHelper';
/* this test is not testing authorized gmail users yet */

describe('/user routes', () => {
  afterAll(async (done) => {
    await User.poolEnd();
    done();
  });

  it('can clear and setup a testdb', async (done) => {
    expect(await testSetupDbHelper()).toBe(true);
    done();
  });

  it('can get a friends recipe', async (done) => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toStrictEqual('Banana Split');
    expect(Object.keys(res.body).length).toBe(12);
    done();
  });

  it('cannot get a non friends recipe', async (done) => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.deleteFriendByMainPeerId(1, 2);
    await User.deleteFriendByMainPeerId(2, 1);

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    done();
  });

  it('cannot get a blocked friends recipe', async (done) => {
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.createBlock({ main_user_id: 1, peer_user_id: 2 });

    const res = await supertest(app)
      .get('/user/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    done();
  });

  it('can get a nonblocked friends all recipes', async (done) => {
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
    done();
  });

  it('can edit owners recipe', async (done) => {
    const updateData: UpdateRecipeData = {
      time: '40m',
    };

    let res = await supertest(app)
      .patch('/user/2/recipes/2')
      .send(updateData)
      .set('Accept', 'application/json');

    expect(res.status).toBe(204);

    res = await supertest(app)
      .get('/user/2/recipes/2')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.type).toStrictEqual('application/json');
    expect(res.body.time).toStrictEqual('40m');
    done();
  });

  it('can not edit not owned recipe', async (done) => {
    const res = await supertest(app)
      .patch('/user/1/recipes/1')
      .send({ time: '40m' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    done();
  });

  it('can not get a friends private recipe', async (done) => {
    await User.updateRecipe(2, { private: true });
    const res = await supertest(app)
      .get('/user/2/recipes/2')
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    done();
  });

  it('private recipes are filtered out for non owners', async (done) => {
    const idData: IdData = await User.createRecipe({
      main_user_id: 2,
      type: 'Dinner',
      name: 'Beef Stew',
      origin_user_id: 2,
      origin_user_full_name: 'Jim Carrey',
      private: false,
      time: '1h20m',
    });

    const res = await supertest(app)
      .get('/user/2/recipes')
      .set('Accept', 'application/json');

    const foundPrivateRecipe: RecipeData = res.body.find(
      (recipe: RecipeData) => recipe.id === 2
    );

    const foundPublicRecipe: RecipeData = res.body.find(
      (recipe: RecipeData) => recipe.id === idData.id
    );

    expect(foundPrivateRecipe).toBe(undefined);
    expect(foundPublicRecipe).not.toBe(undefined);
    done();
  });

  it('can create a recipe', async (done) => {
    const createRecipeData: CreateRecipeData = {
      name: 'Eggs',
      origin_user_full_name: 'Jim Carrey',
      time: '15m',
      private: false,
      origin_user_id: 2,
      main_user_id: 2,
      type: 'Breakfast',
    };

    const res = await supertest(app)
      .post('/user/2/recipes')
      .send(createRecipeData);

    expect(res.status).toBe(201);
    done();
  });
});
