import express from 'express';

const app = express();

app.get('/user/:id/recipe/:id', (_, res) => res.send('user id recipes id'));
app.patch('/user/:id/recipe/:id', (_, res) => res.send('edit users recipes'));
app.delete('/user/:id/recipe/:id', (_, res) => res.send('delete recipe'));
app.post('/user/:id/recipe', (_, res) => res.send('create new recipe'));

app.get('/user/:id', (_, res) => res.send('user id'));

app.get('/user', (_, res) => res.send('user'));
app.patch('/user', (_, res) => res.send('edit user(image)'));

app.listen(80, () => {
  // eslint-disable-next-line no-console
  console.log('Server is up and running.\nListening on port 80');
});
