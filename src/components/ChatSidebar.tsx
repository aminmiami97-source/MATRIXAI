import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Lock,
  PanelLeftClose,
  Bell,
  Coins,
  X,
  Pencil,
  Check,
  Search,
  Settings,
} from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';
import { DiscordIcon } from './DiscordIcon.tsx';
import { APP_VERSION, APP_PATCH } from '../config/version.ts';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  modelId: 'matrix-lite' | 'matrix-base';
  messageCount: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onOpenNotifications: () => void;
  remainingCredits: number;
  onOpenCredits: () => void;
  onRenameSession?: (id: string, newTitle: string) => void;
  onOpenSettings?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onOpenNotifications,
  remainingCredits,
  onOpenCredits,
  onRenameSession,
  onOpenSettings,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter sessions by title or stored conversation message content
  const filteredSessions = sessions.filter((session) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    if (session.title.toLowerCase().includes(q)) return true;
    try {
      const stored = localStorage.getItem('matrix_ai_messages_' + session.id);
      if (stored && stored.toLowerCase().includes(q)) return true;
    } catch {}
    return false;
  });

  const [isUpdateNoticeDismissed, setIsUpdateNoticeDismissed] = useState<boolean>(() => {
    try {
      if (localStorage.getItem('matrix_ai_update_dismissed_' + APP_VERSION) === 'true') {
        return true;
      }
      const dismissedNotifs = localStorage.getItem('matrix_ai_dismissed_notifications_v2');
      if (dismissedNotifs && dismissedNotifs.includes('notif_v39_search_and_read')) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  const handleDismissNotice = () => {
    setIsUpdateNoticeDismissed(true);
    try {
      localStorage.setItem('matrix_ai_update_dismissed_' + APP_VERSION, 'true');
    } catch {}
  };

  const startRenaming = (session: ChatSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    const trimmed = editingTitle.trim();
    if (trimmed && onRenameSession) {
      onRenameSession(sessionId, trimmed);
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingSessionId(null);
    setEditingTitle('');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Closable / Hidable on both Mobile & Desktop */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 h-full bg-[#0B0F19] border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden select-none ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full md:translate-x-0 md:w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-72 h-full flex flex-col">
          {/* Brand & Action Header */}
          <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MatrixIcon size="sm" glow={true} />
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-base tracking-tight text-white">matrixAI</span>
                  <span className="text-[10px] font-mono text-[#00E5FF]">{APP_VERSION}</span>
                  <span className="text-[9px] font-mono text-emerald-400 px-1 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30">
                    {APP_PATCH}
                  </span>
                </div>
              </div>

              {/* Close Sidebar Trigger */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Hide sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 font-medium text-xs transition-all shadow-[0_0_12px_rgba(0,229,255,0.1)] hover:shadow-[0_0_16px_rgba(0,229,255,0.25)]"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>

            {/* Quick Search Bar for past chats by title or content snippet */}
            {sessions.length > 0 && (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-slate-900/90 border border-slate-800/90 focus:border-cyan-500/60 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all focus:shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-white rounded transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-2 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Conversations</span>
              {searchQuery && (
                <span className="text-[10px] text-cyan-400 lowercase">
                  {filteredSessions.length} found
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 px-4">
                No recent conversations.
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 px-4 space-y-1.5">
                <p>No chats found for "{searchQuery}"</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] text-[#00E5FF] hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = session.id === currentSessionId;
                const isEditing = editingSessionId === session.id;

                if (isEditing) {
                  return (
                    <div
                      key={session.id}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/50 shadow-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => handleSaveRename(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveRename(session.id);
                          } else if (e.key === 'Escape') {
                            e.preventDefault();
                            handleCancelRename();
                          }
                        }}
                        className="flex-1 min-w-0 bg-transparent text-white text-xs px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#00E5FF] placeholder-slate-500"
                        placeholder="Chat title..."
                        maxLength={60}
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="p-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors"
                          title="Save title (Enter)"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCancelRename(e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Cancel (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800/90 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                    onClick={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                  >
                    <div
                      className="flex items-center gap-2 truncate flex-1 mr-1.5"
                      onDoubleClick={(e) => startRenaming(session, e)}
                      title="Double-click to rename"
                    >
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-cyan-400" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => startRenaming(session, e)}
                        className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors"
                        title="Rename chat"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Daily Credit Usage Bar in Sidebar */}
          <div className="px-3 py-2 border-t border-slate-800/80">
            <button
              onClick={onOpenCredits}
              className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/90 hover:border-cyan-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Coins className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                  <span>Daily Credits</span>
                </div>
                <span className="font-mono text-cyan-400 font-semibold text-[11px] tabular-nums">
                  {remainingCredits} / 500
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] to-[#6366F1]"
                  style={{ width: `${Math.round((remainingCredits / 500) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>Refreshes at Midnight</span>
                <span className="text-slate-400 group-hover:text-cyan-300">Usage &rarr;</span>
              </div>
            </button>
          </div>

          {/* Matrix Pro Coming Soon Indicator */}
          <div className="px-3 pb-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <span>Matrix Pro</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Coming Soon
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Advanced logic & coding engine
                </p>
              </div>
            </div>
          </div>

          {/* Join Discord Community Banner */}
          <div className="mx-3 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-[#5865F2]/20 via-slate-900 to-[#8B5CF6]/20 border border-[#5865F2]/40 shadow-[0_4px_16px_rgba(88,101,242,0.15)] text-xs relative group">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#5865F2]/25 border border-[#5865F2]/50 flex items-center justify-center text-[#5865F2] shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(88,101,242,0.3)]">
                  <DiscordIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">Join our Discord</p>
                  <p className="text-[10px] text-slate-400 truncate">Connect with community</p>
                </div>
              </div>

              <a
                href="https://discord.gg/vMCAeRdby"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium text-[11px] tracking-wide shrink-0 transition-all shadow-[0_0_10px_rgba(88,101,242,0.35)] hover:shadow-[0_0_14px_rgba(88,101,242,0.6)] flex items-center gap-1 active:scale-95"
                title="Join our Discord Server"
              >
                <span>Join</span>
                <span className="text-[10px]">&rarr;</span>
              </a>
            </div>
          </div>

          {/* Small message that says you have not read some new website update */}
          {!isUpdateNoticeDismissed && (
            <div className="mx-3 mb-2 p-2.5 rounded-xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-950 border border-cyan-500/35 shadow-lg text-xs relative animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <div className="relative mt-0.5 shrink-0">
                    <Bell className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-200 leading-snug">
                      You haven't read the latest website update.
                    </p>
                    <button
                      onClick={onOpenNotifications}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00E5FF] hover:text-cyan-300 transition-colors underline underline-offset-2"
                    >
                      <span>See what's new</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={handleDismissNotice}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Dismiss update notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer: Notifications & Updates trigger + Clear All */}
          <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-300 transition-colors group"
              title="View all website updates & notifications"
            >
              <div className="relative">
                <Bell className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              </div>
              <span className="text-[11px] font-medium">Updates & Notifications</span>
            </button>

            <div className="flex items-center gap-2">
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                  title="Settings (Build & Version)"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}

              {sessions.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear all chat sessions"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
