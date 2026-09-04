import {
  createHistory,
  pushHistory,
  redoHistory,
  structuredCloneJson,
  undoHistory,
  type Diagnostic,
  type HistoryStack,
} from '@core';
import { exportProject, pl7Exporter, relayForgeExporter } from '@exporters';
import {
  addGrafcetAction,
  addGrafcetEdge,
  addGrafcetNode,
  moveGrafcetNode,
  removeGrafcetAction,
  removeGrafcetEdge,
  removeGrafcetNode,
  updateGrafcetAction,
  updateGrafcetEdge,
  updateGrafcetNode,
  type GrafcetAction,
  type GrafcetBody,
  type GrafcetLinkKind,
  type GrafcetNode,
} from '@grafcet';
import {
  addBranchRow,
  addRung,
  clearLadderCell,
  removeBranchRow,
  removeRung,
  setLadderCell,
  setRungComment,
  type LadderBody,
  type LadderCell,
  type LadderCellKind,
} from '@ladder';
import { downloadFiles, openProjectFile, saveProjectFile, writeAutosave } from '@persistence';
import {
  addSectionToProject,
  createGrafcetSection,
  createLadderSection,
  createProject,
  createSymbol,
  parseProject,
  removeSectionFromProject,
  removeSymbol,
  renameProject,
  serializeProject,
  updateSection,
  updateSectionBody,
  upsertSymbol,
  validateProject,
  type RelayForgeProject,
  type SymbolDefinition,
} from '@project';
import { getTarget, TSX37_FAMILY, tsx37Target } from '@targets';
import { create } from 'zustand';
import type { EditorTool, WorkspaceSelection } from '../selection.ts';

const DEFAULT_NAME = 'Untitled';

function freshProject(): RelayForgeProject {
  return createProject({
    name: DEFAULT_NAME,
    targetFamily: TSX37_FAMILY,
    cpu: 'TSX37',
  });
}

function targetFor(project: RelayForgeProject) {
  try {
    return getTarget(project.target.family);
  } catch {
    return tsx37Target;
  }
}

function revalidate(project: RelayForgeProject): Diagnostic[] {
  return validateProject(project, targetFor(project));
}

export interface WorkspaceState {
  project: RelayForgeProject;
  history: HistoryStack<RelayForgeProject>;
  selection: WorkspaceSelection;
  activeSectionId: string | null;
  tool: EditorTool;
  zoom: number;
  diagnostics: Diagnostic[];
  status: string;
  symbolQuery: string;
  clipboard: LadderCell[];
  commit: (project: RelayForgeProject, recordHistory?: boolean) => void;
  newProject: () => void;
  loadProject: (project: RelayForgeProject) => void;
  undo: () => void;
  redo: () => void;
  setSelection: (selection: WorkspaceSelection) => void;
  setActiveSection: (sectionId: string) => void;
  setTool: (tool: EditorTool) => void;
  setZoom: (zoom: number) => void;
  setSymbolQuery: (query: string) => void;
  setProjectName: (name: string) => void;
  addLadderSection: () => void;
  addGrafcetSection: () => void;
  removeActiveSection: () => void;
  patchSection: (sectionId: string, patch: { name?: string; comment?: string }) => void;
  addSymbolRow: () => void;
  patchSymbol: (symbol: SymbolDefinition) => void;
  deleteSymbol: (symbolId: string) => void;
  applyLadder: (sectionId: string, update: (body: LadderBody) => LadderBody) => void;
  placeCell: (
    sectionId: string,
    rungId: string,
    col: number,
    row: number,
    kind?: LadderCellKind,
  ) => void;
  patchCell: (
    sectionId: string,
    rungId: string,
    col: number,
    row: number,
    patch: Partial<LadderCell>,
  ) => void;
  applyGrafcet: (sectionId: string, update: (body: GrafcetBody) => GrafcetBody) => void;
  openFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<void>;
  exportNative: () => void;
  exportPl7: () => void;
  copySelection: () => void;
  pasteSelection: () => void;
}

function firstSectionId(project: RelayForgeProject): string | null {
  return project.sections[0]?.id ?? null;
}

