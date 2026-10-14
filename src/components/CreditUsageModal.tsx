import React from 'react';
import {
  X,
  Coins,
  Clock,
  Zap,
  Sparkles,
  Trophy,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  CreditState,
  CreditTransaction,
  getTimeUntilMidnight,
  getMostCreditsTransaction,
} from '../utils/creditManager.ts';

interface CreditUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditState: CreditState;
}

export const CreditUsageModal: React.FC<CreditUsageModalProps> = ({
  isOpen,
  onClose,
  creditState,
}) => {
  if (!isOpen) return null;

  const { hours, minutes } = getTimeUntilMidnight();
  const mostCreditsTx = getMostCreditsTransaction(creditState.history);
  const percentage = Math.round((creditState.remainingCredits / creditState.totalDailyQuota) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-[#00E5FF]">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Credit & Usage Analytics</h2>
              <p className="text-xs text-slate-400">Daily quota and message consumption</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Daily Quota Card */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800/90 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Remaining Daily Balance
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-extrabold text-[#00E5FF] font-mono tabular-nums">
                    {creditState.remainingCredits}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {creditState.totalDailyQuota} Credits
                  </span>
                </div>
              </div>

              {/* Countdown to midnight */}
              <div className="text-right">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono justify-end">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refreshes at Midnight</span>
                </div>
                <p className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
                  In {hours}h {minutes}m
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  percentage > 40
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#6366F1]'
                    : percentage > 15
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              <span>Non-stacking daily reset (500 max credits)</span>
              <span className="text-cyan-400 font-mono">Lite: 48% cheaper · Long chats: -20% tokens</span>
            </div>
          </div>

          {/* Highest Credit Text / Most Expensive Query */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-indigo-950/20 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Highest Credit Text</span>
              </div>
              {mostCreditsTx && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold">
                  {mostCreditsTx.creditsSpent} Credits
                </span>
              )}
            </div>

            {mostCreditsTx ? (
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-slate-200 line-clamp-3 italic">
                  "{mostCreditsTx.promptText || 'Uploaded attachment query'}"
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono pt-1">
                  <div className="flex items-center gap-1.5">
                    {mostCreditsTx.modelId === 'matrix-lite' ? (
                      <span className="text-[#00E5FF] flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Matrix Lite
                      </span>
                    ) : (
                      <span className="text-[#6366F1] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Matrix Base
                      </span>
                    )}
                    <span>· {mostCreditsTx.responseLength.toLocaleString()} characters</span>
                  </div>
                  <span>{mostCreditsTx.timestamp}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No conversations yet today. Start chatting to track your credit usage and see your highest-credit prompts.
              </p>
            )}
          </div>

          {/* Credit Calculation Rules */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>How Credits Are Calculated</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Credits are deducted based on prompt and response length. <strong className="text-white">Matrix Lite</strong> applies a permanent <strong className="text-[#00E5FF]">48% discount</strong> compared to Matrix Base, allowing for longer dialogues on the same daily quota.
            </p>
          </div>

          {/* Recent Usage History Log */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Recent Message Usage
            </span>

            {creditState.history.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No credit activity logged today.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {creditState.history.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="truncate flex-1 min-w-0">
                      <p className="truncate text-slate-200 text-xs">
                        {tx.promptText || 'Chat query'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className={tx.modelId === 'matrix-lite' ? 'text-[#00E5FF]' : 'text-[#6366F1]'}>
                          {tx.modelId === 'matrix-lite' ? 'Lite' : 'Base'}
                        </span>
                        <span>· {tx.responseLength} chars</span>
                        <span>· {tx.timestamp}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-red-400 text-xs">
                        -{tx.creditsSpent}
                      </span>
                      {tx.savingsApplied && (
                        <p className="text-[9px] text-emerald-400 font-mono">-48% applied</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer (STRICTLY NO UPGRADE BUTTON) */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>500 Max Credits reset daily at midnight (non-stacking)</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
