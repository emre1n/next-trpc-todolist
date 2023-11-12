import db from '@/server/db';
import { publicProcedure, router } from '../trpc';

import { z } from 'zod';

export const todoRouter = router({
  getTodos: publicProcedure.query(async () => {
    return await db.todo.findMany();
  }),
  addTodo: publicProcedure.input(z.string()).mutation(async opts => {
    return await db.todo.create({ data: { content: opts.input, done: false } });
  }),
  setDone: publicProcedure
    .input(
      z.object({
        id: z.number(),
        done: z.boolean(),
      })
    )
    .mutation(async opts => {
      const { id, done } = opts.input;

      return await db.todo.update({
        where: { id },
        data: { done },
      });
    }),
});
