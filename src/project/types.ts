import type { GrafcetBody } from '@grafcet';
import type { LadderBody } from '@ladder';

export const PROJECT_FORMAT = 'relayforge-project';
export const PROJECT_FORMAT_VERSION = 1;

export type PlcDataType = 'bool' | 'byte' | 'word' | 'dint' | 'real' | 'timer' | 'counter';

export interface ProjectMeta {
  name: string;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface ProjectTargetRef {
  family: string;
  cpu?: string;
}

export interface SymbolDefinition {
  id: string;
  name: string;
  address: string;
  dataType: PlcDataType;
  comment: string;
}

interface SectionBase {
  id: string;
  name: string;
  comment: string;
}

export interface LadderSection extends SectionBase {
  kind: 'ladder';
  body: LadderBody;
}

export interface GrafcetSection extends SectionBase {
  kind: 'grafcet';
  body: GrafcetBody;
}

export type Section = LadderSection | GrafcetSection;

export interface RelayForgeProject {
  format: typeof PROJECT_FORMAT;
  formatVersion: number;
  meta: ProjectMeta;
  target: ProjectTargetRef;
  symbols: SymbolDefinition[];
  sections: Section[];
  io: null;
  notes: string;
}
