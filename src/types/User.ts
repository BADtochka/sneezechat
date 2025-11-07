import { UUID } from './UUID';

export type User = {
  id: UUID;
  name: string;
  createdAt: Date;
  nameColor: string | null;
};
