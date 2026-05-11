import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router.js';
import { Context } from './trpc/trpc.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: (): Context => ({
      user: null, // TODO: Implement JWT middleware to populate this
    }),
  }),
);

app.get('/', (req, res) => {
  res.send('Event Management API');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
