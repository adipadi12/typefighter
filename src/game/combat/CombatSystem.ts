export function calculateDamage(
  action: ActionType,
  attacker: PlayerState,
  defender: PlayerState,
  typingResult: TypingResult
): DamageInfo {
  const baseDamage: Record<ActionType, number> = {
    [ActionType.SLASH]: 10,
    [ActionType.HEAVY]: 25,
    [ActionType.THRUST]: 15,
  }

  const staminaFactor = attacker.stamina > 0 ? Math.min(1, attacker.stamina / 50) : 0.2
  const accuracyFactor = typingResult.accuracy / 100
  const comboMultiplier = 1 + Math.min(2, Math.floor(typingResult.combo / 10)) / 10

  const rawDamage = baseDamage[action] || 5
  const damage = Math.round(rawDamage * accuracyFactor * staminaFactor * comboMultiplier)
  const finalDamage = damage > 0 && attacker.stamina > 0 ? damage : 1
  const type: 'normal' | 'critical' | 'combo' = finalDamage > 15 ? 'critical' : 'normal'

  return { amount: finalDamage, type, source: action }
}

export function calculateParry(
  action: ActionType,
  player: PlayerState,
  opponent: PlayerState
): ParryInfo {
  const windowRemaining = Math.max(0, 500 - Math.abs(player.stamina - opponent.stamina))
  const staminaHas = player.stamina >= 20
  const success = staminaHas && windowRemaining > 0

  let counterWindow = false
  if (success && opponent.action === ActionType.SLASH) {
    counterWindow = true
  }

  return { success, windowRemaining, counterWindow }
}

export function applyStaminaCost(
  action: ActionType,
  player: PlayerState
): PlayerState {
  const staminaCosts: Record<ActionType, number> = {
    [ActionType.SLASH]: 15,
    [ActionType.HEAVY]: 30,
    [ActionType.THRUST]: 20,
    [ActionType.PARRY]: 20,
    [ActionType.DODGE]: 25,
    [ActionType.COUNTER]: 25,
  }

  const cost = staminaCosts[action] || 10
  const newStamina = Math.max(0, player.stamina - cost)

  return { ...player, stamina: newStamina }
}

export function updateCombo(
  currentCombo: number,
  success: boolean,
  typingAccuracy: number
): number {
  if (success && typingAccuracy >= 80) {
    return Math.min(100, currentCombo + 5)
  } else if (!success) {
    return 0
  } else {
    return Math.max(0, currentCombo - 2)
  }
}

export function getActivePlayer(combat: CombatState, turn: string): PlayerState {
  return turn === 'player1' ? combat.player1 : combat.player2
}

export function getOpponentPlayer(combat: CombatState, turn: string): PlayerState {
  return turn === 'player1' ? combat.player2 : combat.player1
}

export function isPlayerAlive(player: PlayerState): boolean {
  return player.health > 0 && player.isAlive
}

export function isCombatOver(combat: CombatState): boolean {
  return !isPlayerAlive(combat.player1) || !isPlayerAlive(combat.player2)
}

export function getWinner(combat: CombatState): string | null {
  if (!isPlayerAlive(combat.player1) && isPlayerAlive(combat.player2)) return 'player2'
  if (!isPlayerAlive(combat.player2) && isPlayerAlive(combat.player1)) return 'player1'
  if (!isPlayerAlive(combat.player1) && !isPlayerAlive(combat.player2)) return null
  return null
}

export function advanceTurn(combat: CombatState): CombatState {
  const newTurn = combat.turn === 'player1' ? 'player2' : 'player1'
  return { ...combat, turn: newTurn }
}

export function processCombatAction(
  action: ActionType,
  performingPlayer: PlayerState,
  targetPlayer: PlayerState,
  typingResult: TypingResult,
  currentCombat: CombatState
) {
  const newAttacker = applyStaminaCost(action, performingPlayer)
  const parryInfo = calculateParry(action, targetPlayer, newAttacker)

  let damage: DamageInfo = { amount: 0, type: 'normal', source: action }
  let target = { ...targetPlayer }

  if (!parryInfo.success) {
    damage = calculateDamage(action, newAttacker, target, typingResult)
    target = { ...target, health: Math.max(0, target.health - damage.amount) }
  } else {
    damage = { amount: 0, type: 'normal', source: action }
    target = { ...target }
  }

  const newAttackerCombo = updateCombo(
    newAttacker.comboCounter,
    parryInfo.success,
    typingResult.accuracy
  )

  const combatUpdated = {
    ...currentCombat,
    player1: currentCombat.player1.comboCounter !== newAttackerCombo
      ? { ...currentCombat.player1, comboCounter: newAttackerCombo }
      : currentCombat.player1,
    player2: currentCombat.player2.comboCounter !== newAttackerCombo
      ? { ...currentCombat.player2, comboCounter: newAttackerCombo }
      : currentCombat.player2,
  }

  return {
    attacker: newAttacker,
    target,
    damage,
    parryInfo,
    combatUpdated,
  }
}

export default {
  calculateDamage,
  calculateParry,
  applyStaminaCost,
  updateCombo,
  getActivePlayer,
  getOpponentPlayer,
  isPlayerAlive,
  isCombatOver,
  getWinner,
  advanceTurn,
  processCombatAction,
}