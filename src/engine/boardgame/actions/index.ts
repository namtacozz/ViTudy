import { ActionType } from '../schema/types';
import { ActionHandler } from './types';
import {
  destroyAction,
  flipAction,
  movePieceAction,
  rotateAction,
  spawnAction,
} from './pieceActions';
import {
  dealAction,
  discardAction,
  drawAction,
  shuffleAction,
} from './cardActions';
import {
  setCounterAction,
  setFieldAction,
  setOwnerAction,
  transferAction,
} from './counterActions';
import {
  extraTurnAction,
  nextTurnAction,
  reverseOrderAction,
  rollAction,
  setPhaseAction,
  skipTurnAction,
} from './turnActions';
import {
  endGameAction,
  logAction,
  promptChoiceAction,
  promptPickAction,
  runRuleAction,
  showPanelAction,
} from './flowActions';

export const ACTION_REGISTRY: Record<ActionType, ActionHandler> = {
  move_piece: movePieceAction,
  draw: drawAction,
  discard: discardAction,
  shuffle: shuffleAction,
  deal: dealAction,
  transfer: transferAction,
  set_counter: setCounterAction,
  set_field: setFieldAction,
  set_owner: setOwnerAction,
  spawn: spawnAction,
  destroy: destroyAction,
  flip: flipAction,
  rotate: rotateAction,
  roll: rollAction,
  skip_turn: skipTurnAction,
  extra_turn: extraTurnAction,
  reverse_order: reverseOrderAction,
  set_phase: setPhaseAction,
  next_turn: nextTurnAction,
  prompt_choice: promptChoiceAction,
  prompt_pick: promptPickAction,
  show_panel: showPanelAction,
  end_game: endGameAction,
  run_rule: runRuleAction,
  log: logAction,
};
