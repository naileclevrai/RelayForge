import { getCell } from '@ladder';
import {
  addGrafcetAction,
  removeGrafcetAction,
  updateGrafcetAction,
  updateGrafcetEdge,
  updateGrafcetNode,
} from '@grafcet';
import { t } from '../i18n/index.ts';
import { useWorkspace } from '../store/workspace-store.ts';

export function Inspector() {
  const project = useWorkspace((state) => state.project);
  const selection = useWorkspace((state) => state.selection);
  const patchSection = useWorkspace((state) => state.patchSection);
  const patchSymbol = useWorkspace((state) => state.patchSymbol);
  const deleteSymbol = useWorkspace((state) => state.deleteSymbol);
  const patchCell = useWorkspace((state) => state.patchCell);
  const applyGrafcet = useWorkspace((state) => state.applyGrafcet);

  if (selection.kind === 'none') {
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <p className="help">{t('noSelection')}</p>
      </aside>
    );
  }

  if (selection.kind === 'section') {
    const section = project.sections.find((item) => item.id === selection.sectionId);
    if (!section) {
      return null;
    }
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <label className="field">
          <span>{t('sectionName')}</span>
          <input
            value={section.name}
            onChange={(event) => patchSection(section.id, { name: event.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('comment')}</span>
          <textarea
            rows={3}
            value={section.comment}
            onChange={(event) => patchSection(section.id, { comment: event.target.value })}
          />
        </label>
      </aside>
    );
  }

  if (selection.kind === 'symbol') {
    const symbol = project.symbols.find((item) => item.id === selection.symbolId);
    if (!symbol) {
      return null;
    }
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <label className="field">
          <span>{t('name')}</span>
          <input
            value={symbol.name}
            onChange={(event) => patchSymbol({ ...symbol, name: event.target.value })}
          />
        </label>
        <label className="field">
          <span>{t('address')}</span>
          <input
            value={symbol.address}
            onChange={(event) => patchSymbol({ ...symbol, address: event.target.value })}
            data-testid="symbol-address"
          />
        </label>
        <label className="field">
          <span>{t('dataType')}</span>
          <select
            value={symbol.dataType}
            onChange={(event) =>
              patchSymbol({
                ...symbol,
                dataType: event.target.value as typeof symbol.dataType,
              })
            }
          >
            <option value="bool">bool</option>
            <option value="word">word</option>
            <option value="dint">dint</option>
            <option value="real">real</option>
            <option value="timer">timer</option>
            <option value="counter">counter</option>
          </select>
        </label>
        <label className="field">
          <span>{t('comment')}</span>
          <input
            value={symbol.comment}
            onChange={(event) => patchSymbol({ ...symbol, comment: event.target.value })}
          />
        </label>
        <button type="button" onClick={() => deleteSymbol(symbol.id)}>
          {t('deleteSelection')}
        </button>
      </aside>
    );
  }

  if (selection.kind === 'cells') {
    const focus = selection.cells[0];
    const section = project.sections.find((item) => item.id === selection.sectionId);
    if (!focus || !section || section.kind !== 'ladder') {
      return null;
    }
    const rung = section.body.rungs.find((item) => item.id === selection.rungId);
    const cell = rung ? getCell(rung, focus.col, focus.row) : undefined;
    if (!cell) {
      return (
        <aside className="inspector">
          <div className="pane-head">{t('inspector')}</div>
          <p className="help">{t('noSelection')}</p>
        </aside>
      );
    }
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <p className="muted">
          {cell.kind} · {focus.col},{focus.row}
        </p>
        <label className="field">
          <span>{t('operand')}</span>
          <input
            data-testid="cell-operand"
            value={cell.operand ?? ''}
            onChange={(event) =>
              patchCell(section.id, selection.rungId, focus.col, focus.row, {
                operand: event.target.value,
              })
            }
          />
        </label>
        {cell.kind === 'functionBlock' ? (
          <label className="field">
            <span>{t('blockKind')}</span>
            <select
              value={cell.blockKind ?? 'timer'}
              onChange={(event) =>
                patchCell(section.id, selection.rungId, focus.col, focus.row, {
                  blockKind: event.target.value === 'counter' ? 'counter' : 'timer',
                })
              }
            >
              <option value="timer">{t('timer')}</option>
              <option value="counter">{t('counter')}</option>
            </select>
          </label>
        ) : null}
        {cell.kind === 'compare' ? (
          <>
            <label className="field">
              <span>{t('compareOp')}</span>
              <select
                value={cell.compareOp ?? 'ge'}
                onChange={(event) =>
                  patchCell(section.id, selection.rungId, focus.col, focus.row, {
                    compareOp: event.target.value as NonNullable<typeof cell.compareOp>,
                  })
                }
              >
                <option value="eq">=</option>
                <option value="ne">{'<>'}</option>
                <option value="gt">{'>'}</option>
                <option value="ge">{'>='}</option>
                <option value="lt">{'<'}</option>
                <option value="le">{'<='}</option>
              </select>
            </label>
            <label className="field">
              <span>{t('secondaryOperand')}</span>
              <input
                value={cell.secondaryOperand ?? ''}
                onChange={(event) =>
                  patchCell(section.id, selection.rungId, focus.col, focus.row, {
                    secondaryOperand: event.target.value,
                  })
                }
              />
            </label>
          </>
        ) : null}
        {cell.kind === 'operate' ? (
          <>
            <label className="field">
              <span>{t('operateOp')}</span>
              <select
                value={cell.operateOp ?? 'assign'}
                onChange={(event) =>
                  patchCell(section.id, selection.rungId, focus.col, focus.row, {
                    operateOp: event.target.value as NonNullable<typeof cell.operateOp>,
                  })
                }
              >
                <option value="assign">:=</option>
                <option value="add">+</option>
                <option value="sub">-</option>
                <option value="mul">*</option>
                <option value="div">/</option>
              </select>
            </label>
            <label className="field">
              <span>{t('secondaryOperand')}</span>
              <input
                value={cell.secondaryOperand ?? ''}
                onChange={(event) =>
                  patchCell(section.id, selection.rungId, focus.col, focus.row, {
                    secondaryOperand: event.target.value,
                  })
                }
              />
            </label>
            <label className="field">
              <span>{t('resultOperand')}</span>
              <input
                value={cell.resultOperand ?? ''}
                onChange={(event) =>
                  patchCell(section.id, selection.rungId, focus.col, focus.row, {
                    resultOperand: event.target.value,
                  })
                }
              />
            </label>
          </>
        ) : null}
      </aside>
    );
  }

  if (selection.kind === 'grafcet-node') {
    const section = project.sections.find((item) => item.id === selection.sectionId);
    if (!section || section.kind !== 'grafcet') {
      return null;
    }
    const node = section.body.nodes.find((item) => item.id === selection.nodeId);
    if (!node) {
      return null;
    }
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <label className="field">
          <span>{t('name')}</span>
          <input
            value={node.label}
            onChange={(event) =>
              applyGrafcet(section.id, (body) =>
                updateGrafcetNode(body, node.id, { label: event.target.value }),
              )
            }
          />
        </label>
        {node.kind === 'transition' ? (
          <label className="field">
            <span>{t('receptivity')}</span>
            <input
              value={node.receptivity}
              onChange={(event) =>
                applyGrafcet(section.id, (body) =>
                  updateGrafcetNode(body, node.id, { receptivity: event.target.value }),
                )
              }
            />
          </label>
        ) : (
          <>
            <div className="pane-head">{t('actions')}</div>
            {node.actions.map((action) => (
              <div className="action-row" key={action.id}>
                <select
                  value={action.qualifier}
                  onChange={(event) =>
                    applyGrafcet(section.id, (body) =>
                      updateGrafcetAction(body, node.id, action.id, {
                        qualifier: event.target.value as typeof action.qualifier,
                      }),
                    )
                  }
                >
                  <option value="N">N</option>
                  <option value="S">S</option>
                  <option value="R">R</option>
                  <option value="P">P</option>
                  <option value="C">C</option>
                </select>
                <input
                  value={action.operand}
                  onChange={(event) =>
                    applyGrafcet(section.id, (body) =>
                      updateGrafcetAction(body, node.id, action.id, {
                        operand: event.target.value,
                      }),
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    applyGrafcet(section.id, (body) =>
                      removeGrafcetAction(body, node.id, action.id),
                    )
                  }
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => applyGrafcet(section.id, (body) => addGrafcetAction(body, node.id))}
            >
              {t('addAction')}
            </button>
          </>
        )}
      </aside>
    );
  }

  if (selection.kind === 'grafcet-edge') {
    const section = project.sections.find((item) => item.id === selection.sectionId);
    if (!section || section.kind !== 'grafcet') {
      return null;
    }
    const edge = section.body.edges.find((item) => item.id === selection.edgeId);
    if (!edge) {
      return null;
    }
    return (
      <aside className="inspector">
        <div className="pane-head">{t('inspector')}</div>
        <label className="field">
          <span>{t('linkKind')}</span>
          <select
            value={edge.kind}
            onChange={(event) =>
              applyGrafcet(section.id, (body) =>
                updateGrafcetEdge(body, edge.id, { kind: event.target.value as typeof edge.kind }),
              )
            }
          >
            <option value="sequence">{t('sequence')}</option>
            <option value="orBranch">{t('orBranch')}</option>
            <option value="andBranch">{t('andBranch')}</option>
          </select>
        </label>
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <div className="pane-head">{t('inspector')}</div>
    </aside>
  );
}
