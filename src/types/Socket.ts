import { MessageData } from './Message';
import { User } from './User';
import { UUID } from './UUID';

export type ServerToClient = {
  'message:new': MessageData;
  'message:update': MessageData;
  'message:delete': UUID;

  'user:joined': { test: 'lol' };
  'user:typing': Pick<User, 'id' | 'name'> & {
    typing: boolean;
  };
};

export type ClientToServer = {
  'user:typing': Pick<User, 'id' | 'name'> & {
    typing: boolean;
  };
};

export type ServerEvent<T extends keyof ServerToClient = keyof ServerToClient> = {
  type: T;
  data: ServerToClient[T];
};
