import { createUserSchema } from '@/schemas/user.schema.ts';
import { createIsomorphicFn, createServerFn } from '@tanstack/react-start';
import { createUserInDB } from './user.service';

export const createUser = createServerFn({
  method: 'POST',
})
  .inputValidator(createUserSchema)
  .handler(async ({ data: newUser }) => {
    return createUserInDB(newUser);
  });

export const test = createIsomorphicFn().client(() => console.log('test'));
