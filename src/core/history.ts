export interface HistoryStack<T> {
  past: T[];
  future: T[];
}

export function createHistory<T>(): HistoryStack<T> {
  return { past: [], future: [] };
}

export function pushHistory<T>(
  stack: HistoryStack<T>,
  current: T,
  next: T,
  limit = 100,
): { stack: HistoryStack<T>; current: T } {
  const past = [...stack.past, current].slice(-limit);
  return {
    stack: { past, future: [] },
    current: next,
  };
}

export function undoHistory<T>(
  stack: HistoryStack<T>,
  current: T,
): { stack: HistoryStack<T>; current: T } | null {
  if (stack.past.length === 0) {
    return null;
  }
  const previous = stack.past[stack.past.length - 1];
  if (previous === undefined) {
    return null;
  }
  return {
    stack: {
      past: stack.past.slice(0, -1),
      future: [current, ...stack.future],
    },
    current: previous,
  };
}

export function redoHistory<T>(
  stack: HistoryStack<T>,
  current: T,
): { stack: HistoryStack<T>; current: T } | null {
  if (stack.future.length === 0) {
    return null;
  }
  const [next, ...rest] = stack.future;
  if (next === undefined) {
    return null;
  }
  return {
    stack: {
      past: [...stack.past, current],
      future: rest,
    },
    current: next,
  };
}
