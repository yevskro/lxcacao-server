import WebSocket from 'ws';

/* interface Session {

} */
class WsApp {
  private wsServer: WebSocket.Server;
  // private sessions: Session[];

  public listen(port: number): WebSocket.Server {
    this.wsServer = new WebSocket.Server({ port });
    // eslint-disable-next-line no-console
    console.log('WebSocket server listening on port:', port);
    return Object.freeze(this.wsServer);
  }
}

export default WsApp;
