import { createId } from '@core';
import { createGrafcetNode } from './factory.ts';
import type {
  GrafcetAction,
  GrafcetBody,
  GrafcetEdge,
  GrafcetLinkKind,
  GrafcetNode,
} from './types.ts';

function nextStepNumber(body: GrafcetBody): number {
  const used = body.nodes.filter((node) => node.kind !== 'transition').map((node) => node.number);
  return used.length === 0 ? 0 : Math.max(...used) + 1;
}

export function addGrafcetNode(
  body: GrafcetBody,
  kind: GrafcetNode['kind'],
  position: { x: number; y: number },
): GrafcetBody {
  const number =
    kind === 'transition'
      ? body.nodes.filter((node) => node.kind === 'transition').length + 1
      : nextStepNumber(body);
  return {
    ...body,
    nodes: [...body.nodes, createGrafcetNode(kind, number, position)],
  };
}

export function updateGrafcetNode(
  body: GrafcetBody,
  nodeId: string,
  patch: Partial<GrafcetNode>,
): GrafcetBody {
  return {
    ...body,
    nodes: body.nodes.map((node) =>
      node.id === nodeId ? { ...node, ...patch, id: node.id } : node,
    ),
  };
}

export function removeGrafcetNode(body: GrafcetBody, nodeId: string): GrafcetBody {
  return {
    nodes: body.nodes.filter((node) => node.id !== nodeId),
    edges: body.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  };
}

export function addGrafcetEdge(
  body: GrafcetBody,
  source: string,
  target: string,
  kind: GrafcetLinkKind = 'sequence',
): GrafcetBody {
  if (source === target) {
    return body;
  }
  if (body.edges.some((edge) => edge.source === source && edge.target === target)) {
    return body;
  }
  const edge: GrafcetEdge = {
    id: createId('edge'),
    kind,
    source,
    target,
  };
  return { ...body, edges: [...body.edges, edge] };
}

export function updateGrafcetEdge(
  body: GrafcetBody,
  edgeId: string,
  patch: Partial<GrafcetEdge>,
): GrafcetBody {
  return {
    ...body,
    edges: body.edges.map((edge) =>
      edge.id === edgeId ? { ...edge, ...patch, id: edge.id } : edge,
    ),
  };
}

export function removeGrafcetEdge(body: GrafcetBody, edgeId: string): GrafcetBody {
  return {
    ...body,
    edges: body.edges.filter((edge) => edge.id !== edgeId),
  };
}

export function addGrafcetAction(
  body: GrafcetBody,
  nodeId: string,
  action?: Partial<GrafcetAction>,
): GrafcetBody {
  return {
    ...body,
    nodes: body.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            actions: [
              ...node.actions,
              {
                id: createId('action'),
                qualifier: action?.qualifier ?? 'N',
                operand: action?.operand ?? '',
              },
            ],
          }
        : node,
    ),
  };
}

export function updateGrafcetAction(
  body: GrafcetBody,
  nodeId: string,
  actionId: string,
  patch: Partial<GrafcetAction>,
): GrafcetBody {
  return {
    ...body,
    nodes: body.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            actions: node.actions.map((action) =>
              action.id === actionId ? { ...action, ...patch, id: action.id } : action,
            ),
          }
        : node,
    ),
  };
}

export function removeGrafcetAction(
  body: GrafcetBody,
  nodeId: string,
  actionId: string,
): GrafcetBody {
  return {
    ...body,
    nodes: body.nodes.map((node) =>
      node.id === nodeId
        ? { ...node, actions: node.actions.filter((action) => action.id !== actionId) }
        : node,
    ),
  };
}

export function moveGrafcetNode(
  body: GrafcetBody,
  nodeId: string,
  position: { x: number; y: number },
): GrafcetBody {
  return updateGrafcetNode(body, nodeId, position);
}
