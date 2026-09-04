import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { GrafcetNode } from '@grafcet';

export type GrafcetFlowNode = Node<{ model: GrafcetNode }>;

export function StepNode({ data, selected }: NodeProps<GrafcetFlowNode>) {
  const initial = data.model.kind === 'initialStep';
  return (
    <div
      style={{
        minWidth: 72,
        minHeight: 48,
        padding: 8,
        border: `${initial ? 3 : 1.5}px solid ${selected ? 'var(--accent)' : 'var(--rail)'}`,
        background: 'var(--bg-raised)',
        color: 'var(--text)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.model.number}</div>
      <div style={{ color: 'var(--text-dim)', fontSize: 10 }}>{data.model.label}</div>
      {data.model.actions.map((action) => (
        <div key={action.id} style={{ fontSize: 10, color: 'var(--accent)' }}>
          {action.qualifier} {action.operand}
        </div>
      ))}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function TransitionNode({ data, selected }: NodeProps<GrafcetFlowNode>) {
  return (
    <div style={{ width: 88, textAlign: 'center' }}>
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          margin: '0 auto',
          width: 36,
          height: 6,
          background: selected ? 'var(--accent)' : 'var(--rail)',
        }}
      />
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-dim)',
          marginTop: 4,
        }}
      >
        {data.model.receptivity || '…'}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const grafcetNodeTypes = {
  // eslint-disable-line react-refresh/only-export-components
  step: StepNode,
  initialStep: StepNode,
  transition: TransitionNode,
};
