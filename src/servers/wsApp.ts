import WebSocket from 'ws';
import User from '../models/User';

interface Session {
  [key: number]: WebSocket;
}

interface ClientData {
  token?: string;
  command?: string;
  payload?: Payload;
}

interface Payload {
  id?: string;
  message?: string;
}

class WsApp {
  private wsServer: WebSocket.Server;

  private sessions: Session[];

  private static addFriend(mainUserId: number, peerUserId: number) {
    if (User.isFriendRequest(mainUserId, peerUserId)) {
      User.createFriend({ main_user_id: mainUserId, peer_user_id: peerUserId });
    }
  }

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
          switch (cData.command) {
            case 'add_friend':
              break;
            case 'request_friend':
              break;
            case 'remove_friend':
              break;
            case 'block_friend':
              break;
            case 'message_friend':
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
