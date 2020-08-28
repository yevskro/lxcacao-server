import WebSocket from 'ws';
import { doesNotMatch } from 'assert';

describe('websocket server', () => {
  let wsClient: WebSocket;
  beforeAll((done) => {
    wsClient = new WebSocket('ws://localhost:3001');
    done();
  });

  afterAll((done) => {
    wsClient.close();
    done();
  });

  it('can connect', (done) => {
    wsClient.on('open', () => done());
  });

  it('can ping pong', (done) => {
    wsClient.on('message', (data) => {
      expect(data).toStrictEqual('pong');
      done();
    });
    wsClient.send('ping');
  });
});
