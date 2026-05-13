import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().default('supersecretkey'),
  LOG_LEVEL: z.string().default('info'),
  MAILTRAP_TOKEN: z.string().optional().default('5cae401b38a12c21b68ad7f82110613c'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const formatIssues = (issues: z.ZodIssue[]) =>
  issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`);

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = formatIssues(parsed.error.issues);
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return parsed.data;
}

export const env = loadEnv();

export default env;
