import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { saveProfileImage } from '../utils/profile-image.js';

describe('profile image upload', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `profile-upload-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    process.env.PROFILE_UPLOAD_DIR = tempDir;
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    delete process.env.PROFILE_UPLOAD_DIR;
  });

  it('resizes and saves a valid profile image', async () => {
    const buffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 25, g: 120, b: 255, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const file = {
      buffer,
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File;

    const url = await saveProfileImage('user-123', file);
    expect(url).toMatch(/^\/uploads\/profiles\/user-123\/.*\.webp$/);

    const outputPath = path.join(tempDir, 'profiles', 'user-123', path.basename(url));
    const metadata = await sharp(await fs.readFile(outputPath)).metadata();
    expect(metadata.width).toBe(200);
    expect(metadata.height).toBe(200);
    expect(metadata.format).toBe('webp');
  });

  it('rejects unsupported formats', async () => {
    const buffer = Buffer.from('not-an-image');
    const file = {
      buffer,
      mimetype: 'image/gif',
      size: buffer.length,
    } as Express.Multer.File;

    await expect(saveProfileImage('user-123', file)).rejects.toThrow(
      'Unsupported profile image format. Use JPEG, PNG, or WebP.',
    );
  });

  it('rejects oversized files', async () => {
    const buffer = Buffer.alloc(500 * 1024 + 1, 1);
    const file = {
      buffer,
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File;

    await expect(saveProfileImage('user-123', file)).rejects.toThrow(
      'Profile image must be 500KB or smaller.',
    );
  });

  it('rejects corrupted image buffers', async () => {
    const buffer = Buffer.from('still-not-an-image');
    const file = {
      buffer,
      mimetype: 'image/png',
      size: buffer.length,
    } as Express.Multer.File;

    await expect(saveProfileImage('user-123', file)).rejects.toThrow(
      'Invalid or corrupted profile image file.',
    );
  });
});
