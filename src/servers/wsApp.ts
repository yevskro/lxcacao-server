import WebSocket from 'ws';
import User, { MainPeerData, MessageData } from '../models/User';

interface Session {
  [key: number]: WebSocket;
}

interface ClientData {
  token?: string;
  command?: string;
  payload?: ClientPayload;
}

interface ServerData {
  error?: string;
  command?: string;
  payload?:
    | ClientPayload
    | MainPeerData
    | MainPeerData[]
    | MessageData
    | MessageData[];
}

interface ClientPayload {
  // eslint-disable-next-line camelcase
  peer_user_id?: number;
  message?: string;
}

class WsApp {
  private wsServer: WebSocket.Server;

  private sessions: Session = {};

  public listen(port: number): WebSocket.Server {
    this.wsServer = new WebSocket.Server({ port }, () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket server listening on port:', port);
    });
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
                    serverResponse.error = 'cannot be authorized';
                  }
                )
              ) {
                await User.createFriend({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  serverResponse.error = 'cannot add';
                });
                await User.createFriend({
                  main_user_id: peerUserId,
                  peer_user_id: mainUserId,
                }).catch(() => {
                  serverResponse.error = 'cannot add';
                });
                await User.deleteFriendRequestByMainPeerId(
                  peerUserId,
                  mainUserId
                ).catch(() => {
                  serverResponse.error = 'cannot add';
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
                serverResponse.error = 'cannot get friend requests';
              })) as MainPeerData[];
              break;
            case 'request_friend':
              if (
                !(await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'cannot be authorized';
                })) &&
                !(await User.isBlockedBy(peerUserId, mainUserId).catch(() => {
                  serverResponse.error = 'cannot be authorized';
                }))
              )
                User.createFriendRequest({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  serverResponse.error = 'cannot request';
                });
              else serverResponse.error = 'cannot request';
              break;
            case 'message_friend':
              if (
                await User.isAuthorized(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'cannot be authorized';
                })
              )
                await User.createMessageQueue({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                  message: cData.payload.message,
                }).catch(() => {
                  serverResponse.error = 'cannot message';
                });
              else serverResponse.error = 'cannot be authorized';
              break;
            case 'get_messages':
              serverResponse.payload = (await User.readAllMessagesQueueByPeerUserId(
                mainUserId,
                {
                  main_user_id: true,
                  create_date: true,
                  message: true,
                }
              ).catch(() => {
                serverResponse.error = 'cannot read all messages';
              })) as MessageData[];

              await User.deleteAllMessageQueueByMainUserId(mainUserId).catch(
                () => {
                  serverResponse.error = 'cannot delete all messages';
                }
              );
              break;
            case 'block_friend':
              if (
                await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'cannot authorize';
                })
              )
                await User.createBlock({
                  main_user_id: mainUserId,
                  peer_user_id: peerUserId,
                }).catch(() => {
                  serverResponse.error = 'cannot create block';
                });
              else serverResponse.error = 'cannot block friend';
              break;
            case 'unblock_friend':
              if (
                await User.isBlockedBy(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'cannot authorize';
                })
              )
                await User.deleteBlockByMainPeerId(
                  mainUserId,
                  peerUserId
                ).catch(() => {
                  serverResponse.error = 'cannot delete block';
                });
              else serverResponse.error = 'cannot block';
              break;
            case 'remove_friend':
              if (
                await User.isFriendsWith(mainUserId, peerUserId).catch(() => {
                  serverResponse.error = 'cannot authorize';
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
              } else serverResponse.error = 'cannot delete friend';

              break;
            default:
          }

          if (serverResponse.error)
            wSocket.send(JSON.stringify({ error: serverResponse.error }));
          else wSocket.send(JSON.stringify(serverResponse));
        }
      });
    });
    return Object.freeze(this.wsServer);
  }
}

export default WsApp;
