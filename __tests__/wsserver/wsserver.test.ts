import WebSocket from 'ws';
import { doesNotMatch } from 'assert';
import testSetupDbHelper from '../helpers/testSetupDbHelper';

describe('websocket server', () => {
  let wsClient: WebSocket;
  beforeAll(() => {
    wsClient = new WebSocket('ws://localhost:3001');
  });

  afterAll(() => {
    wsClient.close();
  });

  afterEach(() => {
    wsClient.removeAllListeners();
  });

  it('can connect', (done) => {
    wsClient.on('open', () => done());
  });

  it('can clear and setup a testdb', async (done) => {
    expect(await testSetupDbHelper()).toBe(true);
    done();
  });

  it('can ping pong', (done) => {
    wsClient.on('message', (data) => {
      console.log(data);
      expect(data).toStrictEqual('pong');
      done();
    });
    wsClient.send('ping');
  });

  it('can not add a friend', (done) => {
    wsClient.on('message', (data) => {
      expect(JSON.parse(data as string)).toStrictEqual({
        error: 'no request found',
      });
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '1',
        command: 'add_friend',
        payload: { id: 2 },
      })
    );
  });

  it('can request a friend', (done) => {
    wsClient.on('message', (data) => {
      expect(JSON.parse(data as string).error).toBe(undefined);
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '2',
        command: 'request_friend',
        payload: { id: 1 },
      })
    );
  });

  it('can add a friend', (done) => {
    wsClient.on('message', (data) => {
      expect(JSON.parse(data as string).error).toBe(undefined);
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '1',
        command: 'add_friend',
        payload: { id: 2 },
      })
    );
  });

  it('can remove a friend', (done) => {
    wsClient.on('message', (data) => {
      expect(JSON.parse(data as string).error).toBe(undefined);
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '1',
        command: 'remove_friend',
        payload: { id: 2 },
      })
    );
  });
});
