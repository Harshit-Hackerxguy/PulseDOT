import type { Track } from '../types';

const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|oga|m4a|aac|flac|opus|webm|weba)$/i;

export const AUDIO_PICKER_TYPES = [
  {
    description: 'Audio files',
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.opus', '.webm', '.weba'],
    },
  },
];

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || AUDIO_EXTENSIONS.test(file.name);
}

/** "Artist - Title.mp3" → { artist, title }. Falls back to "Unknown Artist". */
function parseFileName(fileName: string): { title: string; artist: string } {
  const base = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
  const parts = base.split(/\s+-\s+/);
  if (parts.length >= 2) {
    const [artist, ...rest] = parts;
    return { artist: (artist ?? '').trim() || 'Unknown Artist', title: rest.join(' - ').trim() };
  }
  return { artist: 'Unknown Artist', title: base || fileName };
}

function makeId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/** Converts File objects into playable Track records backed by blob: object URLs. */
export function filesToTracks(files: Iterable<File>): Track[] {
  const tracks: Track[] = [];
  for (const file of files) {
    if (!isAudioFile(file)) continue;
    const { title, artist } = parseFileName(file.name);
    tracks.push({
      id: makeId(file),
      title,
      artist,
      fileName: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type || 'audio/*',
      duration: null,
    });
  }
  return tracks.sort((a, b) => a.title.localeCompare(b.title));
}

/** Reads the duration of an audio URL using a throwaway Audio element. */
export function readDuration(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const probe = new Audio();
    probe.preload = 'metadata';
    const done = (value: number | null) => {
      probe.removeAttribute('src');
      probe.load();
      resolve(value);
    };
    probe.onloadedmetadata = () => done(Number.isFinite(probe.duration) ? probe.duration : null);
    probe.onerror = () => done(null);
    probe.src = url;
  });
}

/** Recursively collects audio files from a directory handle (File System Access API). */
export async function collectFilesFromDirectory(dir: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  const iterable = dir as unknown as { values(): AsyncIterable<FileSystemHandle> };
  for await (const entry of iterable.values()) {
    if (entry.kind === 'file') {
      const file = await (entry as FileSystemFileHandle).getFile();
      if (isAudioFile(file)) files.push(file);
    } else if (entry.kind === 'directory') {
      files.push(...(await collectFilesFromDirectory(entry as FileSystemDirectoryHandle)));
    }
  }
  return files;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}
