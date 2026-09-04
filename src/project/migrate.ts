import { createEmptyGrafcetBody } from '@grafcet';
import {
  createEmptyLadderBody,
  DEFAULT_LADDER_COLUMNS,
  type LadderBody,
  type LadderRung,
} from '@ladder';
import { createId } from '@core';
import {
  PROJECT_FORMAT,
  PROJECT_FORMAT_VERSION,
  type GrafcetSection,
  type LadderSection,
  type PlcDataType,
  type ProjectMeta,
  type ProjectTargetRef,
  type RelayForgeProject,
  type Section,
  type SymbolDefinition,
} from './types.ts';

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    throw new Error(`Invalid project: ${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function migrateMeta(raw: unknown): ProjectMeta {
  const meta = asRecord(raw ?? {}, 'meta');
  const now = new Date().toISOString();
  return {
    name: asString(meta.name, 'Untitled'),
    createdAt: asString(meta.createdAt, now),
    updatedAt: asString(meta.updatedAt, now),
    author: asString(meta.author),
  };
}

function migrateTarget(raw: unknown): ProjectTargetRef {
  const target = asRecord(raw ?? {}, 'target');
  const family = asString(target.family);
  if (!family) {
    throw new Error('Invalid project: target.family is required.');
  }
  return {
    family,
    cpu: typeof target.cpu === 'string' ? target.cpu : undefined,
  };
}

const DATA_TYPES: readonly PlcDataType[] = [
  'bool',
  'byte',
  'word',
  'dint',
  'real',
  'timer',
  'counter',
];

function migrateSymbols(raw: unknown): SymbolDefinition[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((item, index) => {
    const symbol = asRecord(item, `symbols[${index}]`);
    const dataType = DATA_TYPES.includes(symbol.dataType as PlcDataType)
      ? (symbol.dataType as PlcDataType)
      : 'bool';
    return {
      id: asString(symbol.id, createId('symbol')),
      name: asString(symbol.name),
      address: asString(symbol.address),
      dataType,
      comment: asString(symbol.comment),
    };
  });
}

function migrateLadderBody(raw: unknown): LadderBody {
  if (typeof raw !== 'object' || raw === null) {
    return createEmptyLadderBody();
  }
  const body = raw as Record<string, unknown>;
  if (!Array.isArray(body.rungs)) {
    return createEmptyLadderBody();
  }
  const rungs: LadderRung[] = body.rungs.map((item, index) => {
    const rung = asRecord(item, `rung[${index}]`);
    return {
      id: asString(rung.id, createId('rung')),
      comment: asString(rung.comment),
      columns: asNumber(rung.columns, DEFAULT_LADDER_COLUMNS),
      rows: Math.max(1, asNumber(rung.rows, 1)),
      cells: Array.isArray(rung.cells) ? (rung.cells as LadderRung['cells']) : [],
    };
  });
  return { rungs: rungs.length > 0 ? rungs : createEmptyLadderBody().rungs };
}

function migrateSection(raw: unknown, index: number): Section {
  const section = asRecord(raw, `sections[${index}]`);
  const name = asString(section.name, `Section ${index + 1}`);
  const comment = asString(section.comment);
  const id = asString(section.id, createId('section'));
  if (section.kind === 'grafcet') {
    const grafcet: GrafcetSection = {
      id,
      kind: 'grafcet',
      name,
      comment,
      body:
        typeof section.body === 'object' && section.body !== null
          ? (section.body as GrafcetSection['body'])
          : createEmptyGrafcetBody(),
    };
    return grafcet;
  }
  const ladder: LadderSection = {
    id,
    kind: 'ladder',
    name,
    comment,
    body: migrateLadderBody(section.body),
  };
  return ladder;
}

export function migrateProject(raw: unknown): RelayForgeProject {
  const record = asRecord(raw, 'project');
  if (record.format !== PROJECT_FORMAT) {
    throw new Error(`Unknown project format: ${String(record.format)}`);
  }
  const formatVersion = asNumber(record.formatVersion, 0);
  if (formatVersion < 1) {
    throw new Error(`Unsupported project formatVersion: ${formatVersion}`);
  }
  if (formatVersion > PROJECT_FORMAT_VERSION) {
    throw new Error(
      `Project formatVersion ${formatVersion} is newer than this RelayForge (${PROJECT_FORMAT_VERSION}).`,
    );
  }
  const sections = Array.isArray(record.sections)
    ? record.sections.map((section, index) => migrateSection(section, index))
    : [];
  return {
    format: PROJECT_FORMAT,
    formatVersion: PROJECT_FORMAT_VERSION,
    meta: migrateMeta(record.meta),
    target: migrateTarget(record.target),
    symbols: migrateSymbols(record.symbols),
    sections:
      sections.length > 0
        ? sections
        : [
            {
              id: createId('section'),
              kind: 'ladder',
              name: 'Main',
              comment: '',
              body: createEmptyLadderBody(),
            },
          ],
    io: null,
    notes: asString(record.notes),
  };
}
