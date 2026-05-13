import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const MAX_PROFILE_IMAGE_BYTES = 500 * 1024;
const PROFILE_IMAGE_WIDTH = 200;
const PROFILE_IMAGE_HEIGHT = 200;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class ProfileImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileImageError';
  }
}

export const getProfileUploadRoot = () => {
  return process.env.PROFILE_UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
};

const getProfileDirectory = (userId: string) => {
  return path.join(getProfileUploadRoot(), 'profiles', userId);
};

export const getPublicProfileUrl = (userId: string, fileName: string) => {
  return path.posix.join('/uploads', 'profiles', userId, fileName);
};

export async function removeProfileImageDirectory(userId: string) {
  await fs.rm(path.join(getProfileUploadRoot(), 'profiles', userId), {
    recursive: true,
    force: true,
  });
}

export async function saveProfileImage(userId: string, file?: Express.Multer.File | null) {
  if (!file) {
    throw new ProfileImageError('Profile image is required');
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw new ProfileImageError('Unsupported profile image format. Use JPEG, PNG, or WebP.');
  }

  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new ProfileImageError('Profile image must be 500KB or smaller.');
  }

  const outputDirectory = getProfileDirectory(userId);
  await fs.mkdir(outputDirectory, { recursive: true });

  const fileName = `${Date.now()}-${randomUUID()}.webp`;
  const absoluteFilePath = path.join(outputDirectory, fileName);

  try {
    const image = sharp(file.buffer, { animated: false }).rotate();
    await image
      .resize(PROFILE_IMAGE_WIDTH, PROFILE_IMAGE_HEIGHT, {
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: 82 })
      .toFile(absoluteFilePath);
  } catch {
    throw new ProfileImageError('Invalid or corrupted profile image file.');
  }

  return getPublicProfileUrl(userId, fileName);
}
