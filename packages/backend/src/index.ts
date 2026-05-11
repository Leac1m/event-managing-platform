import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  }),
);

app.get('/', (req, res) => {
  res.send('Event Management API');
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
