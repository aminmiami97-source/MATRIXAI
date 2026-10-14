import React from 'react';
import {
  X,
  Settings,
  Cpu,
  Layers,
  Volume2,
  VolumeX,
  Coins,
  ShieldCheck,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';
import { DiscordIcon } from './DiscordIcon.tsx';
import { APP_VERSION, APP_BUILD, APP_PATCH } from '../config/version.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  remainingCredits: number;
  totalConversations: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isSoundEnabled,
  onToggleSound,
  remainingCredits,
  totalConversations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#090D16] border border-cyan-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0B101D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF]">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Settings</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-[#00E5FF] border border-cyan-500/30">
                  {APP_VERSION}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Application build & environment preferences</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Prominent Version & Build Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-violet-950/40 border border-cyan-500/35 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MatrixIcon size="sm" glow={true} />
                <span>Build Diagnostics</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Stable</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Version Box */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate">App Version</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold font-mono text-[#00E5FF] truncate">{APP_VERSION}</span>
                  <span className="text-[9px] font-mono text-cyan-500/80 hidden sm:inline">latest</span>
                </div>
              </div>

              {/* Build Box */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate">Build Number</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold font-mono text-[#8B5CF6] truncate">{APP_BUILD}</span>
                  <span className="text-[9px] font-mono text-violet-400/80 hidden sm:inline">prod</span>
                </div>
              </div>

              {/* Patch Box */}
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/40 flex flex-col justify-between">
                <span className="text-[10px] font-mono text-emerald-400 truncate">Patch</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-sm font-bold font-mono text-emerald-400 truncate">{APP_PATCH}</span>
                  <span className="text-[9px] font-mono text-emerald-500/80 hidden sm:inline">active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-mono">
              <span>Channel: Production Release</span>
              <span className="text-slate-300">Core: Matrix Neural v4</span>
            </div>
          </div>

          {/* Quick Preferences */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 px-1">
              General Preferences
            </h3>

            {/* Audio Toggle */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  {isSoundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#00E5FF]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Cyber Sound Effects</p>
                  <p className="text-[11px] text-slate-400">Synthesized audio cues on messages</p>
                </div>
              </div>

              <button
                onClick={onToggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSoundEnabled
                    ? 'bg-cyan-950/70 border-cyan-500/50 text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {isSoundEnabled ? 'Enabled' : 'Muted'}
              </button>
            </div>

            {/* Daily Credits Info */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Daily Credit Allowance</p>
                  <p className="text-[11px] text-slate-400">500 Credits daily · Non-stacking reset</p>
                </div>
              </div>

              <span className="font-mono text-xs font-semibold text-cyan-400">
                {remainingCredits} / 500
              </span>
            </div>

            {/* Stored Conversations */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Stored Conversations</p>
                  <p className="text-[11px] text-slate-400">Saved in browser secure storage</p>
                </div>
              </div>

              <span className="font-mono text-xs text-slate-300">
                {totalConversations} {totalConversations === 1 ? 'chat' : 'chats'}
              </span>
            </div>

            {/* Official Discord Community Server */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#5865F2]/20 via-slate-900/90 to-[#8B5CF6]/20 border border-[#5865F2]/45 flex items-center justify-between shadow-[0_4px_16px_rgba(88,101,242,0.15)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#5865F2]/25 border border-[#5865F2]/50 flex items-center justify-center text-[#5865F2] shadow-[0_0_12px_rgba(88,101,242,0.35)] shrink-0">
                  <DiscordIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Join Our Discord</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#5865F2]/30 text-[#8B5CF6] border border-[#5865F2]/40">
                      Community
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">Official server · Chat & support</p>
                </div>
              </div>

              <a
                href="https://discord.gg/vMCAeRdby"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-[0_0_12px_rgba(88,101,242,0.4)] transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                title="Join our Discord Server"
              >
                <span>Join</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B101D] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-400">
            {APP_VERSION} ({APP_BUILD}) • Patch {APP_PATCH}
          </span>
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
