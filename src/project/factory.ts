import { createId } from '@core';
import { createEmptyGrafcetBody } from '@grafcet';
import { createEmptyLadderBody } from '@ladder';
import {
  PROJECT_FORMAT,
  PROJECT_FORMAT_VERSION,
  type RelayForgeProject,
  type Section,
} from './types.ts';

export interface CreateProjectOptions {
  name: string;
  targetFamily: string;
  cpu?: string;
  author?: string;
}

export function createProject(options: CreateProjectOptions): RelayForgeProject {
  const now = new Date().toISOString();
  return {
    format: PROJECT_FORMAT,
    formatVersion: PROJECT_FORMAT_VERSION,
    meta: {
      name: options.name,
      createdAt: now,
      updatedAt: now,
      author: options.author ?? '',
    },
    target: {
      family: options.targetFamily,
      cpu: options.cpu,
    },
    symbols: [],
    sections: [
      {
        id: createId('section'),
        kind: 'ladder',
        name: 'Main',
        comment: '',
        body: createEmptyLadderBody(),
      },
    ],
    io: null,
    notes: '',
  };
}

export function touchProject(project: RelayForgeProject): RelayForgeProject {
  return {
    ...project,
    meta: {
      ...project.meta,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function createLadderSection(name = 'Ladder'): Section {
  return {
    id: createId('section'),
    kind: 'ladder',
    name,
    comment: '',
    body: createEmptyLadderBody(),
  };
}

export function createGrafcetSection(name = 'Chart'): Section {
  return {
    id: createId('section'),
    kind: 'grafcet',
    name,
    comment: '',
    body: createEmptyGrafcetBody(),
  };
}
