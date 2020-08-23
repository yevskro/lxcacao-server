import express from 'express';
import User from '../models/User';

const app = express();

app.get('/user/:userId/recipes/:recipeId', async (req, res) => {
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);

  try {
    const authorized = await User.isAuthorized(ownerId, userId);
    if (!authorized) {
      return res.status(401).json({ authorized: false });
    }
    const readData = await User.readRecipe(recipeId, { all: true });
    return res.status(200).json(readData);
  } catch (err) {
    return res.status(301).json(err);
  }
});

app.get('/user/:userId/recipes', async (req, res) => {
  const ownerId = 1;
  const userId = Number(req.params.userId);
  const authorized = await User.isAuthorized(ownerId, userId);

  if (!authorized) {
    return res.status(401).json({ authorized: false });
  }

  const readData = await User.readAllRecipes(userId, {
    all: true,
  });

  return res.status(200).json(readData);
});

app.get('/user/recipes/:id', async (req, res) => {
  const ownerId = 1;

  const readData = await User.readRecipe(ownerId, {
    all: true,
  });

  return res.status(200).json(readData);
});

app.get('/user/recipes', async (req, res) => {
  const ownerId = 1;

  const readData = await User.readAllRecipes(ownerId, {
    all: true,
  });

  return res.status(200).json(readData);
});

app.patch('/user/recipes/:id', (_, res) => res.send('edit a users recipes'));

app.post('/user/recipes', async (req, res) => res.send('dur'));

app.delete('/user/recipes/:id', (_, res) => res.send('delete recipe'));

app.patch('/user', (_, res) => res.status(200).send('edit user(image)'));

export default app;
export { User };
