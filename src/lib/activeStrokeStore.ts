import type { DrawingStroke } from '@/types/studyspace';

type Listener = () => void;

let activeStroke: DrawingStroke | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getActiveStroke(): DrawingStroke | null {
  return activeStroke;
}

export function setActiveStroke(
  updater: DrawingStroke | null | ((prev: DrawingStroke | null) => DrawingStroke | null)
): void {
  const next = typeof updater === 'function' ? updater(activeStroke) : updater;
  if (next === activeStroke) return;
  activeStroke = next;
  emit();
}

export function subscribeActiveStroke(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
