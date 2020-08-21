import httpServer from './server';

httpServer.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is up and running.\nListening on port 3000');
});
