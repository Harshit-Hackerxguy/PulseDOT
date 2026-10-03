/**
 * Minimal typings for the File System Access API (Chromium-only).
 * Kept optional on `Window` so we always feature-detect before use.
 */

interface PulseFilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface PulseOpenFilePickerOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: PulseFilePickerAcceptType[];
}

interface PulseDirectoryPickerOptions {
  mode?: 'read' | 'readwrite';
}

interface Window {
  showOpenFilePicker?: (options?: PulseOpenFilePickerOptions) => Promise<FileSystemFileHandle[]>;
  showDirectoryPicker?: (options?: PulseDirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
}
