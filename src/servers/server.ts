import express from 'express';
import { worker } from 'cluster';

const app = express();

app.get('/', (_, res) => res.send('hello world. son of a gun'));

app.listen(3000, () => {
  console.log('SERVER is it woorking?? f thats good. LISTENING. yes? omg!');
});
