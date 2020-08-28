import WebSocket from 'ws';
import User, { MainPeerData } from '../models/User';

interface Session {
  [key: number]: WebSocket;
}

interface ClientData {
  token?: string;
  command?: string;
  payload?: Payload;
}

interface ServerData {
  error?: string;
  command?: string;
  payload?: Payload | MainPeerData | MainPeerData[];
}

interface Payload {
  // eslint-disable-next-line camelcase
  peer_user_id?: number;
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
          const peerUserId = cData.payload
            ? cData.payload.peer_user_id
            : undefined;
          if (!this.sessions[mainUserId]) this.sessions[mainUserId] = wSocket;
          const serverResponse: ServerData = {
            command: cData.command,
            payload: cData.payload,
          };
          switch (cData.command) {
            case 'add_friend':
              if (
                await User.hasFriendRequest(peerUserId, mainUserId).catch(
                  () => {
                    serverResponse.error = 'could not add';
                  }
                )
              ) {
                await User.createFriend({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  serverResponse.error = 'could not add';
                });
                await User.createFriend({
                  main_user_id: peerUserId,
                  peer_user_id: mainUserId,
                }).catch(() => {
                  serverResponse.error = 'could not add';
                });
                await User.deleteFriendRequestByMainPeerId(
                  peerUserId,
                  mainUserId
                ).catch(() => {
                  serverResponse.error = 'could not add';
                });
              } else serverResponse.error = 'no request found';
              break;
            case 'get_requests':
              serverResponse.payload = (await User.readAllFriendRequests(
                mainUserId,
                {
                  peer_user_id: true,
                }
              ).catch(() => {
                serverResponse.error = 'could not get friend requests';
              })) as MainPeerData[];
              break;
            case 'request_friend':
              if (
                !(await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'you are friends';
                })) &&
                !(await User.isBlockedBy(peerUserId, mainUserId).catch(() => {
                  serverResponse.error = 'could not request';
                }))
              )
                User.createFriendRequest({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  serverResponse.error = 'could not request';
                });
              console.log('end of request_friend');
              break;
            case 'message_friend':
              if (
                await User.isAuthorized(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'not authorized';
                })
              )
                await User.createMessageQueue({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                  message: cData.payload.message,
                }).catch(() => {
                  serverResponse.error = 'could not message';
                });
              break;
            case 'block_friend':
              break;
            case 'remove_friend':
              if (
                await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'not a friend';
                })
              ) {
                await User.deleteFriendByMainPeerId(
                  mainUserId,
                  peerUserId
                ).catch(() => {
                  serverResponse.error = 'cannot remove friend';
                });

                await User.deleteFriendByMainPeerId(
                  peerUserId,
                  mainUserId
                ).catch(() => {
                  serverResponse.error = 'cannot remove friend';
                });
              }
              break;
            default:
          }

          if (serverResponse.error)
            wSocket.send(JSON.stringify({ error: serverResponse.error }));
          else {
            wSocket.send(JSON.stringify(serverResponse));
            console.log(cData.command);
          }
        }
      });
    });
    return Object.freeze(this.wsServer);
  }
}

export default WsApp;
