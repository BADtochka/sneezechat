import { wsServer } from './ws';

export default () => {
  wsServer.on('user:typing', (data) => wsServer.broadcast('user:typing', data));
};
