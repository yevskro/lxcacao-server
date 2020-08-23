import express from 'express';
import User from '../models/User';

const app = express();

app.get('/user/:userId/recipes/:recipeId', async (req, res) => {
  const userId = Number(req.params.userId);
  const recipeId = Number(req.params.recipeId);

  const isBlocked = await User.isBlockedBy(1, userId);
  const isFriends = await User.isFriendsWith(1, userId);
  if (!isBlocked && isFriends) {
    const readData = await User.readRecipe(recipeId, { name: true });
    res.status(200).json(readData);
  } else res.status(401).json({ authorized: false });
});

app.get('/user/:userId/recipes', (req, res) => {
  /* User.readAllRecipes(Number(req.params.userId), { name: true }).then(
    (data) => {
      console.log({ data });
      res.send(data);
    }
  ); */
  res.status(200).send('edit user(image)');
});

app.get('/user/recipes/:id', (_, res) => res.send('all recipes'));
app.patch('/user/recipes/:id', (_, res) => res.send('edit a users recipes'));
app.post('/user/recipes', (_, res) => res.send('create a users recipes'));
app.delete('/user/recipes/:id', (_, res) => res.send('delete recipe'));

app.patch('/user', (_, res) => res.status(200).send('edit user(image)'));

export default app;
