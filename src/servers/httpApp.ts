import express, { NextFunction, Request, Response } from 'express';
import User, { RecipeData, CreateRecipeData } from '../models/User';

const app = express();

app.use(express.json());

app.get('/users/:userId/recipes/:recipeId', async (req, res, next) => {
  /* get the recipe that belongs to a user, the recipeId is also
  the rowId in users_recipes table */
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);
  let error: Error;

  const authorized = await User.isAuthorized(ownerId, userId).catch(() => {
    error = new Error('failed to process authorization');
  });
  if (error) return next(error);

  if (!authorized) return res.sendStatus(403);

  const readData = await User.readRecipe(recipeId, {
    all: true,
  }).catch(() => {
    error = new Error('failed to read recipe');
  });
  if (error) return next(error);

  /* if no recipe was found undefined is returned */
  if (!readData) return res.sendStatus(404);
  /* if the recipe is private only the owner can see it */
  if (readData.private && ownerId !== userId) return res.sendStatus(403);
  return res.status(200).json(readData);
});

app.get('/users/:userId/recipes', async (req, res, next) => {
  /* get all the recipes that belong to a user with the user id */
  const ownerId = 1;
  const userId = Number(req.params.userId);
  let error: Error;

  const authorized = await User.isAuthorized(ownerId, userId).catch(() => {
    error = new Error('failed to process authorization');
  });
  if (error) return next(error);

  if (!authorized) return res.sendStatus(403);

  let readData = await User.readAllRecipes(userId, {
    all: true,
  }).catch(() => {
    error = new Error('failed to read recipes');
  });
  if (error) return next(error);

  /* if readData is undefined non were found */
  if (!readData) res.sendStatus(404);

  if (ownerId !== userId) {
    readData = (readData as RecipeData[]).filter(
      (data: RecipeData) => !data.private
    );
  }

  return res.status(200).json(readData);
});

app.patch('/users/:userId/recipes/:recipeId', async (req, res, next) => {
  /* edit fields of a recipe that belongs to the user */
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);
  const authorized = ownerId === userId;
  let error: Error;

  if (!authorized) return res.sendStatus(403);

  await User.updateRecipe(recipeId, req.body).catch(() => {
    error = new Error('failed to update recipe');
  });
  if (error) return next(error);

  return res.sendStatus(204);
});

app.post('/users/:userId/recipes', async (req, res, next) => {
  /* create a recipe that will belong to user with the userId */
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const createRecipeData: CreateRecipeData = req.body;
  const authorized = ownerId === userId;
  let error: Error;

  if (!authorized) return res.sendStatus(403);

  await User.createRecipe(createRecipeData).catch(() => {
    error = new Error('failed to create recipe');
  });
  if (error) return next(error);

  return res.sendStatus(201);
});

app.delete('/users/:userId/recipes/:recipeId', async (req, res, next) => {
  /* delete a recipe that belongs to the user */
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);
  const authorized = ownerId === userId;
  let error: Error;

  if (!authorized) return res.sendStatus(403);

  await User.deleteRecipe(recipeId).catch(() => {
    error = new Error('failed to delete recipe');
  });
  if (error) return next(error);

  return res.sendStatus(204);
});

app.get('/users', async (req, res, next) => {
  /* route created to search for a user with a
   gmail */
  if (!req.query.gmail) return res.sendStatus(204);

  const { gmail } = <{ gmail: string }>req.query;
  const gmailRgx = /([a-zA-Z0-9]+)([.{1}])?([a-zA-Z0-9]+)@gmail([.])com/g;
  let error: Error;

  if (!gmailRgx.test(gmail)) return res.sendStatus(400);

  const userData = await User.readUserByGmail(gmail, {
    gmail: true,
    first_name: true,
    last_name: true,
  }).catch(() => {
    error = new Error('failed to read recipe');
  });
  if (error) return next(error);

  if (userData) return res.status(200).json(userData);

  return res.sendStatus(404);
});

app.get('/error', (req, res, next) => {
  /* testing error route */
  next(new Error('testing error route'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  /* express global error handler */
  res.status(500).send(err.message);
});

export default app;
export { User };
