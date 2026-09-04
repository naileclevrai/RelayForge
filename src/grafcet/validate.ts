import { diagnostic, type Diagnostic } from '@core';
import type { PlcTarget } from '@targets';
import type { GrafcetBody } from './types.ts';

export interface GrafcetSymbolRef {
  name: string;
  address: string;
}

export interface GrafcetSectionRef {
  id: string;
  name: string;
  body: GrafcetBody;
}

export function validateGrafcetSection(
  symbols: GrafcetSymbolRef[],
  section: GrafcetSectionRef,
  target: PlcTarget,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const initials = section.body.nodes.filter((node) => node.kind === 'initialStep');
  if (initials.length === 0) {
    diagnostics.push(
      diagnostic(
        'error',
        'GRAFCET_NO_INITIAL',
        `GRAFCET section "${section.name}" needs an initial step.`,
        {
          sectionId: section.id,
        },
      ),
    );
  }
  for (const node of section.body.nodes) {
    const location = { sectionId: section.id, nodeId: node.id };
    if (node.kind === 'transition' && !node.receptivity.trim()) {
      diagnostics.push(
        diagnostic(
          'warning',
          'GRAFCET_RECEPTIVITY_EMPTY',
          `Transition ${node.number} has no receptivity.`,
          location,
        ),
      );
    }
    if (node.kind === 'transition' && node.receptivity.trim()) {
      const symbol = symbols.find(
        (item) =>
          item.name.toLowerCase() === node.receptivity.toLowerCase() ||
          item.address.toLowerCase() === node.receptivity.toLowerCase(),
      );
      const parsed = target.parseAddress(symbol?.address || node.receptivity);
      if (!parsed.ok) {
        diagnostics.push(
          diagnostic('error', 'GRAFCET_RECEPTIVITY_INVALID', parsed.error, location),
        );
      } else if (!target.roleFits(parsed.address, 'booleanRead')) {
        diagnostics.push(
          diagnostic(
            'error',
            'GRAFCET_RECEPTIVITY_ROLE',
            `${parsed.address.normalized} is not a boolean condition.`,
            location,
          ),
        );
      }
    }
    for (const action of node.actions) {
      if (!action.operand.trim()) {
        diagnostics.push(
          diagnostic(
            'warning',
            'GRAFCET_ACTION_EMPTY',
            `Step ${node.number} has an action without an operand.`,
            {
              sectionId: section.id,
              nodeId: node.id,
            },
          ),
        );
        continue;
      }
      const symbol = symbols.find(
        (item) =>
          item.name.toLowerCase() === action.operand.toLowerCase() ||
          item.address.toLowerCase() === action.operand.toLowerCase(),
      );
      const parsed = target.parseAddress(symbol?.address || action.operand);
      if (!parsed.ok) {
        diagnostics.push(diagnostic('error', 'GRAFCET_ACTION_INVALID', parsed.error, location));
      } else if (!target.roleFits(parsed.address, 'booleanWrite')) {
        diagnostics.push(
          diagnostic(
            'error',
            'GRAFCET_ACTION_ROLE',
            `${parsed.address.normalized} cannot be used as an action operand.`,
            location,
          ),
        );
      }
    }
  }
  for (const edge of section.body.edges) {
    const source = section.body.nodes.find((node) => node.id === edge.source);
    const targetNode = section.body.nodes.find((node) => node.id === edge.target);
    if (!source || !targetNode) {
      diagnostics.push(
        diagnostic('error', 'GRAFCET_DANGLING_LINK', 'Link points to a missing node.', {
          sectionId: section.id,
          edgeId: edge.id,
        }),
      );
    }
  }
  return diagnostics;
}
