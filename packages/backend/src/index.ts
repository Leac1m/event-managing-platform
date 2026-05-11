import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router.js';
import { Context } from './trpc/trpc.js';
import { verifyToken } from './utils/auth.js';
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
    createContext: ({ req }): Context => {
      const authHeader = req.headers.authorization;
      let user = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const decoded = verifyToken(token);
          if (
            decoded &&
            typeof decoded === 'object' &&
            'id' in decoded &&
            'username' in decoded &&
            typeof decoded.id === 'string' &&
            typeof decoded.username === 'string'
          ) {
            user = { id: decoded.id, username: decoded.username };
          }
        } catch (error) {
          // Token verification failed, user stays null
        }
      }

      return { user };
    },
  }),
);

// Serve static files from the frontend
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.use((req, res, next) => {
  // If not a tRPC or static file request, serve index.html for SPA routing
  if (!req.path.startsWith('/trpc')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
    return;
  }

  next();
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
