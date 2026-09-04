import { parseProject, type RelayForgeProject } from '@project';

interface FilePickerAccept {
  description: string;
  accept: Record<string, string[]>;
}

const ACCEPT: FilePickerAccept[] = [
  {
    description: 'RelayForge project',
    accept: { 'application/json': ['.rfp.json', '.json'] },
  },
];

function downloadText(name: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadFiles(files: { name: string; contents: string; mimeType: string }[]): void {
  for (const file of files) {
    downloadText(file.name, file.contents, file.mimeType);
  }
}

export async function openProjectFile(): Promise<{
  project: RelayForgeProject;
  name: string;
} | null> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.rfp.json,application/json,.json';
  return new Promise((resolve) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const text = await file.text();
      resolve({ project: parseProject(text), name: file.name });
    });
    input.click();
  });
}

export async function saveProjectFile(contents: string, suggestedName: string): Promise<boolean> {
  const picker = (
    window as Window & {
      showSaveFilePicker?: (options: {
        suggestedName: string;
        types: FilePickerAccept[];
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: string) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }
  ).showSaveFilePicker;
  if (!picker) {
    downloadText(suggestedName, contents, 'application/json');
    return true;
  }
  try {
    const handle = await picker({ suggestedName, types: ACCEPT });
    const writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false;
    }
    downloadText(suggestedName, contents, 'application/json');
    return true;
  }
}
