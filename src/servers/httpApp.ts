import express, { NextFunction, Request, Response } from 'express';
import User, { RecipeData, CreateRecipeData } from '../models/User';

const app = express();

app.use(express.json());

app.get('/user/:userId/recipes/:recipeId', async (req, res, next) => {
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

  if (!readData) return res.sendStatus(404);
  if (readData.private && ownerId !== userId) return res.sendStatus(403);
  return res.status(200).json(readData);
});

app.get('/user/:userId/recipes', async (req, res) => {
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const authorized = await User.isAuthorized(ownerId, userId).catch(() => {
    error = new Error('failed to process authorization');
  });
  if (error) return next(error);

  if (!authorized) return res.sendStatus(403);

  let readData = await User.readAllRecipes(userId, {
    all: true,
  });

  if (!readData) res.sendStatus(404);

  if (ownerId !== userId) {
    readData = readData.filter((data: RecipeData) => !data.private);
  }

  return res.status(200).json(readData);
});

app.patch('/user/:userId/recipes/:recipeId', async (req, res) => {
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);
  const authorized = ownerId === userId;

  if (!authorized) return res.sendStatus(403);

  await User.updateRecipe(recipeId, req.body);

  return res.sendStatus(204);
});

app.post('/user/:userId/recipes', async (req, res) => {
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const createRecipeData: CreateRecipeData = req.body;
  const authorized = ownerId === userId;

  if (!authorized) return res.sendStatus(403);

  await User.createRecipe(createRecipeData);

  return res.sendStatus(201);
});

app.delete('/user/:userId/recipes/:recipeId', async (req, res) => {
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);
  const authorized = ownerId === userId;

  if (!authorized) return res.sendStatus(403);
  await User.deleteRecipe(recipeId);

  return res.sendStatus(204);
});

app.get('/user', async (req, res) => {
  if (!req.query.gmail) return res.sendStatus(204);
  const { gmail } = <{ gmail: string }>req.query;
  const gmailRgx = /([a-zA-Z0-9]+)([.{1}])?([a-zA-Z0-9]+)@gmail([.])com/g;
  if (!gmailRgx.test(gmail)) return res.sendStatus(400);

  const userData = await User.readUserByGmail(gmail, {
    gmail: true,
    first_name: true,
    last_name: true,
  });

  if (userData) return res.status(200).json(userData);

  return res.sendStatus(404);
});

app.get('/error', (req, res, next) => {
  next(new Error('testing error route'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  /* express global error handler */
  res.status(500).send(err.message);
});

export default app;
export { User };
