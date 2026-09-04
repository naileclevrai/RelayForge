import { createId } from '@core';
import type { GrafcetBody, GrafcetNode } from './types.ts';

export function createGrafcetNode(
  kind: GrafcetNode['kind'],
  number: number,
  position: { x: number; y: number },
): GrafcetNode {
  return {
    id: createId(kind),
    kind,
    number,
    label: '',
    x: position.x,
    y: position.y,
    actions: [],
    receptivity: '',
  };
}

export function createEmptyGrafcetBody(): GrafcetBody {
  const initial = createGrafcetNode('initialStep', 0, { x: 240, y: 40 });
  const transition = createGrafcetNode('transition', 1, { x: 240, y: 160 });
  const step = createGrafcetNode('step', 1, { x: 240, y: 280 });
  return {
    nodes: [initial, transition, step],
    edges: [
      {
        id: createId('edge'),
        kind: 'sequence',
        source: initial.id,
        target: transition.id,
      },
      {
        id: createId('edge'),
        kind: 'sequence',
        source: transition.id,
        target: step.id,
      },
    ],
  };
}
