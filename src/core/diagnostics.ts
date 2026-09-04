export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface DiagnosticLocation {
  sectionId?: string;
  rungId?: string;
  cell?: { col: number; row: number };
  nodeId?: string;
  edgeId?: string;
  symbolId?: string;
  path?: string;
}

export interface Diagnostic {
  id: string;
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location?: DiagnosticLocation;
}

export function diagnostic(
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  location?: DiagnosticLocation,
): Diagnostic {
  return {
    id: `${code}:${location?.path ?? location?.sectionId ?? 'project'}:${location?.rungId ?? ''}:${location?.cell?.col ?? ''}:${location?.cell?.row ?? ''}:${location?.nodeId ?? ''}`,
    severity,
    code,
    message,
    location,
  };
}
