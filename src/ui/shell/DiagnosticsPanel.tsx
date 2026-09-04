import { t } from '../i18n/index.ts';
import { useWorkspace } from '../store/workspace-store.ts';

export function DiagnosticsPanel() {
  const diagnostics = useWorkspace((state) => state.diagnostics);
  const setActiveSection = useWorkspace((state) => state.setActiveSection);
  const setSelection = useWorkspace((state) => state.setSelection);

  return (
    <footer className="diagnostics">
      <div className="pane-head">{t('diagnostics')}</div>
      <ul className="diag-list" data-testid="diagnostics">
        {diagnostics.length === 0 ? (
          <li>
            <span className="sev-info">OK</span>
            <span className="code">—</span>
            <span>{t('emptyDiagnostics')}</span>
          </li>
        ) : (
          diagnostics.map((item) => (
            <li
              key={item.id}
              onClick={() => {
                if (item.location?.sectionId) {
                  setActiveSection(item.location.sectionId);
                }
                if (item.location?.cell && item.location.sectionId && item.location.rungId) {
                  setSelection({
                    kind: 'cells',
                    sectionId: item.location.sectionId,
                    rungId: item.location.rungId,
                    cells: [item.location.cell],
                  });
                }
              }}
            >
              <span className={`sev-${item.severity}`}>{item.severity.toUpperCase()}</span>
              <span className="code">{item.code}</span>
              <span>{item.message}</span>
            </li>
          ))
        )}
      </ul>
    </footer>
  );
}
