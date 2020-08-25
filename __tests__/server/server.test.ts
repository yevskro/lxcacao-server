/*
  Author: Yevgeniy Skroznikov
  Date: August 25 2020
  Description:
  This module tests the http server compound routes
  for the user and recipe resource.
*/

import supertest from 'supertest';
import express from 'express';
import User, {
  UpdateRecipeData,
  RecipeData,
  IdData,
  CreateRecipeData,
} from '../../src/models/User';
import HttpApp from '../../src/servers/httpApp';
import testSetupDbHelper from '../helpers/testSetupDbHelper';

describe('/users routes', () => {
  let app: express.Application;

  beforeAll(async (done) => {
    app = new HttpApp().getApp();
    done();
  });

  afterAll(async (done) => {
    /* kill pool connection otherwise the test 
    will hang at the end */
    await User.poolEnd();
    done();
  });

  it('can clear and setup a testdb', async (done) => {
    expect(await testSetupDbHelper()).toBe(true);
    done();
  });

  it('can get a friends recipe', async (done) => {
    /* setup */
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    const res = await supertest(app)
      .get('/users/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toStrictEqual('Banana Split');
    expect(Object.keys(res.body).length).toBe(12);
    done();
  });

  it('cannot get a non friends recipe', async (done) => {
    /* setup */
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.deleteFriendByMainPeerId(1, 2);
    await User.deleteFriendByMainPeerId(2, 1);

    const res = await supertest(app)
      .get('/users/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);
    done();
  });

  it('cannot get a blocked friends recipe', async (done) => {
    /* setup */
    await User.createFriend({ main_user_id: 1, peer_user_id: 2 });
    await User.createFriend({ main_user_id: 2, peer_user_id: 1 });

    await User.createBlock({ main_user_id: 1, peer_user_id: 2 });

    const res = await supertest(app)
      .get('/users/2/recipes/1')
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);
    done();
  });

  it('can get a nonblocked friends all recipes', async (done) => {
    /* setup */
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
      .get('/users/2/recipes')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(2);
    expect(res.body[0].name).toStrictEqual('Apple Split');
    expect(Object.keys(res.body[0]).length).toBe(12);
    done();
  });

  it('can edit owners recipe', async (done) => {
    /* this will be the payload for the patch http method */
    const updateData: UpdateRecipeData = {
      time: '40m',
    };

    let res = await supertest(app) // patch it
      .patch('/users/2/recipes/2')
      .send(updateData)
      .set('Accept', 'application/json');

    expect(res.status).toBe(204);

    res = await supertest(app) // read it back to make sure
      .get('/users/2/recipes/2')
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.type).toStrictEqual('application/json');
    expect(res.body.time).toStrictEqual('40m');
    done();
  });

  it('can not edit not owned recipe', async (done) => {
    const res = await supertest(app)
      .patch('/users/1/recipes/1')
      .send({ time: '40m' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);
    done();
  });

  it('can not get a friends private recipe', async (done) => {
    await User.updateRecipe(2, { private: true }); // setup

    const res = await supertest(app)
      .get('/users/2/recipes/2')
      .set('Accept', 'application/json');

    expect(res.status).toBe(403);
    done();
  });

  it('private recipes are filtered out for non owners', async (done) => {
    /* setup, create a recipe with a private flag */
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
      .get('/users/2/recipes')
      .set('Accept', 'application/json');

    /* get the recipe that was set to private in a test before */
    const foundPrivateRecipe: RecipeData = res.body.find(
      (recipe: RecipeData) => recipe.id === 2
    );

    /* get the recipe we created */
    const foundPublicRecipe: RecipeData = res.body.find(
      (recipe: RecipeData) => recipe.id === idData.id
    );

    expect(foundPrivateRecipe).toBe(undefined);
    expect(foundPublicRecipe).not.toBe(undefined);
    done();
  });

  it('can create a recipe', async (done) => {
    /* setup */
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
      .post('/users/2/recipes')
      .send(createRecipeData);

    expect(res.status).toBe(201);
    done();
  });

  it('can not create a recipe for another user', async (done) => {
    /* setup */
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
      .post('/users/1/recipes')
      .send(createRecipeData);

    expect(res.status).toBe(403);
    done();
  });

  it('can delete an owners recipe', async (done) => {
    const res = await supertest(app).delete('/users/2/recipes/2');
    expect(res.status).toBe(204);
    done();
  });

  it('cannot delete another users recipe', async (done) => {
    const res = await supertest(app).delete('/users/1/recipes/1');
    expect(res.status).toBe(403);
    done();
  });

  it('can find a user by gmail', async (done) => {
    const res = await supertest(app).get('/users?gmail=admin@gmail.com'); // gmail does exist
    expect(res.status).toBe(200);
    done();
  });

  it('returns a 404 when cannot find by gmail', async (done) => {
    const res = await supertest(app).get('/users?gmail=admin10@gmail.com'); // gmail doesn't exist
    expect(res.status).toBe(404);
    done();
  });

  it('returns a 400 when its not a valid gmail', async (done) => {
    const res = await supertest(app).get('/users?gmail=admin10@admin.com'); // invalid gmail
    expect(res.status).toBe(400);
    done();
  });

  it('returns a 404 when getting a non existing recipe', async (done) => {
    const res = await supertest(app).get('/users/1/recipes/23'); // 23 doesn't exist
    expect(res.status).toBe(404);
    done();
  });

  it('can handle global errors', async (done) => {
    const res = await supertest(app).get('/error'); // error testing route
    expect(res.status).toBe(500);
    expect(res.text).toStrictEqual('testing error route');
    done();
  });
});
