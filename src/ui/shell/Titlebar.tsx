import { t } from '../i18n/index.ts';
import { useWorkspace } from '../store/workspace-store.ts';

export function Titlebar() {
  const project = useWorkspace((state) => state.project);
  const status = useWorkspace((state) => state.status);
  const newProject = useWorkspace((state) => state.newProject);
  const openFromDisk = useWorkspace((state) => state.openFromDisk);
  const saveToDisk = useWorkspace((state) => state.saveToDisk);
  const undo = useWorkspace((state) => state.undo);
  const redo = useWorkspace((state) => state.redo);
  const exportNative = useWorkspace((state) => state.exportNative);
  const exportPl7 = useWorkspace((state) => state.exportPl7);
  const diagnostics = useWorkspace((state) => state.diagnostics);
  const setProjectName = useWorkspace((state) => state.setProjectName);

  const errors = diagnostics.filter((item) => item.severity === 'error').length;

  return (
    <header className="titlebar">
      <div className="brand">
        <span className="brand-mark">RF</span>
        <h1>
          {t('appName')}
          <small>{t('appTag')}</small>
        </h1>
      </div>
      <div className="toolbar">
        <input
          data-testid="project-name"
          value={project.meta.name}
          onChange={(event) => setProjectName(event.target.value)}
          style={{ width: 160 }}
        />
        <button type="button" onClick={newProject}>
          {t('newProject')}
        </button>
        <button type="button" onClick={() => void openFromDisk()}>
          {t('openProject')}
        </button>
        <button type="button" onClick={() => void saveToDisk()} data-testid="save-project">
          {t('saveProject')}
        </button>
        <button
          type="button"
          onClick={() => {
            const errors = diagnostics.filter((item) => item.severity === 'error').length;
            useWorkspace.setState({
              status: errors ? `${errors} ${t('errors')}` : t('emptyDiagnostics'),
            });
          }}
          data-testid="validate-project"
        >
          {t('validate')}
        </button>
        <span className="sep" />
        <button type="button" onClick={undo}>
          {t('undo')}
        </button>
        <button type="button" onClick={redo}>
          {t('redo')}
        </button>
        <span className="sep" />
        <button type="button" onClick={exportNative} data-testid="export-project">
          {t('exportRelayForge')}
        </button>
        <button
          type="button"
          onClick={exportPl7}
          data-testid="export-pl7"
          title={t('pl7NotImplemented')}
        >
          {t('exportPl7')}
        </button>
      </div>
      <div className="toolbar">
        <span className="target-badge">{project.target.cpu ?? project.target.family}</span>
        <span className="status-text" data-testid="status-text">
          {status || (errors ? `${errors} ${t('errors')}` : t('emptyDiagnostics'))}
        </span>
      </div>
    </header>
  );
}
