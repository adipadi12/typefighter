export interface TypingInput {
  text: string
  prompt: string
  startTime: number
  endTime?: number
}

export interface TypingValidationResult {
  success: boolean
  action: string | null
  correctChars: number
  totalChars: number
  accuracy: number
  comboBroken: boolean
  streakBroken: boolean
  wpm: number
}

const ACTION_MAP: Record<string, string> = {
  'slash': 'slash',
  'heavy': 'heavy',
  'thrust': 'thrust',
  'parry': 'parry',
  'dodge': 'dodge',
  'counter': 'counter',
}

export function validateTyping(
  input: string,
  prompt: string,
  startTime: number,
  endTime?: number
): TypingValidationResult {
  const totalChars = prompt.length
  const end = endTime || Date.now()
  const timeTaken = Math.max(end - startTime, 1)

  const promptChars = prompt.split('')
  const inputChars = input.split('')
  let correctChars = 0

  for (let i = 0; i < Math.min(promptChars.length, inputChars.length); i++) {
    if (promptChars[i] === inputChars[i]) correctChars++
  }

  const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100

  const lowerInput = input.toLowerCase().trim()
  const action = ACTION_MAP[lowerInput] || null

  let comboBroken = false
  let streakBroken = false

  const wordsTyped = 1
  const wpm = Math.round((wordsTyped / timeTaken) * 60000)

  const success = !comboBroken && !streakBroken && accuracy >= 80

  return {
    success,
    action,
    correctChars,
    totalChars,
    accuracy,
    comboBroken,
    streakBroken,
    wpm,
  }
}

export function getActionFromInput(typed: string): string | null {
  const lower = typed.toLowerCase().trim()
  return ACTION_MAP[lower] || null
}

export function getNextPrompt(
  currentPrompt: string,
  actionHistory: string[],
  maxCombo: number
): string {
  if (!currentPrompt || actionHistory.length === 0) {
    return 'slash'
  }
  const lastAction = actionHistory[actionHistory.length - 1]
  return lastAction || 'slash'
}

export function validateCombo(
  actions: string[],
  timestamps: number[],
  windowMs: number = 5000
): boolean {
  if (actions.length < 2) return true
  const timeDiffs = []
  for (let i = 1; i < timestamps.length; i++) {
    timeDiffs.push(timestamps[i] - timestamps[i - 1])
  }
  const allWithinWindow = timeDiffs.every(
    (diff) => diff > 0 && diff < windowMs
  )
  return allWithinWindow
}

export default { validateTyping, getActionFromInput, getNextPrompt, validateCombo }