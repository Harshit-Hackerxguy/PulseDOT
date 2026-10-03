import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, RefObject } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import {
  AUDIO_PICKER_TYPES,
  collectFilesFromDirectory,
  filesToTracks,
  isAbortError,
  readDuration,
} from '../utils/audioFiles';

const DURATION_CONCURRENCY = 4;

export interface LocalLibraryApi {
  /** Ref for the hidden multi-file <input> fallback. */
  fileInputRef: RefObject<HTMLInputElement | null>;
  /** Ref for the hidden folder <input webkitdirectory> fallback. */
  folderInputRef: RefObject<HTMLInputElement | null>;
  pickFiles: () => Promise<void>;
  pickFolder: () => Promise<void>;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Ingest files from any source (e.g. drag & drop). */
  addFiles: (files: File[]) => void;
  isLoading: boolean;
  error: string | null;
  lastAdded: number | null;
  supportsFsAccess: boolean;
}

/**
 * Requests access to local audio files, using the File System Access API where
 * available (Chromium) and falling back to a classic <input type="file">.
 */
export function useLocalLibrary(): LocalLibraryApi {
  const addTracks = usePlayerStore((s) => s.addTracks);
  const setTrackDuration = usePlayerStore((s) => s.setTrackDuration);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<number | null>(null);

  const supportsFsAccess = typeof window !== 'undefined' && 'showOpenFilePicker' in window;

  // React doesn't type `webkitdirectory`, so set it imperatively.
  useEffect(() => {
    folderInputRef.current?.setAttribute('webkitdirectory', '');
    folderInputRef.current?.setAttribute('directory', '');
  }, []);

  const ingest = useCallback(
    async (files: File[]) => {
      setError(null);
      const tracks = filesToTracks(files);
      if (tracks.length === 0) {
        setError('No supported audio files were found in your selection.');
        return;
      }
      const added = addTracks(tracks);
      setLastAdded(added);

      // Resolve durations in the background with limited concurrency.
      const queue = tracks.filter((t) => usePlayerStore.getState().tracks.some((x) => x.id === t.id));
      const worker = async () => {
        for (let t = queue.shift(); t; t = queue.shift()) {
          setTrackDuration(t.id, await readDuration(t.url));
        }
      };
      void Promise.all(Array.from({ length: DURATION_CONCURRENCY }, worker));
    },
    [addTracks, setTrackDuration],
  );

  const run = useCallback(
    async (getFiles: () => Promise<File[]>) => {
      setIsLoading(true);
      try {
        await ingest(await getFiles());
      } catch (err) {
        if (!isAbortError(err)) {
          setError(err instanceof Error ? err.message : 'Could not read the selected files.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [ingest],
  );

  const pickFiles = useCallback(async () => {
    if (!window.showOpenFilePicker) {
      fileInputRef.current?.click();
      return;
    }
    const picker = window.showOpenFilePicker;
    await run(async () => {
      const handles = await picker({ multiple: true, types: AUDIO_PICKER_TYPES });
      return Promise.all(handles.map((h) => h.getFile()));
    });
  }, [run]);

  const pickFolder = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      folderInputRef.current?.click();
      return;
    }
    const picker = window.showDirectoryPicker;
    await run(async () => collectFilesFromDirectory(await picker({ mode: 'read' })));
  }, [run]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      e.target.value = ''; // allow re-selecting the same files
      if (files.length) void run(async () => files);
    },
    [run],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length) void run(async () => files);
    },
    [run],
  );

  return {
    fileInputRef,
    folderInputRef,
    pickFiles,
    pickFolder,
    handleInputChange,
    addFiles,
    isLoading,
    error,
    lastAdded,
    supportsFsAccess,
  };
}
