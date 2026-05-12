import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = (() => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'test-secret';
  }

  throw new Error('JWT_SECRET is required');
})();

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, expiresIn: SignOptions['expiresIn'] = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
