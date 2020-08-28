import HttpApp from './httpApp';
import WsApp from './wsApp';

new HttpApp().listen(3000);
new WsApp().listen(3001);
