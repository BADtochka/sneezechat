import { CreateUser, User } from '@/types/User';
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { createUserSchema } from '../schemas/user.schema.ts';
import { defaultError } from '../utils/throwError';
import { wsServer } from './ws';

export const createUserRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(createUserSchema)
  .handler(async ({ data: newUser }) => {
    return createUser(newUser);
  });

export const createUser = createServerOnlyFn(async (newUser: CreateUser): Promise<User> => {
  const existedUser = await db.query.users.findFirst({
    where: eq(users.name, newUser.name),
  });
  let userToReturn: User;

  if (existedUser) {
    existedUser.nameColor = newUser.nameColor;
    const updatedUser = await updateUser(existedUser);
    if (!updatedUser) throw defaultError();
    userToReturn = updatedUser;
    wsServer.broadcast('user:update', userToReturn);
  } else {
    const createdUser = await db.insert(users).values(newUser).returning();
    userToReturn = createdUser[0];
  }
  return userToReturn;
});

const updateUser = createServerOnlyFn(async (user: User) => {
  const updatedUsers = await db
    .update(users)
    .set({ nameColor: user.nameColor })
    .where(eq(users.id, user.id))
    .returning();

  return updatedUsers[0];
});
