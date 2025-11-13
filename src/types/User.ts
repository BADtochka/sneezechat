import { UUID } from './UUID';

export type User = {
  id: UUID;
  name: string;
  createdAt: Date;
  nameColor: string | null;
};

export type PublicUser = Pick<User, 'id' | 'name' | 'nameColor'>;

export type CreateUser = Pick<User, 'name' | 'nameColor'>;
