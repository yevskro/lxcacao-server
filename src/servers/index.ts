import HttpApp from './httpApp';
import WsApp from './wsApp';

new WsApp().listen(80, new HttpApp());
