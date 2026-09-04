import { readAutosave } from '@persistence';
import { useEffect } from 'react';
import { GrafcetEditor } from '../grafcet/GrafcetEditor.tsx';
import { LadderEditor } from '../ladder/LadderEditor.tsx';
import { clearLadderCell, useWorkspace } from '../store/workspace-store.ts';
import { DiagnosticsPanel } from './DiagnosticsPanel.tsx';
import { Inspector } from './Inspector.tsx';
import { Sidebar } from './Sidebar.tsx';
import { Titlebar } from './Titlebar.tsx';

export function IdeShell() {
  const project = useWorkspace((state) => state.project);
  const activeSectionId = useWorkspace((state) => state.activeSectionId);
  const loadProject = useWorkspace((state) => state.loadProject);
  const undo = useWorkspace((state) => state.undo);
  const redo = useWorkspace((state) => state.redo);
  const saveToDisk = useWorkspace((state) => state.saveToDisk);
  const selection = useWorkspace((state) => state.selection);
  const applyLadder = useWorkspace((state) => state.applyLadder);
  const placeCell = useWorkspace((state) => state.placeCell);
  const copySelection = useWorkspace((state) => state.copySelection);
  const pasteSelection = useWorkspace((state) => state.pasteSelection);

  useEffect(() => {
    const saved = readAutosave();
    if (saved) {
      loadProject(saved);
    }
  }, [loadProject]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (meta && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void saveToDisk();
      }
      if (meta && event.key.toLowerCase() === 'c' && document.activeElement?.tagName !== 'INPUT') {
        copySelection();
      }
      if (meta && event.key.toLowerCase() === 'v' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        pasteSelection();
      }
      if (event.key === 'Delete' && selection.kind === 'cells') {
        const focus = selection.cells[0];
        if (focus) {
          applyLadder(selection.sectionId, (body) =>
            clearLadderCell(body, selection.rungId, focus.col, focus.row),
          );
        }
      }
      if (!meta && selection.kind === 'cells' && selection.cells[0]) {
        const map: Record<string, Parameters<typeof placeCell>[4]> = {
          '1': 'normallyOpenContact',
          '2': 'normallyClosedContact',
          '3': 'coil',
          '4': 'setCoil',
          '5': 'resetCoil',
          '|': 'verticalLink',
          t: 'functionBlock',
          '=': 'compare',
          o: 'operate',
        };
        const kind = map[event.key];
        if (
          kind &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          const focus = selection.cells[0];
          placeCell(selection.sectionId, selection.rungId, focus.col, focus.row, kind);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [applyLadder, copySelection, pasteSelection, placeCell, redo, saveToDisk, selection, undo]);

  const section =
    project.sections.find((item) => item.id === activeSectionId) ?? project.sections[0];

  return (
    <div className="ide">
      <Titlebar />
      <div className="workspace">
        <Sidebar />
        {section?.kind === 'grafcet' ? (
          <GrafcetEditor section={section} />
        ) : section?.kind === 'ladder' ? (
          <LadderEditor section={section} />
        ) : (
          <div className="editor-wrap" />
        )}
        <Inspector />
      </div>
      <DiagnosticsPanel />
    </div>
  );
}
