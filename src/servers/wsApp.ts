import WebSocket from 'ws';

interface Session {
  [key: number]: WebSocket;
}

interface ClientData {
  token?: string;
  cmd?: string;
  payload?: Payload;
}

interface Payload {
  id?: string;
  msg?: string;
}

class WsApp {
  private wsServer: WebSocket.Server;

  private sessions: Session[];

  public listen(port: number): WebSocket.Server {
    this.wsServer = new WebSocket.Server({ port }, () =>
      // eslint-disable-next-line no-console
      console.log('WebSocket server listening on port:', port)
    );
    this.wsServer.on('connection', (wSocket) => {
      wSocket.on('message', (data) => {
        if (data === 'ping') {
          wSocket.send('pong');
          return;
        }
        const cData = data as ClientData;
        if (cData.token) {
          if (!this.sessions[cData.token]) this.sessions[cData.token] = wSocket;
          switch (cData.cmd) {
            case 'add_friend':
              break;
            case 'remove_friend':
              break;
            case 'block_friend':
              break;
            case 'msg_friend':
              break;
            default:
          }
        }
      });
    });
    return Object.freeze(this.wsServer);
  }
}

export default WsApp;
