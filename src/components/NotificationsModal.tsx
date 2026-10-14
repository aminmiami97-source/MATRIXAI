import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCheck,
  Info,
  Bug,
  Coins,
  LayoutGrid,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { APP_VERSION } from '../config/version.ts';

export interface NotificationItem {
  id: string;
  category: 'updates' | 'messages' | 'bugs';
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  tag?: string;
  tagColor?: string;
}

const STORAGE_DISMISSED_NOTIFICATIONS_KEY = 'matrix_ai_dismissed_notifications_v2';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_patch_205',
    category: 'bugs',
    title: 'Patch v2.0.5: Stability & Resilience Hardening',
    description: 'Released official Patch v2.0.5! Fixed duplicate cursor render glitch during streaming; implemented multi-platform fallback clipboard engine for sandboxed iframes; synchronized conversation retry counter to prevent message drift; added graceful client disconnect handling on the server stream; and integrated an application-wide Error Boundary for zero unhandled crashes.',
    timestamp: 'Patch v2.0.5',
    unread: true,
    tag: 'Patch v2.0.5',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
  },
  {
    id: 'notif_v432_token_reduction_plus_btn',
    category: 'updates',
    title: 'Version V4.3.2: 20% Token Economy & Plus Attach Button',
    description: 'Updated to version V4.3.2 (Build B67802)! Reduced token consumption by 20% for longer chats via smart context pruning and long-chat credit discounts. Transformed the picture attachment input into a modern quick plus (+) button.',
    timestamp: 'V4.3.2 Update',
    unread: true,
    tag: 'V4.3.2 (B67802)',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_discord_community',
    category: 'updates',
    title: 'Join Our Official Discord Server!',
    description: 'We have launched the official matrixAI Discord community server! Join to talk with the team, get assistance, share feedback, and stay in the loop for new model releases: https://discord.gg/vMCAeRdby',
    timestamp: 'Community',
    unread: true,
    tag: 'Discord Server',
    tagColor: 'text-[#5865F2] border-[#5865F2]/40 bg-[#5865F2]/20',
  },
  {
    id: 'notif_syntax_highlighting',
    category: 'updates',
    title: 'Prism.js Syntax Highlighting for Code Blocks',
    description: 'Integrated Prism.js syntax highlighting with custom Cyberpunk neon color accents for Python, TypeScript, JavaScript, Bash, Go, Rust, SQL, and 40+ programming languages. Features 1-click code copying and language badges.',
    timestamp: 'V4.3.1 Feature',
    unread: true,
    tag: 'Syntax Highlighting',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v431_settings_build',
    category: 'updates',
    title: 'Version V4.3.1 & App Diagnostics Settings UI',
    description: 'Updated to version V4.3.1 (Build B67726)! Added a simple and easy settings UI showing app build and version diagnostics, along with convenient sound and quota preferences.',
    timestamp: 'V4.3.1 Update',
    unread: true,
    tag: 'V4.3.1 (B67726)',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v43_copy_clipboard',
    category: 'updates',
    title: 'Easy "Copy to Clipboard" on Assistant Messages',
    description: 'Updated to v4.3! Added a dedicated "Copy to Clipboard" action button to every AI assistant message bubble with instant visual confirmation and easy text extraction.',
    timestamp: 'v4.3 Update',
    unread: true,
    tag: 'v4.3 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v42_typing_effect',
    category: 'updates',
    title: 'Terminal Character-by-Character Typing Effect',
    description: 'Updated to v4.2! AI responses now stream character-by-character with an authentic high-speed terminal readout cadence and adaptive buffering.',
    timestamp: 'v4.2 Update',
    unread: true,
    tag: 'v4.2 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v41_animations',
    category: 'updates',
    title: 'Cyber Ambient Animations & Live Micro-Interactions',
    description: 'Updated to v4.1! Implemented live token streaming cursor with wave indicators, floating ambient neon orbs, kinetic card hover physics, and animated cyber grid glow.',
    timestamp: 'v4.1 Update',
    unread: true,
    tag: 'v4.1 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v40_model_remake',
    category: 'updates',
    title: 'Model Selector Remake & Engine Stability',
    description: 'Updated to v4.0! Completely redesigned model selector with a compact micro-badge trigger, refined glassmorphic popup, auto-save chat titles on blur, improved streaming performance, and comprehensive codebase bug fixes.',
    timestamp: 'v4.0 Update',
    unread: true,
    tag: 'v4.0 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v39_search_and_read',
    category: 'updates',
    title: 'Chat History Search & Streamlined Lite',
    description: 'Added an instant search bar in the sidebar to filter past conversations by title or message content. Google Search grounding is now streamlined for Matrix Base only, and "Mark read" permanently clears seen updates until a new update arrives.',
    timestamp: 'v3.9 Update',
    unread: true,
    tag: 'v3.9 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_v38_cyberpunk',
    category: 'updates',
    title: 'Matrix Cyberpunk Theme & Persona Protocols',
    description: 'Upgraded to v3.8! Features an immersive deep obsidian, cyan & violet cyberpunk aesthetic, 4 specialized Persona Protocols (Architect, Terminal, Synthesizer, Standard), curated 1-click prompt starters, and synthesized cyber soundscapes.',
    timestamp: 'v3.8 Update',
    unread: true,
    tag: 'v3.8 Release',
    tagColor: 'text-[#00E5FF] border-[#00E5FF]/40 bg-cyan-950/40',
  },
  {
    id: 'notif_rename_chats',
    category: 'updates',
    title: 'Chat Session Renaming in Sidebar',
    description: 'You can now manually edit the title of any chat session directly in the sidebar. Click the pencil icon or double-click the conversation name to edit and organize your chats.',
    timestamp: 'v3.7 Update',
    unread: true,
    tag: 'New Feature',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
  },
  {
    id: 'notif_patch_120',
    category: 'bugs',
    title: 'Patch v1.2.0',
    description: 'Fixed Clear All session persistence desync, resolved retry message duplication in multi-turn dialogues, and fortified state atomicity on chat deletion.',
    timestamp: 'Patch v1.2.0',
    unread: true,
    tag: 'Patch v1.2.0',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
  },
  {
    id: 'notif_patch_101',
    category: 'bugs',
    title: 'Patch v 1.0.1',
    description: 'fixed 3 bugs and optimized website overall',
    timestamp: 'Latest Patch',
    unread: true,
    tag: 'Patch v 1.0.1',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
  },
  {
    id: 'notif_credits',
    category: 'updates',
    title: 'Daily 500 Credits (Non-Stacking) & Analytics',
    description: 'Updated daily quota to 500 max credits resetting strictly every midnight (00:00). Credits are non-stacking and do not accumulate across days. Features real-time response length deduction, "Highest Credit Text" tracking, and a 48% credit discount on Matrix Lite.',
    timestamp: 'v3.6 Update',
    unread: true,
    tag: '500 Credits',
    tagColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
  },
  {
    id: 'notif_model_bar',
    category: 'updates',
    title: 'Model Switcher in Chat Bar',
    description: 'Moved the model changer from the top header directly into the bottom chat toolbar for effortless switching right where you compose your messages.',
    timestamp: 'v3.6 Update',
    unread: false,
    tag: 'UI Overhaul',
    tagColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40',
  },
  {
    id: 'notif_sidebar_collapse',
    category: 'updates',
    title: 'Collapsible & Hidable Sidebar',
    description: 'The conversation sidebar can now be collapsed on both desktop and mobile viewports to provide a full-screen, focused writing workspace.',
    timestamp: 'v3.6 Update',
    unread: false,
    tag: 'Interface',
    tagColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/40',
  },
  {
    id: 'notif_1',
    category: 'updates',
    title: 'Matrix Pro Engine In Development',
    description: 'Matrix Pro: Advanced logic & coding engine is currently in staging. Multi-step reasoning loops and high-order algorithmic synthesis scheduled for the upcoming release.',
    timestamp: 'Staging',
    unread: false,
    tag: 'Coming Soon',
    tagColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  },
  {
    id: 'notif_5',
    category: 'messages',
    title: 'Welcome to matrixAI ' + APP_VERSION,
    description: 'Your workspace is initialized. Choose between Matrix Lite for fast everyday tasks (48% less credits) and Matrix Base for smart reasoning.',
    timestamp: 'System',
    unread: false,
    tag: 'System',
    tagColor: 'text-slate-400 border-slate-700 bg-slate-800',
  },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'updates' | 'bugs' | 'messages'>('updates');
  
  // Persistent dismissed IDs so mark-as-read permanently hides notifications until new ones appear
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DISMISSED_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  // Only show notifications that have not been permanently marked as read/dismissed
  const visibleNotifications = INITIAL_NOTIFICATIONS.filter(
    (item) => !dismissedIds.includes(item.id)
  );

  const filteredItems = visibleNotifications.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const unreadCount = visibleNotifications.length;

  const handleMarkAllRead = () => {
    // Add all current notifications to dismissed IDs so they disappear forever until a new update ID arrives
    const allCurrentIds = INITIAL_NOTIFICATIONS.map((n) => n.id);
    const updatedDismissed = Array.from(new Set([...dismissedIds, ...allCurrentIds]));
    setDismissedIds(updatedDismissed);
    try {
      localStorage.setItem(
        STORAGE_DISMISSED_NOTIFICATIONS_KEY,
        JSON.stringify(updatedDismissed)
      );
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#0F172A] border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex flex-col gap-3.5 bg-[#0F172A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Notifications</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-950/70 text-[#00E5FF] border border-cyan-500/30">
                {APP_VERSION}
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700"
                  title="Mark all as read and clear from view"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mark read & clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs: All | Updates | Bugs & Performance | Messages */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'updates'
                  ? 'bg-[#1E293B] text-white shadow-sm font-semibold border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Updates
            </button>
            <button
              onClick={() => setActiveTab('bugs')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'bugs'
                  ? 'bg-[#1E293B] text-white shadow-sm font-semibold border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Bug className="w-3 h-3 text-emerald-400" />
              <span>Bugs & Performance</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'messages'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Messages
            </button>
          </div>
        </div>

        {/* Notifications List or Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/60">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.15)]">
                <CheckCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">
                  All Caught Up!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  You've reviewed all updates. New patches and feature updates will appear here automatically when released.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Up to date with {APP_VERSION}
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 group flex items-start gap-3 p-3 rounded-xl transition-colors bg-cyan-950/15 border border-cyan-500/20 hover:bg-slate-900/60"
              >
                {/* Icon */}
                <div
                  className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    item.category === 'bugs'
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                      : item.category === 'updates'
                      ? 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {item.category === 'bugs' ? (
                    <Bug className="w-4 h-4 text-emerald-400" />
                  ) : item.category === 'updates' ? (
                    item.id === 'notif_credits' ? (
                      <Coins className="w-4 h-4 text-emerald-400" />
                    ) : item.id === 'notif_sidebar_collapse' ? (
                      <LayoutGrid className="w-4 h-4 text-indigo-400" />
                    ) : item.id === 'notif_v39_search_and_read' ? (
                      <Search className="w-4 h-4 text-[#00E5FF]" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="flex items-center gap-2 pt-1">
                    {item.tag && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${item.tagColor}`}
                      >
                        {item.tag}
                      </span>
                    )}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">matrixAI Platform {APP_VERSION}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
