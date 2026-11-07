export interface PlayerState {
  id: string
  health: number
  maxHealth: number
  stamina: number
  maxStamina: number
  attackPower: number
  comboCounter: number
  maxCombo: number
  isAlive: boolean
}

export interface CombatState {
  player1: PlayerState
  player2: PlayerState
  turn: 'player1' | 'player2'
  gameOver: boolean
  winner: string | null
}

export enum ActionType {
  SLASH = 'slash',
  HEAVY = 'heavy',
  THRUST = 'thrust',
  PARRY = 'parry',
  DODGE = 'dodge',
  COUNTER = 'counter',
}

export interface TypingResult {
  success: boolean
  action: ActionType | null
  correctChars: number
  totalChars: number
  comboBroken: boolean
  streakBroken: boolean
}