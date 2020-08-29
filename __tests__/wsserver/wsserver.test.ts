import WebSocket from 'ws';
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
        payload: { peer_user_id: 2 },
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
        payload: { peer_user_id: 1 },
      })
    );
  });

  it('can get all requests of an user', (done) => {
    wsClient.on('message', (data) => {
      const clientData = JSON.parse(data as string);
      expect(clientData.error).toBe(undefined);
      expect(Array.isArray(clientData.payload)).toBe(true);
      expect(clientData.payload[0].peer_user_id).toBe(1);
      done();
    });

    wsClient.send(
      JSON.stringify({
        token: '2',
        command: 'get_requests',
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
        payload: { peer_user_id: 2 },
      })
    );
  });

  it('can message a friend', (done) => {
    wsClient.on('message', (data) => {
      expect(JSON.parse(data as string).error).toBe(undefined);
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '1',
        command: 'message_friend',
        payload: { peer_user_id: 2, message: 'how are you?' },
      })
    );
  });

  it('can get all messages of a user', (done) => {
    wsClient.on('message', (data) => {
      const clientData = JSON.parse(data as string);
      expect(clientData.error).toBe(undefined);
      expect(Array.isArray(clientData.payload)).toBe(true);
      expect(clientData.payload[0].message).toStrictEqual('how are you?');
      done();
    });
    wsClient.send(
      JSON.stringify({
        token: '2',
        command: 'get_messages',
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
        payload: { peer_user_id: 2 },
      })
    );
  });
});
