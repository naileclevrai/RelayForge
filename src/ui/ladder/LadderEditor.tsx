import { getCell, type LadderCellKind } from '@ladder';
import type { LadderSection } from '@project';
import type { Diagnostic } from '@core';
import { t } from '../i18n/index.ts';
import type { EditorTool } from '../selection.ts';
import {
  addBranchRow,
  addRung,
  clearLadderCell,
  removeBranchRow,
  removeRung,
  setRungComment,
  useWorkspace,
} from '../store/workspace-store.ts';
import { LadderGlyph } from './glyphs.tsx';

const CELL_W = 72;
const CELL_H = 52;
const RAIL = 10;

const TOOLS: { id: EditorTool; label: string }[] = [
  { id: 'select', label: t('selectTool') },
  { id: 'normallyOpenContact', label: t('normallyOpenContact') },
  { id: 'normallyClosedContact', label: t('normallyClosedContact') },
  { id: 'coil', label: t('coil') },
  { id: 'setCoil', label: t('setCoil') },
  { id: 'resetCoil', label: t('resetCoil') },
  { id: 'verticalLink', label: t('verticalLink') },
  { id: 'functionBlock', label: t('functionBlock') },
  { id: 'compare', label: t('compare') },
  { id: 'operate', label: t('operate') },
];

function cellHasError(
  diagnostics: Diagnostic[],
  sectionId: string,
  rungId: string,
  col: number,
  row: number,
): boolean {
  return diagnostics.some(
    (item) =>
      item.severity === 'error' &&
      item.location?.sectionId === sectionId &&
      item.location.rungId === rungId &&
      item.location.cell?.col === col &&
      item.location.cell.row === row,
  );
}

interface Props {
  section: LadderSection;
}

export function LadderEditor({ section }: Props) {
  const tool = useWorkspace((state) => state.tool);
  const zoom = useWorkspace((state) => state.zoom);
  const selection = useWorkspace((state) => state.selection);
  const diagnostics = useWorkspace((state) => state.diagnostics);
  const setTool = useWorkspace((state) => state.setTool);
  const setSelection = useWorkspace((state) => state.setSelection);
  const placeCell = useWorkspace((state) => state.placeCell);
  const applyLadder = useWorkspace((state) => state.applyLadder);
  const setZoom = useWorkspace((state) => state.setZoom);

  return (
    <div className="editor-wrap">
      <div className="editor-tools">
        {TOOLS.map((item) => (
          <button
            key={item.id}
            className={tool === item.id ? 'active' : ''}
            onClick={() => setTool(item.id)}
          >
            {item.label}
          </button>
        ))}
        <span className="sep" />
        <button onClick={() => applyLadder(section.id, (body) => addRung(body))}>
          {t('addRung')}
        </button>
        <button onClick={() => setZoom(zoom + 0.1)}>{t('zoomIn')}</button>
        <button onClick={() => setZoom(zoom - 0.1)}>{t('zoomOut')}</button>
      </div>
      <div className="editor-canvas">
        {section.body.rungs.map((rung, index) => {
          const width = RAIL * 2 + rung.columns * CELL_W;
          const height = rung.rows * CELL_H;
          const selectedCells =
            selection.kind === 'cells' && selection.rungId === rung.id ? selection.cells : [];
          return (
            <div key={rung.id} className="ladder-rung">
              <div className="rung-meta">
                <span className="rung-index">N{index}</span>
                <input
                  value={rung.comment}
                  placeholder={t('rungComment')}
                  onChange={(event) =>
                    applyLadder(section.id, (body) =>
                      setRungComment(body, rung.id, event.target.value),
                    )
                  }
                  onFocus={() =>
                    setSelection({ kind: 'rung', sectionId: section.id, rungId: rung.id })
                  }
                />
                <button
                  onClick={() => applyLadder(section.id, (body) => addBranchRow(body, rung.id))}
                >
                  {t('addBranch')}
                </button>
                <button
                  onClick={() => applyLadder(section.id, (body) => removeBranchRow(body, rung.id))}
                >
                  -
                </button>
                <button
                  onClick={() => applyLadder(section.id, (body) => removeRung(body, rung.id))}
                >
                  ×
                </button>
              </div>
              <svg
                width={width * zoom}
                height={(height + 22) * zoom}
                viewBox={`0 0 ${width} ${height + 22}`}
                style={{ overflow: 'visible' }}
              >
                <g
                  fill="none"
                  stroke="var(--rail)"
                  strokeWidth="1.4"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <rect
                    x="0"
                    y="0"
                    width={RAIL}
                    height={height}
                    fill="#2a3140"
                    stroke="var(--rail)"
                  />
                  <rect
                    x={width - RAIL}
                    y="0"
                    width={RAIL}
                    height={height}
                    fill="#2a3140"
                    stroke="var(--rail)"
                  />
                  {Array.from({ length: rung.rows }, (_, row) =>
                    Array.from({ length: rung.columns }, (__, col) => {
                      const cell = getCell(rung, col, row);
                      const x = RAIL + col * CELL_W;
                      const y = row * CELL_H;
                      const selected = selectedCells.some(
                        (item) => item.col === col && item.row === row,
                      );
                      const error = cellHasError(diagnostics, section.id, rung.id, col, row);
                      return (
                        <g
                          key={`${col}:${row}`}
                          data-testid={`cell-${index}-${col}-${row}`}
                          transform={`translate(${x},${y})`}
                          onClick={(event) => {
                            event.preventDefault();
                            if (tool !== 'select') {
                              placeCell(section.id, rung.id, col, row, tool as LadderCellKind);
                              return;
                            }
                            const cells =
                              event.shiftKey && selectedCells.length > 0
                                ? [...selectedCells, { col, row }]
                                : [{ col, row }];
                            setSelection({
                              kind: 'cells',
                              sectionId: section.id,
                              rungId: rung.id,
                              cells,
                            });
                          }}
                          onDoubleClick={() => {
                            if (cell) {
                              applyLadder(section.id, (body) =>
                                clearLadderCell(body, rung.id, col, row),
                              );
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <rect
                            width={CELL_W}
                            height={CELL_H}
                            fill={selected ? 'rgba(245,165,36,0.12)' : 'transparent'}
                            stroke={
                              error
                                ? 'var(--err)'
                                : selected
                                  ? 'var(--accent)'
                                  : 'rgba(42,49,64,0.9)'
                            }
                          />
                          <svg width={CELL_W} height={CELL_H} viewBox={`0 0 ${CELL_W} ${CELL_H}`}>
                            <LadderGlyph
                              cell={cell ?? { col, row, kind: 'empty' }}
                              width={CELL_W}
                              height={CELL_H}
                            />
                          </svg>
                          {cell?.operand ? (
                            <text
                              x={CELL_W / 2}
                              y={12}
                              textAnchor="middle"
                              fill="var(--text)"
                              fontSize="10"
                              stroke="none"
                            >
                              {cell.operand}
                            </text>
                          ) : null}
                        </g>
                      );
                    }),
                  )}
                </g>
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
