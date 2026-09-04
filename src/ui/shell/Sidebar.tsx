import { t } from '../i18n/index.ts';
import { useWorkspace } from '../store/workspace-store.ts';

export function Sidebar() {
  const project = useWorkspace((state) => state.project);
  const activeSectionId = useWorkspace((state) => state.activeSectionId);
  const selection = useWorkspace((state) => state.selection);
  const symbolQuery = useWorkspace((state) => state.symbolQuery);
  const setActiveSection = useWorkspace((state) => state.setActiveSection);
  const addLadderSection = useWorkspace((state) => state.addLadderSection);
  const addGrafcetSection = useWorkspace((state) => state.addGrafcetSection);
  const addSymbolRow = useWorkspace((state) => state.addSymbolRow);
  const setSelection = useWorkspace((state) => state.setSelection);
  const setSymbolQuery = useWorkspace((state) => state.setSymbolQuery);

  const symbols = project.symbols.filter((symbol) => {
    const q = symbolQuery.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return `${symbol.name} ${symbol.address}`.toLowerCase().includes(q);
  });

  return (
    <aside className="sidebar">
      <div className="pane-head">
        <span>{t('sections')}</span>
        <div className="pane-actions">
          <button type="button" onClick={addLadderSection} data-testid="add-ladder">
            LD
          </button>
          <button type="button" onClick={addGrafcetSection} data-testid="add-grafcet">
            G7
          </button>
        </div>
      </div>
      <div className="tree">
        {project.sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`tree-item ${section.id === activeSectionId ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            data-testid={`section-${section.kind}-${section.name}`}
          >
            <span>{section.name}</span>
            <span className="kind-tag">{section.kind === 'ladder' ? 'LD' : 'G7'}</span>
          </button>
        ))}
      </div>
      <div className="pane-head">
        <span>{t('symbols')}</span>
        <div className="pane-actions">
          <button type="button" onClick={addSymbolRow} data-testid="add-symbol">
            +
          </button>
        </div>
      </div>
      <input
        className="search"
        value={symbolQuery}
        placeholder={t('searchSymbols')}
        onChange={(event) => setSymbolQuery(event.target.value)}
      />
      <div className="tree">
        {symbols.map((symbol) => (
          <button
            key={symbol.id}
            type="button"
            className={`symbol-item ${selection.kind === 'symbol' && selection.symbolId === symbol.id ? 'active' : ''}`}
            onClick={() => setSelection({ kind: 'symbol', symbolId: symbol.id })}
          >
            <span>{symbol.name || '—'}</span>
            <span className="kind-tag">{symbol.address}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
