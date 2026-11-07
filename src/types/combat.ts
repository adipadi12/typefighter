export interface DamageInfo {
  amount: number
  type: 'normal' | 'critical' | 'combo'
  source: ActionType
}

export interface ParryInfo {
  success: boolean
  windowRemaining: number
  counterWindow: boolean
}

export interface ComboState {
  currentSequence: ActionType[]
  maxSequence: ActionType[]
  windowStart: number
  isActive: boolean
  streak: number
}

export interface TypingStats {
  wpm: number
  accuracy: number
  timeTaken: number
  wordsTyped: number
  charactersTyped: number
  correctCharacters: number
}