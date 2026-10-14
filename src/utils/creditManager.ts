export interface CreditTransaction {
  id: string;
  timestamp: string;
  promptText: string;
  responseLength: number;
  modelId: 'matrix-lite' | 'matrix-base';
  creditsSpent: number;
  savingsApplied?: string;
}

export interface CreditState {
  remainingCredits: number;
  totalDailyQuota: number;
  lastRefreshDate: string; // YYYY-MM-DD
  history: CreditTransaction[];
}

const STORAGE_KEY = 'matrix_ai_credits_v1';
export const DAILY_QUOTA = 500;

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getTimeUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diffMs = midnight.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

export function loadCreditState(): CreditState {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: CreditState = JSON.parse(raw);
      // Midnight refresh check (Strictly non-stacking: resets directly to DAILY_QUOTA, does not accumulate)
      if (parsed.lastRefreshDate !== today) {
        const refreshedState: CreditState = {
          remainingCredits: DAILY_QUOTA,
          totalDailyQuota: DAILY_QUOTA,
          lastRefreshDate: today,
          history: parsed.history || [],
        };
        saveCreditState(refreshedState);
        return refreshedState;
      }

      // Upgrade existing users quota to 500
      if (parsed.totalDailyQuota !== DAILY_QUOTA) {
        const quotaDiff = DAILY_QUOTA - (parsed.totalDailyQuota || 300);
        const adjustedState: CreditState = {
          ...parsed,
          remainingCredits: Math.min(DAILY_QUOTA, parsed.remainingCredits + Math.max(0, quotaDiff)),
          totalDailyQuota: DAILY_QUOTA,
        };
        saveCreditState(adjustedState);
        return adjustedState;
      }

      // Ensure credits cannot exceed 500 (non-stacking cap)
      if (parsed.remainingCredits > DAILY_QUOTA) {
        parsed.remainingCredits = DAILY_QUOTA;
        saveCreditState(parsed);
      }

      return parsed;
    }
  } catch (err) {
    console.error('Failed to load credit state:', err);
  }

  // Default initial state
  const initialState: CreditState = {
    remainingCredits: DAILY_QUOTA,
    totalDailyQuota: DAILY_QUOTA,
    lastRefreshDate: today,
    history: [],
  };
  saveCreditState(initialState);
  return initialState;
}

export function saveCreditState(state: CreditState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save credit state:', err);
  }
}

/**
 * Calculates credits based on response and prompt length.
 * Matrix Lite takes 48% less credits than Matrix Base.
 * Longer chats (multi-turn or totalChars > 300) receive an additional 20% token reduction bonus.
 */
export function calculateCredits(
  promptText: string,
  responseText: string,
  modelId: 'matrix-lite' | 'matrix-base',
  conversationTurns: number = 1
): { credits: number; baseCredits: number; savingsNote?: string } {
  const totalChars = (promptText?.length || 0) + (responseText?.length || 0);
  const unreducedBase = Math.max(2, Math.ceil(totalChars / 75));

  // 20% Token eating reduction for longer chats (multi-turn >= 2 or length > 300 chars)
  const isLongChat = conversationTurns >= 2 || totalChars > 300;
  const effectiveChars = isLongChat ? totalChars * 0.80 : totalChars;
  const rawBase = Math.max(2, Math.ceil(effectiveChars / 75));

  if (modelId === 'matrix-lite') {
    // 48% less credits than Base (user pays only 52%)
    const liteCredits = Math.max(1, Math.round(rawBase * 0.52));
    const savingsNote = isLongChat
      ? '20% Long Chat token reduction + 48% Lite discount'
      : '48% Lite discount applied';
    return {
      credits: liteCredits,
      baseCredits: unreducedBase,
      savingsNote,
    };
  }

  return {
    credits: rawBase,
    baseCredits: unreducedBase,
    savingsNote: isLongChat ? '20% Long Chat token reduction applied (-20%)' : undefined,
  };
}

export function deductCredits(
  promptText: string,
  responseText: string,
  modelId: 'matrix-lite' | 'matrix-base',
  conversationTurns: number = 1
): { updatedRemaining: number; transaction: CreditTransaction } {
  const state = loadCreditState();
  const { credits, savingsNote } = calculateCredits(promptText, responseText, modelId, conversationTurns);

  const updatedRemaining = Math.max(0, state.remainingCredits - credits);

  const transaction: CreditTransaction = {
    id: 'tx_' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    promptText: promptText.trim(),
    responseLength: responseText.length,
    modelId,
    creditsSpent: credits,
    savingsApplied: savingsNote,
  };

  const updatedState: CreditState = {
    ...state,
    remainingCredits: updatedRemaining,
    history: [transaction, ...state.history.slice(0, 99)], // keep last 100
  };

  saveCreditState(updatedState);
  return { updatedRemaining, transaction };
}

export function getMostCreditsTransaction(history: CreditTransaction[]): CreditTransaction | null {
  if (!history || history.length === 0) return null;
  return history.reduce((prev, current) =>
    current.creditsSpent > prev.creditsSpent ? current : prev
  );
}
