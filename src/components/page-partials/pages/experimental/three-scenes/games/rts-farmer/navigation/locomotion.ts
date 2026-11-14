/** Debounce contact noise so brief stops don't restart walk/idle clips. */
export function updateLocomotion(state: { moving: boolean; pending: number }, speed: number, dt: number, stationary: boolean) {
  if (stationary) { state.moving = false; state.pending = 0; return false; }
  const desired = state.moving ? speed > 0.08 : speed > 0.3;
  state.pending = desired === state.moving ? 0 : state.pending + dt;
  if (state.pending >= 0.18) { state.moving = desired; state.pending = 0; }
  return state.moving;
}
