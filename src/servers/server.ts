import express from 'express';
import User from '../models/User';

const app = express();

app.get('/user/:id/recipes/:id', (req, res) => {
  /* User.pool
    .query('select * from users;')
    .then((value) => console.log({ value }))
    .catch((err) => console.log({ err })); */
  User.readRecipe(Number(req.params.id), { name: true }).then((data) => {
    console.log({ data });
    res.send(data);
  });
});
app.patch('/user/:id/recipes/:id', (_, res) => res.send('edit users recipes'));
app.delete('/user/:id/recipes/:id', (_, res) => res.send('delete recipe'));
app.post('/user/:id/recipes', (_, res) => res.send('create new recipe'));

app.get('/user', (_, res) => res.send('all recipes'));
app.patch('/user', (_, res) => res.send('edit user(image)'));

app.listen(80, () => {
  // eslint-disable-next-line no-console
  console.log('Server is up and running.\nListening on port 80');
});
