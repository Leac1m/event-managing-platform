import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router.js';
import { Context } from './trpc/trpc.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from the frontend
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  // If not a tRPC or static file request, serve index.html for SPA routing
  if (!req.path.startsWith('/trpc')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
