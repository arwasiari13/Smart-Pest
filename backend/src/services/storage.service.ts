import path from 'path';
import { env } from '../config/env';

export type StoredFile = {
  imageUrl: string;
  imagePath: string;
};

export async function storeLocalFile(file: { filename: string }): Promise<StoredFile> {
  const relativePath = path.posix.join('captures', file.filename);
  return {
    imagePath: relativePath,
    imageUrl: `${env.PUBLIC_API_URL}/uploads/${file.filename}`,
  };
}
