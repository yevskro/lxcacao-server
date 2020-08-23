import { AddressInfo } from 'net';
import httpApp from './httpApp';

const httpServer = httpApp.listen(3000, () => {
  const { port } = httpServer.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Server is up and running.\nListening on port`, port);
});
