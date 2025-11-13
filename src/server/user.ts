import { db } from '@/db';
import { users } from '@/db/schema';
import { createUserSchema } from '@/schemas/user.schema.ts';
import { CreateUser, User } from '@/types/User';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { wsServer } from './ws';

export const createUser = createServerFn({
  method: 'POST',
})
  .inputValidator(createUserSchema)
  .handler(async ({ data: newUser }) => {
    return createUserInDB(newUser);
  });

export const createUserInDB = async (newUser: CreateUser): Promise<User> => {
  const existedUser = await db.query.users.findFirst({
    where: eq(users.name, newUser.name),
  });
  let userToReturn;

  if (existedUser) {
    existedUser.nameColor = newUser.nameColor;
    userToReturn = await _updateUser(existedUser);
    wsServer.broadcast('user:update', userToReturn);
  } else {
    const createdUser = await db.insert(users).values(newUser).returning();
    userToReturn = createdUser[0];
  }
  return userToReturn;
};

const _updateUser = async (user: User): Promise<User> => {
  const updatedUsers = await db
    .update(users)
    .set({ nameColor: user.nameColor })
    .where(eq(users.id, user.id))
    .returning();

  return updatedUsers.pop()!;
};
