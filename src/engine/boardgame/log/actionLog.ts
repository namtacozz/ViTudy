import {
  EngineState,
  GameAction,
  GamePackageV2,
  ReduceResult,
} from '../schema/types';
import { computeStateChecksum } from '../core/checksum';
import { createInitialState, reduce } from '../core/reducer';

export interface HistoryTimeline {
  pkg: GamePackageV2;
  seed: number;
  past: EngineState[];
  present: EngineState;
  future: EngineState[];
}

export function createTimeline(pkg: GamePackageV2, seed = 1337): HistoryTimeline {
  return {
    pkg,
    seed,
    past: [],
    present: createInitialState(pkg, seed),
    future: [],
  };
}

export function dispatchTimeline(
  timeline: HistoryTimeline,
  action: GameAction
): { timeline: HistoryTimeline; result: ReduceResult } {
  const result = reduce(timeline.present, action, timeline.pkg);
  if (result.error) {
    return { timeline, result };
  }
  return {
    timeline: {
      ...timeline,
      past: [...timeline.past, timeline.present],
      present: result.state,
      future: [],
    },
    result,
  };
}

export function undoTimeline(timeline: HistoryTimeline): HistoryTimeline {
  if (timeline.past.length === 0) return timeline;
  const previous = timeline.past[timeline.past.length - 1];
  return {
    ...timeline,
    past: timeline.past.slice(0, -1),
    present: previous,
    future: [timeline.present, ...timeline.future],
  };
}

export function redoTimeline(timeline: HistoryTimeline): HistoryTimeline {
  if (timeline.future.length === 0) return timeline;
  const [next, ...rest] = timeline.future;
  return {
    ...timeline,
    past: [...timeline.past, timeline.present],
    present: next,
    future: rest,
  };
}

export function replayLog(
  pkg: GamePackageV2,
  seed: number,
  actions: readonly GameAction[]
): { state: EngineState; checksum: string; error?: string } {
  let state = createInitialState(pkg, seed);
  for (const action of actions) {
    const res = reduce(state, action, pkg);
    if (res.error) {
      return { state: res.state, checksum: computeStateChecksum(res.state), error: res.error };
    }
    state = res.state;
  }
  return { state, checksum: computeStateChecksum(state) };
}
