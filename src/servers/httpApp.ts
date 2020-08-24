import express from 'express';
import User, { RecipeData, CreateRecipeData } from '../models/User';

const app = express();

app.use(express.json());

app.get('/user/:userId/recipes/:recipeId', async (req, res) => {
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);

  try {
    const authorized = await User.isAuthorized(ownerId, userId);
    if (!authorized) return res.sendStatus(401);
    const readData = await User.readRecipe(recipeId, { all: true });
    if (readData.private && ownerId !== userId) return res.sendStatus(401);
    return res.status(200).json(readData);
  } catch (err) {
    return res.status(301).json(err);
  }
});

app.get('/user/:userId/recipes', async (req, res) => {
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const authorized = await User.isAuthorized(ownerId, userId);

  if (!authorized) return res.sendStatus(401);

  let readData = await User.readAllRecipes(userId, {
    all: true,
  });

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

  if (!authorized) return res.sendStatus(401);

  await User.updateRecipe(recipeId, req.body);

  return res.sendStatus(204);
});

app.post('/user/:userId/recipes', async (req, res) => {
  const ownerId = 2;
  const userId = Number(req.params.userId);
  const createRecipeData: CreateRecipeData = req.body;
  const authorized = ownerId === userId;

  if (!authorized) return res.sendStatus(401);

  await User.createRecipe(createRecipeData);

  return res.sendStatus(201);
});

app.delete('/user/:userId/recipes/:id', (_, res) => res.send('delete recipe'));

export default app;
export { User };