export const useWorkspace = create<WorkspaceState>((set, get) => {
  const project = freshProject();
  return {
    project,
    history: createHistory<RelayForgeProject>(),
    selection: { kind: 'none' },
    activeSectionId: firstSectionId(project),
    tool: 'select',
    zoom: 1,
    diagnostics: revalidate(project),
    status: '',
    symbolQuery: '',
    clipboard: [],
    commit(next, recordHistory = true) {
      const current = get().project;
      if (recordHistory) {
        const pushed = pushHistory(get().history, structuredCloneJson(current), next);
        set({
          project: pushed.current,
          history: pushed.stack,
          diagnostics: revalidate(pushed.current),
        });
      } else {
        set({ project: next, diagnostics: revalidate(next) });
      }
      writeAutosave(get().project);
    },
    newProject() {
      const next = freshProject();
      set({
        project: next,
        history: createHistory<RelayForgeProject>(),
        selection: { kind: 'none' },
        activeSectionId: firstSectionId(next),
        diagnostics: revalidate(next),
        status: 'New project',
      });
      writeAutosave(next);
    },
    loadProject(next) {
      const project = parseProject(serializeProject(next));
      set({
        project,
        history: createHistory<RelayForgeProject>(),
        selection: { kind: 'none' },
        activeSectionId: firstSectionId(project),
        diagnostics: revalidate(project),
        status: 'Opened',
      });
      writeAutosave(project);
    },
    undo() {
      const result = undoHistory(get().history, get().project);
      if (!result) {
        return;
      }
      set({
        project: result.current,
        history: result.stack,
        diagnostics: revalidate(result.current),
        status: 'Undo',
      });
      writeAutosave(result.current);
    },
    redo() {
      const result = redoHistory(get().history, get().project);
      if (!result) {
        return;
      }
      set({
        project: result.current,
        history: result.stack,
        diagnostics: revalidate(result.current),
        status: 'Redo',
      });
      writeAutosave(result.current);
    },
    setSelection(selection) {
      set({ selection });
    },
    setActiveSection(sectionId) {
      set({
        activeSectionId: sectionId,
        selection: { kind: 'section', sectionId },
        tool: 'select',
      });
    },
    setTool(tool) {
      set({ tool });
    },
    setZoom(zoom) {
      set({ zoom: Math.min(2.2, Math.max(0.5, zoom)) });
    },
    setSymbolQuery(query) {
      set({ symbolQuery: query });
    },
    setProjectName(name) {
      get().commit(renameProject(get().project, name));
    },
    addLadderSection() {
      const section = createLadderSection(`Ladder ${get().project.sections.length + 1}`);
      get().commit(addSectionToProject(get().project, section));
      set({ activeSectionId: section.id, selection: { kind: 'section', sectionId: section.id } });
    },
    addGrafcetSection() {
      const section = createGrafcetSection(`Chart ${get().project.sections.length + 1}`);
      get().commit(addSectionToProject(get().project, section));
      set({
        activeSectionId: section.id,
        tool: 'select',
        selection: { kind: 'section', sectionId: section.id },
      });
    },
    removeActiveSection() {
      const id = get().activeSectionId;
      if (!id) {
        return;
      }
      const next = removeSectionFromProject(get().project, id);
      get().commit(next);
      set({ activeSectionId: firstSectionId(next), selection: { kind: 'none' } });
    },
    patchSection(sectionId, patch) {
      get().commit(updateSection(get().project, sectionId, patch));
    },
    addSymbolRow() {
      const symbol = createSymbol({ name: 'Symbol', address: '' });
      get().commit(upsertSymbol(get().project, symbol));
      set({ selection: { kind: 'symbol', symbolId: symbol.id } });
    },
    patchSymbol(symbol) {
      get().commit(upsertSymbol(get().project, symbol));
    },
    deleteSymbol(symbolId) {
      get().commit(removeSymbol(get().project, symbolId));
      if (get().selection.kind === 'symbol') {
        set({ selection: { kind: 'none' } });
      }
    },
    applyLadder(sectionId, update) {
      const section = get().project.sections.find((item) => item.id === sectionId);
      if (!section || section.kind !== 'ladder') {
        return;
      }
      get().commit(updateSectionBody(get().project, sectionId, update(section.body)));
    },
    placeCell(sectionId, rungId, col, row, kind) {
      const tool = kind ?? get().tool;
      if (tool === 'select' || tool.startsWith('grafcet')) {
        return;
      }
      get().applyLadder(sectionId, (body) =>
        setLadderCell(body, rungId, {
          col,
          row,
          kind: tool as LadderCellKind,
          operand: tool === 'functionBlock' ? '%TM0' : '',
          blockKind: tool === 'functionBlock' ? 'timer' : undefined,
          compareOp: tool === 'compare' ? 'ge' : undefined,
          operateOp: tool === 'operate' ? 'assign' : undefined,
        }),
      );
      set({
        selection: { kind: 'cells', sectionId, rungId, cells: [{ col, row }] },
      });
    },
    patchCell(sectionId, rungId, col, row, patch) {
      const section = get().project.sections.find((item) => item.id === sectionId);
      if (!section || section.kind !== 'ladder') {
        return;
      }
      const rung = section.body.rungs.find((item) => item.id === rungId);
      const current = rung?.cells.find((cell) => cell.col === col && cell.row === row);
      if (!current) {
        get().applyLadder(sectionId, (body) =>
          setLadderCell(body, rungId, { col, row, kind: 'normallyOpenContact', ...patch }),
        );
        return;
      }
      get().applyLadder(sectionId, (body) => setLadderCell(body, rungId, { ...current, ...patch }));
    },
    applyGrafcet(sectionId, update) {
      const section = get().project.sections.find((item) => item.id === sectionId);
      if (!section || section.kind !== 'grafcet') {
        return;
      }
      get().commit(updateSectionBody(get().project, sectionId, update(section.body)));
    },
    async openFromDisk() {
      const opened = await openProjectFile();
      if (!opened) {
        return;
      }
      get().loadProject(opened.project);
      set({ status: `Opened ${opened.name}` });
    },
    async saveToDisk() {
      const json = serializeProject(get().project);
      const name = `${get().project.meta.name || 'project'}.rfp.json`;
      const saved = await saveProjectFile(json, name);
      if (saved) {
        set({ status: 'Saved' });
      }
    },
    exportNative() {
      const result = exportProject(get().project, relayForgeExporter);
      if (result.ok) {
        downloadFiles(result.files);
        set({ status: 'Exported RelayForge project' });
      }
    },
    exportPl7() {
      const result = exportProject(get().project, pl7Exporter);
      set({
        status: result.ok ? 'Exported PL7' : result.message,
      });
    },
    copySelection() {
      const selection = get().selection;
      if (selection.kind !== 'cells') {
        return;
      }
      const section = get().project.sections.find((item) => item.id === selection.sectionId);
      if (!section || section.kind !== 'ladder') {
        return;
      }
      const rung = section.body.rungs.find((item) => item.id === selection.rungId);
      const cells = (rung?.cells ?? []).filter((cell) =>
        selection.cells.some((item) => item.col === cell.col && item.row === cell.row),
      );
      set({ clipboard: structuredCloneJson(cells), status: `Copied ${cells.length}` });
    },
    pasteSelection() {
      const selection = get().selection;
      const clipboard = get().clipboard;
      if (selection.kind !== 'cells' || clipboard.length === 0) {
        return;
      }
      const origin = selection.cells[0];
      const source = clipboard[0];
      if (!origin || !source) {
        return;
      }
      const dx = origin.col - source.col;
      const dy = origin.row - source.row;
      get().applyLadder(selection.sectionId, (body) => {
        let next = body;
        for (const cell of clipboard) {
          next = setLadderCell(next, selection.rungId, {
            ...cell,
            col: cell.col + dx,
            row: cell.row + dy,
          });
        }
        return next;
      });
    },
  };
});

export { addRung, removeRung, addBranchRow, removeBranchRow, setRungComment, clearLadderCell };
export {
  addGrafcetNode,
  addGrafcetEdge,
  updateGrafcetNode,
  removeGrafcetNode,
  moveGrafcetNode,
  addGrafcetAction,
  updateGrafcetAction,
  removeGrafcetAction,
  updateGrafcetEdge,
  removeGrafcetEdge,
};
export type { GrafcetAction, GrafcetLinkKind, GrafcetNode };
