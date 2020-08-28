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
  id?: number;
  message?: string;
}

class WsApp {
  private wsServer: WebSocket.Server;

  private sessions: Session = {};

  public listen(port: number): WebSocket.Server {
    this.wsServer = new WebSocket.Server({ port }, () =>
      // eslint-disable-next-line no-console
      console.log('WebSocket server listening on port:', port)
    );
    this.wsServer.on('connection', (wSocket) => {
      wSocket.on('message', async (data) => {
        if (data === 'ping') {
          wSocket.send('pong');
          return;
        }
        const cData = JSON.parse(data as string) as ClientData;
        if (cData.token) {
          const mainUserId = Number(cData.token);
          const peerUserId = cData.payload.id;
          if (!this.sessions[mainUserId]) this.sessions[mainUserId] = wSocket;
          let error;
          switch (cData.command) {
            case 'add_friend':
              if (
                await User.hasFriendRequest(peerUserId, mainUserId).catch(
                  () => {
                    error = { error: 'could not add' };
                  }
                )
              ) {
                await User.createFriend({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  error = { error: 'could not add' };
                });
                await User.createFriend({
                  main_user_id: peerUserId,
                  peer_user_id: mainUserId,
                }).catch(() => {
                  error = { error: 'could not add' };
                });
              } else error = { error: 'no request found' };
              break;
            case 'request_friend':
              if (
                !(await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  error = { error: 'you are friends' };
                })) &&
                !(await User.isBlockedBy(peerUserId, mainUserId).catch(() => {
                  error = { error: 'could not request' };
                }))
              )
                User.createFriendRequest({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  error = { error: 'could not request' };
                });
              break;
            case 'message_friend':
              if (
                await User.isAuthorized(mainUserId, peerUserId).catch(() => {
                  error = { error: 'not authorized' };
                })
              )
                await User.createMessageQueue({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                  message: cData.payload.message,
                }).catch(() => {
                  error = { error: 'could not message' };
                });
              break;
            case 'block_friend':
              break;
            case 'get_requests':
              break;
            case 'remove_friend':
              if (
                await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  error = { error: 'not a friend' };
                })
              ) {
                await User.deleteFriendByMainPeerId(
                  mainUserId,
                  peerUserId
                ).catch(() => {
                  error = { error: 'cannot remove friend' };
                });

                await User.deleteFriendByMainPeerId(
                  peerUserId,
                  mainUserId
                ).catch(() => {
                  error = { error: 'cannot remove friend' };
                });
              }
              break;
            default:
          }

          if (error) wSocket.send(JSON.stringify(error));
          else
            wSocket.send(
              JSON.stringify({ success: cData.command, payload: cData.payload })
            );
        }
      });
    });
    return Object.freeze(this.wsServer);
  }
}

export default WsApp;
