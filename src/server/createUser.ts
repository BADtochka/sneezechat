import { db } from '@/db';
import { users } from '@/db/schema';
import { createUserSchema } from '@/schemas/user.schema.ts';
import { User } from '@/types/User';
import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';

export const createUser = createServerFn({
  method: 'POST',
})
  .inputValidator(createUserSchema)
  .handler(async ({ data: newUser }) => {
    const existedUser = await db.query.users.findFirst({
      where: eq(users.name, newUser.name),
    });
    let userToReturn;

    if (existedUser) {
      existedUser.nameColor = newUser.nameColor;
      userToReturn = await updateUser(existedUser);
    } else {
      const createdUser = await db.insert(users).values(newUser).returning();
      userToReturn = createdUser[0];
    }

    return userToReturn;
  });

const updateUser = async (userToUpdate: User): Promise<User> => {
  return (
    await db.update(users).set({ nameColor: userToUpdate.nameColor }).where(eq(users.id, userToUpdate.id)).returning()
  )[0];
};
