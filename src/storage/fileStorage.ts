// Use legacy API because it handles Android content:// URIs from DocumentPicker/ImagePicker
import {
  documentDirectory,
  getInfoAsync,
  copyAsync,
  deleteAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

const MEDIA_DIR = documentDirectory + 'media/';

export async function ensureMediaDirectory(): Promise<void> {
  const info = await getInfoAsync(MEDIA_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
  }
}

export async function copyMediaToAppStorage(sourceUri: string, filename: string): Promise<string> {
  await ensureMediaDirectory();
  const dest = MEDIA_DIR + filename;
  await copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteMediaFile(localUri: string): Promise<void> {
  try {
    const info = await getInfoAsync(localUri);
    if (info.exists) {
      await deleteAsync(localUri, { idempotent: true });
    }
  } catch {}
}

export function resolveMediaUri(relative: string): string {
  if (relative.startsWith('file://') || relative.startsWith('content://') || relative.startsWith('http')) {
    return relative;
  }
  return (documentDirectory ?? '') + relative;
}
