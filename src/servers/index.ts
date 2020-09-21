import HttpApp from './httpApp';
import WsApp from './wsApp';

new HttpApp().listen(80);
new WsApp().listen(81);
