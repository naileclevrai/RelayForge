import { addGrafcetEdge, addGrafcetNode, moveGrafcetNode } from '@grafcet';
import type { GrafcetSection } from '@project';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { t } from '../i18n/index.ts';
import { useWorkspace } from '../store/workspace-store.ts';
import { grafcetNodeTypes } from './nodes.tsx';

interface Props {
  section: GrafcetSection;
}

function toNodes(section: GrafcetSection): Node[] {
  return section.body.nodes.map((node) => ({
    id: node.id,
    type: node.kind,
    position: { x: node.x, y: node.y },
    data: { model: node },
  }));
}

function toEdges(section: GrafcetSection): Edge[] {
  return section.body.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.kind === 'sequence' ? '' : edge.kind === 'andBranch' ? 'AND' : 'OR',
    style: {
      stroke: edge.kind === 'andBranch' ? '#f5a524' : '#8b93a7',
      strokeWidth: edge.kind === 'andBranch' ? 2.4 : 1.4,
    },
  }));
}

export function GrafcetEditor({ section }: Props) {
  const tool = useWorkspace((state) => state.tool);
  const setTool = useWorkspace((state) => state.setTool);
  const setSelection = useWorkspace((state) => state.setSelection);
  const applyGrafcet = useWorkspace((state) => state.applyGrafcet);

  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }
    applyGrafcet(section.id, (body) =>
      addGrafcetEdge(body, connection.source, connection.target, 'sequence'),
    );
  };

  return (
    <div className="editor-wrap">
      <div className="editor-tools">
        <button className={tool === 'select' ? 'active' : ''} onClick={() => setTool('select')}>
          {t('selectTool')}
        </button>
        <button
          className={tool === 'grafcet-initial' ? 'active' : ''}
          onClick={() => setTool('grafcet-initial')}
        >
          {t('initialStep')}
        </button>
        <button
          className={tool === 'grafcet-step' ? 'active' : ''}
          onClick={() => setTool('grafcet-step')}
        >
          {t('step')}
        </button>
        <button
          className={tool === 'grafcet-transition' ? 'active' : ''}
          onClick={() => setTool('grafcet-transition')}
        >
          {t('transition')}
        </button>
      </div>
      <div className="grafcet-host" data-testid="grafcet-editor">
        <ReactFlowProvider>
          <ReactFlow
            nodes={toNodes(section)}
            edges={toEdges(section)}
            nodeTypes={grafcetNodeTypes}
            onConnect={onConnect}
            onNodeClick={(_, node) =>
              setSelection({ kind: 'grafcet-node', sectionId: section.id, nodeId: node.id })
            }
            onEdgeClick={(_, edge) =>
              setSelection({ kind: 'grafcet-edge', sectionId: section.id, edgeId: edge.id })
            }
            onNodesChange={(changes) => {
              for (const change of changes) {
                if (change.type === 'position' && change.position && !change.dragging) {
                  const position = change.position;
                  applyGrafcet(section.id, (body) => moveGrafcetNode(body, change.id, position));
                }
              }
            }}
            onPaneClick={(event) => {
              if (tool === 'select') {
                return;
              }
              const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
              const position = {
                x: event.clientX - bounds.left - 40,
                y: event.clientY - bounds.top - 20,
              };
              const kind =
                tool === 'grafcet-initial'
                  ? 'initialStep'
                  : tool === 'grafcet-transition'
                    ? 'transition'
                    : 'step';
              applyGrafcet(section.id, (body) => addGrafcetNode(body, kind, position));
            }}
          fitView
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#2a3140" />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
