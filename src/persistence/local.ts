import { parseProject, serializeProject, type RelayForgeProject } from '@project';

export const AUTOSAVE_KEY = 'relayforge.autosave.v1';

export function writeAutosave(project: RelayForgeProject): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(AUTOSAVE_KEY, serializeProject(project));
}

export function readAutosave(): RelayForgeProject | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return parseProject(raw);
  } catch {
    return null;
  }
}

export function clearAutosave(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.removeItem(AUTOSAVE_KEY);
}
