import express from 'express';
import User from '../models/User';

const app = express();

app.get('/user/:userId/recipes/:recipeId', (req, res) => {
  /* User.pool
    .query('SELECT id FROM users_blocks WHERE main_user_id = 2')
    .then((result) => res.send(result)); */
  // User.readAllFriends(2, { id: true }).then((data) => res.send({ data }))
  User.isBlockedBy(2, Number(req.params.userId))
    .then((value) => res.send({ value }))
    .catch((errr) => res.send({ errr }));
  // User.readAllRecipes(1, { id: true }).then((data) => res.send(data));
  // User.isBlockedBy(2, 1).then((data) => console.log(data));
  /* User.isBlockedBy(2, Number(req.params.userId)).then((isBlocked) => {
    if (!isBlocked) {
      console.log('bastard');
      User.isFriendsWith(2, 1).then((isFriends) => {
        if (isFriends) {
          User.readRecipe(Number(req.params.recipeId), { name: true }).then(
            (data) => {
              console.log({ data });
              res.send(data);
            }
          );
        }
      });
    }
  }); */
});

app.get('/user/:userId/recipes', (req, res) => {
  /* User.readAllRecipes(Number(req.params.userId), { name: true }).then(
    (data) => {
      console.log({ data });
      res.send(data);
    }
  ); */
});

app.get('/user/recipes/:id', (_, res) => res.send('all recipes'));
app.patch('/user/recipes/:id', (_, res) => res.send('edit a users recipes'));
app.post('/user/recipes', (_, res) => res.send('create a users recipes'));
app.delete('/user/recipes/:id', (_, res) => res.send('delete recipe'));

app.patch('/user', (_, res) => res.send('edit user(image)'));

app.listen(80, () => {
  // eslint-disable-next-line no-console
  console.log('Server is up and running.\nListening on port 80');
});
