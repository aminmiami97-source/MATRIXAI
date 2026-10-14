import React from 'react';
import { PanelLeft, Plus, Coins, Download, Volume2, VolumeX, Settings } from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';
import { DiscordIcon } from './DiscordIcon.tsx';
import { APP_VERSION } from '../config/version.ts';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNewChat: () => void;
  remainingCredits: number;
  onOpenCredits: () => void;
  onExportChat?: () => void;
  hasMessages?: boolean;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onNewChat,
  remainingCredits,
  onOpenCredits,
  onExportChat,
  hasMessages = false,
  isSoundEnabled,
  onToggleSound,
  onOpenSettings,
}) => {
  return (
    <header className="h-14 px-4 sm:px-6 bg-[#080C14]/95 border-b border-cyan-950/80 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Zone 1: Sidebar toggle + Brand wordmark with Cyber Glow */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className={`p-1.5 rounded-lg transition-colors ${
            isSidebarOpen
              ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
          }`}
          title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <MatrixIcon size="sm" glow={true} />
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              matrixAI
            </span>
            <span className="text-[10px] font-mono text-[#00E5FF] px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30">
              {APP_VERSION}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Action Controls, Discord, Settings, Sound FX, Daily Credits & Export */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Discord Community Server Join Link */}
        <a
          href="https://discord.gg/vMCAeRdby"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-[#5865F2] hover:border-[#5865F2]/50 hover:bg-[#5865F2]/10 transition-all shadow-sm"
          title="Join our Discord Server (https://discord.gg/vMCAeRdby)"
        >
          <DiscordIcon className="w-3.5 h-3.5" />
        </a>

        {/* Settings Modal Button - Small, Easy & Accessible */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 hover:bg-slate-800 transition-all shadow-sm"
            title="Settings (Build & Version)"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Cyber Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg border transition-all ${
            isSoundEnabled
              ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:text-white shadow-[0_0_8px_rgba(0,229,255,0.15)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={isSoundEnabled ? 'Sound FX enabled (Click to mute)' : 'Sound FX muted (Click to enable)'}
        >
          {isSoundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#00E5FF]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Daily Credit Balance Button */}
        <button
          onClick={onOpenCredits}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400/60 text-xs font-medium transition-all shadow-sm group"
          title="Daily credit usage & analytics"
        >
          <Coins className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
          <span className="font-mono font-semibold text-slate-100 tabular-nums">
            {remainingCredits}
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            / 500
          </span>
        </button>

        {/* Export Chat as Markdown Button */}
        {hasMessages && onExportChat && (
          <button
            onClick={onExportChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/30 text-xs font-medium transition-all shadow-sm"
            title="Export conversation as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
            <span className="hidden md:inline">Export</span>
          </button>
        )}

        {/* New Chat Button with Cyber Glow */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00E5FF]/15 to-[#8B5CF6]/15 hover:from-[#00E5FF]/25 hover:to-[#8B5CF6]/25 text-[#00E5FF] border border-[#00E5FF]/40 font-medium text-xs transition-all whitespace-nowrap shadow-[0_0_12px_rgba(0,229,255,0.15)] hover:shadow-[0_0_16px_rgba(0,229,255,0.3)]"
          title="Start fresh conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
};
