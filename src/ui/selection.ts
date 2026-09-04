export type WorkspaceSelection =
  | { kind: 'none' }
  | { kind: 'section'; sectionId: string }
  | { kind: 'rung'; sectionId: string; rungId: string }
  | {
      kind: 'cells';
      sectionId: string;
      rungId: string;
      cells: { col: number; row: number }[];
    }
  | { kind: 'symbol'; symbolId: string }
  | { kind: 'grafcet-node'; sectionId: string; nodeId: string }
  | { kind: 'grafcet-edge'; sectionId: string; edgeId: string };

export type EditorTool =
  | 'select'
  | 'normallyOpenContact'
  | 'normallyClosedContact'
  | 'coil'
  | 'setCoil'
  | 'resetCoil'
  | 'horizontalLink'
  | 'verticalLink'
  | 'functionBlock'
  | 'compare'
  | 'operate'
  | 'grafcet-step'
  | 'grafcet-initial'
  | 'grafcet-transition';
