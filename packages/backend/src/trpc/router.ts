import { router, publicProcedure } from './trpc.js';
import { z } from 'zod';

export const appRouter = router({
  hello: publicProcedure.input(z.object({ name: z.string().optional() })).query(({ input }) => {
    return {
      greeting: `Hello ${input?.name ?? 'world'}`,
    };
  }),
});

export type AppRouter = typeof appRouter;
