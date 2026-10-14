import React from 'react';
import {
  Zap,
  Cpu,
  Terminal,
  Paintbrush,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';
import { PERSONA_PROTOCOLS } from '../config/personas.ts';

interface EmptyChatHeroProps {
  currentModelId: 'matrix-lite' | 'matrix-base';
  selectedPersona: string;
  onSelectPersona: (personaId: string) => void;
  onSelectPrompt: (prompt: string, enableSearch?: boolean) => void;
}

export const EmptyChatHero: React.FC<EmptyChatHeroProps> = ({
  currentModelId,
  selectedPersona,
  onSelectPersona,
  onSelectPrompt,
}) => {
  const currentProto = PERSONA_PROTOCOLS[selectedPersona] || PERSONA_PROTOCOLS.standard;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-3xl mx-auto text-center space-y-5 animate-in fade-in duration-300">
      {/* Emblem & Branding with Cyber Neon Glow */}
      <div className="space-y-3 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#00E5FF]/25 via-transparent to-[#8B5CF6]/25 blur-md animate-spin-slow pointer-events-none" />
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#00E5FF]/30 to-[#8B5CF6]/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <MatrixIcon size="xl" glow={true} className="border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.25)]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E5FF]"></span>
            </span>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10px] font-mono text-[#00E5FF] mb-1.5 shadow-[0_0_10px_rgba(0,229,255,0.15)]">
            <span>NEURAL MATRIX INTERFACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>matrixAI</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1">
            Next-generation neural computing platform.
          </p>
        </div>

      </div>

      {/* Persona Protocol Selector */}
      <div className="w-full max-w-xl mx-auto space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#00E5FF]" />
            <span>Persona Protocols</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Active: <span className="text-white font-medium">{currentProto.name}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {Object.values(PERSONA_PROTOCOLS).map((proto) => {
            const isSelected = proto.id === selectedPersona;
            const Icon =
              proto.id === 'architect'
                ? Cpu
                : proto.id === 'terminal'
                ? Terminal
                : proto.id === 'creative'
                ? Paintbrush
                : Zap;

            return (
              <button
                key={proto.id}
                onClick={() => onSelectPersona(proto.id)}
                className={`p-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between gap-1 group ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400/60 shadow-[0_0_16px_rgba(0,229,255,0.18)] text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-[#00E5FF]' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                      isSelected
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {proto.badge}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[11px] truncate">{proto.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Prompts tailored to active Persona */}
      <div className="w-full max-w-xl mx-auto space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Protocol Starters
          </span>
          <span className="text-[10px] text-cyan-400/80 font-mono">1-Click Launch</span>
        </div>

        <div className="space-y-1.5 text-left">
          {currentProto.starters.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt, false)}
              className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850/90 border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_4px_16px_rgba(0,229,255,0.14)] text-slate-200 hover:text-white text-xs transition-all duration-200 shadow-sm flex items-center justify-between gap-3 group hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
            >
              <div className="truncate flex-1 min-w-0">
                <p className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors text-[11px] truncate">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">
                  {item.prompt}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00E5FF] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
