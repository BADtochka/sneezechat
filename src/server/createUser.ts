import { db } from '@/db';
import { users } from '@/db/schema';
import { createUserSchema } from '@/schemas/user.schema.ts';
import { createServerFn } from '@tanstack/react-start';

export const createUser = createServerFn({
  method: 'POST',
})
  .inputValidator(createUserSchema)
  .handler(async ({ data: newUser }) => {
    const createdUser = await db.insert(users).values(newUser).returning();
    return createdUser[0];
  });
