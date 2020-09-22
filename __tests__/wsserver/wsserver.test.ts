import WebSocket from 'ws';
import tcpPortUsed from 'tcp-port-used';
import { Server } from 'http';
import testSetupDbHelper from '../helpers/testSetupDbHelper';
import HttpApp from '../../src/servers/httpApp';
import WsApp from '../../src/servers/wsApp';

describe('websocket server', () => {
  let wsClient: WebSocket;
  let wsServer: Server;

  beforeAll(async () => {
    const portIsFree = !(await tcpPortUsed.check(3000, '127.0.0.1'));
    if (portIsFree) {
      wsServer = new WsApp().listen(3000, new HttpApp());
    }
  });

  afterAll(() => {
    if (wsServer) wsServer.close();
    wsClient.close();
  });

  afterEach((done) => {
    wsClient.removeAllListeners();
    done();
  }, 1500);

  it('can connect', (done) => {
    wsClient = new WebSocket('ws://localhost/');
    wsClient.on('open', () => done());
  });

  it('can clear and setup a testdb', async () => {
    expect(await testSetupDbHelper()).toBe(true);
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
        error: 'could not add friend',
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
      if (clientData.command === 'get_requests') {
        expect(clientData.error).toBe(undefined);
        expect(Array.isArray(clientData.payload)).toBe(true);
        expect(clientData.payload[0].peer_user_id).toBe(1);
        done();
      }
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

  xit('can message a friend', (done) => {
    wsClient.on('message', (data) => {
      console.log({ data });
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

  xit('can get all messages of a user', (done) => {
    wsClient.on('message', (data) => {
      const clientData = JSON.parse(data as string);
      if (clientData.command === 'get_messages') {
        expect(clientData.error).toBe(undefined);
        expect(Array.isArray(clientData.payload)).toBe(true);
        console.log({ clientData });
        expect(clientData.payload[0].message).toStrictEqual('how are you?');
        done();
      }
    });
    wsClient.send(
      JSON.stringify({
        token: '2',
        command: 'get_messages',
      })
    );
  });

  xit('can remove a friend', (done) => {
    wsClient.on('message', (data) => {
      const clientData = JSON.parse(data as string);
      if (clientData.command === 'remove_friend') {
        expect(JSON.parse(data as string).error).toBe(undefined);
        done();
      }
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
