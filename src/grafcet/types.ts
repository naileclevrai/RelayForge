export type GrafcetNodeKind = 'step' | 'initialStep' | 'transition';
export type GrafcetLinkKind = 'sequence' | 'orBranch' | 'andBranch';
export type ActionQualifier = 'N' | 'S' | 'R' | 'P' | 'C';

export interface GrafcetAction {
  id: string;
  qualifier: ActionQualifier;
  operand: string;
}

export interface GrafcetNode {
  id: string;
  kind: GrafcetNodeKind;
  number: number;
  label: string;
  x: number;
  y: number;
  actions: GrafcetAction[];
  receptivity: string;
}

export interface GrafcetEdge {
  id: string;
  kind: GrafcetLinkKind;
  source: string;
  target: string;
}

export interface GrafcetBody {
  nodes: GrafcetNode[];
  edges: GrafcetEdge[];
}
