import z from 'zod';

export type UserData = z.infer<typeof userSchema>;

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  nameColor: z.string().nullable(),
  createdAt: z.date(),
});

export const createUserSchema = z.object({
  name: z.string().min(1),
  nameColor: z.string().min(1).nullable().default('#fff'),
});
