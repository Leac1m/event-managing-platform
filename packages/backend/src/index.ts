import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import multer from 'multer';
import fs from 'fs/promises';
import { appRouter } from './trpc/router.js';
import { Context } from './trpc/trpc.js';
import { generateToken, verifyToken } from './utils/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { registerUser } from './services/registration.js';
import { ProfileImageError, getProfileUploadRoot, removeProfileImageDirectory, saveProfileImage } from './utils/profile-image.js';
import { sendVerificationEmail } from './utils/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const profileUploadRoot = getProfileUploadRoot();
await fs.mkdir(profileUploadRoot, { recursive: true });
const profileUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024,
    files: 1,
  },
});

const registrationBodySchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  department: z.string().min(1),
  matricNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(profileUploadRoot));

app.post('/api/auth/register', profileUploadMiddleware.single('profileImage'), async (req, res) => {
  let createdUserId: string | undefined;

  try {
    const parsedInput = registrationBodySchema.parse(req.body);
    createdUserId = randomUUID();
    const profileUrl = await saveProfileImage(createdUserId, req.file);
    const newUser = await registerUser({
      id: createdUserId,
      ...parsedInput,
      profileUrl,
    });

    const verificationToken = generateToken({ id: newUser.id, type: 'email_verification' }, '24h');
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    if (error instanceof ProfileImageError) {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Invalid registration data', issues: error.flatten() });
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'Profile image must be 500KB or smaller.' });
        return;
      }

      res.status(400).json({ message: error.message });
      return;
    }

    if (createdUserId) {
      await removeProfileImageDirectory(createdUserId).catch(() => undefined);
    }

    res.status(500).json({ message: 'Failed to register user with profile image.' });
  }
});

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
