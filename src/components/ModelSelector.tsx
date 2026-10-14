import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Sparkles, Check, Lock } from 'lucide-react';

export interface ModelInfo {
  id: 'matrix-lite' | 'matrix-base' | 'matrix-pro';
  name: string;
  tagline: string;
  shortDesc: string;
  badge: string;
  accentColor: string;
  status: 'active' | 'coming-soon';
}

export const MODELS: ModelInfo[] = [
  {
    id: 'matrix-lite',
    name: 'Matrix Lite',
    tagline: 'Ultra-fast Everyday Engine',
    shortDesc: 'Rapid responses · 48% less credits',
    badge: '48% Off',
    accentColor: '#00E5FF',
    status: 'active',
  },
  {
    id: 'matrix-base',
    name: 'Matrix Base',
    tagline: 'Smart Reasoning & Search',
    shortDesc: 'Deep logic · Live Google search',
    badge: 'Flagship',
    accentColor: '#8B5CF6',
    status: 'active',
  },
  {
    id: 'matrix-pro',
    name: 'Matrix Pro',
    tagline: 'Deep Algorithmic Engine',
    shortDesc: 'Advanced logic & math proofs',
    badge: 'Coming Soon',
    accentColor: '#F59E0B',
    status: 'coming-soon',
  },
];

interface ModelSelectorProps {
  currentModelId: 'matrix-lite' | 'matrix-base';
  onSelectModel: (id: 'matrix-lite' | 'matrix-base') => void;
  direction?: 'up' | 'down';
  variant?: 'default' | 'pill';
  align?: 'left' | 'right';
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModelId,
  onSelectModel,
  direction = 'up',
  variant = 'default',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comingSoonNotice, setComingSoonNotice] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = MODELS.find((m) => m.id === currentModelId) || MODELS[0];
  const isLite = currentModel.id === 'matrix-lite';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {variant === 'pill' ? (
        /* Minimalist Pill Button matching requested layout */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#24262b] hover:bg-[#2c2f35] border border-white/5 text-zinc-200 text-xs font-medium transition-colors focus:outline-none select-none cursor-pointer"
          title={`Active model: ${currentModel.name} (Click to switch)`}
        >
          <span className="font-medium text-xs text-zinc-200">
            {isLite ? 'Default' : currentModel.name}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      ) : (
        /* Standard Glowing Micro-Pill Trigger Button */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium transition-all shadow-sm focus:outline-none select-none ${
            isLite
              ? 'bg-cyan-950/40 hover:bg-cyan-950/60 border-cyan-500/40 text-cyan-200 hover:border-cyan-400/70 shadow-[0_0_10px_rgba(0,229,255,0.12)]'
              : 'bg-violet-950/40 hover:bg-violet-950/60 border-violet-500/40 text-violet-200 hover:border-violet-400/70 shadow-[0_0_10px_rgba(139,92,246,0.12)]'
          }`}
          title={`Active model: ${currentModel.name} (Click to switch)`}
        >
          {/* Glowing Indicator Dot / Icon */}
          <span className="relative flex items-center justify-center">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLite ? 'bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]' : 'bg-[#8B5CF6] shadow-[0_0_6px_#8B5CF6]'
              }`}
            />
          </span>

          {/* Icon & Name */}
          <div className="flex items-center gap-1">
            {isLite ? (
              <Zap className="w-3 h-3 text-[#00E5FF]" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
            )}
            <span className="font-semibold text-[11px] tracking-tight text-white">
              {currentModel.name}
            </span>
          </div>

          <ChevronDown
            className={`w-2.5 h-2.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#00E5FF]' : ''
            }`}
          />
        </button>
      )}

      {/* Redesigned Compact Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${
            direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          } w-68 sm:w-72 rounded-2xl bg-[#090D16]/95 border border-cyan-500/35 shadow-[0_16px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Intelligence Engine
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/70 text-[#00E5FF] border border-cyan-500/30">
              Active: {isLite ? 'Lite' : 'Base'}
            </span>
          </div>

          {comingSoonNotice && (
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-[11px] text-amber-300">
              Matrix Pro is currently in active staging. Please select Matrix Lite or Matrix Base.
            </div>
          )}

          {/* Model Selection Rows */}
          <div className="space-y-1">
            {MODELS.map((model) => {
              const isSelected = model.id === currentModelId;
              const isPro = model.id === 'matrix-pro';
              const isItemLite = model.id === 'matrix-lite';

              return (
                <div
                  key={model.id}
                  onClick={() => {
                    if (isPro) {
                      setComingSoonNotice(true);
                      setTimeout(() => setComingSoonNotice(false), 2400);
                    } else {
                      onSelectModel(model.id as 'matrix-lite' | 'matrix-base');
                      setIsOpen(false);
                    }
                  }}
                  className={`group relative p-2 rounded-xl transition-all border flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? isItemLite
                        ? 'bg-cyan-950/40 border-[#00E5FF]/50 text-white shadow-[0_0_12px_rgba(0,229,255,0.15)] cursor-pointer'
                        : 'bg-violet-950/40 border-[#8B5CF6]/50 text-white shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-pointer'
                      : isPro
                      ? 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-95 cursor-not-allowed'
                      : 'bg-slate-900/50 border-transparent hover:border-slate-700/80 hover:bg-slate-800/60 cursor-pointer text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Small Icon Badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        isItemLite
                          ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30'
                          : model.id === 'matrix-base'
                          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
                          : 'bg-slate-800 text-amber-400 border-slate-700'
                      }`}
                    >
                      {isItemLite ? (
                        <Zap className="w-3.5 h-3.5" />
                      ) : model.id === 'matrix-base' ? (
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <Lock className="w-3 h-3 text-amber-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">
                          {model.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                            isItemLite
                              ? 'bg-cyan-950/60 text-[#00E5FF] border-cyan-500/30'
                              : model.id === 'matrix-base'
                              ? 'bg-violet-950/60 text-violet-300 border-violet-500/30'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {model.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right Status */}
                  <div className="shrink-0">
                    {isSelected && (
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isItemLite ? 'text-[#00E5FF]' : 'text-[#8B5CF6]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
