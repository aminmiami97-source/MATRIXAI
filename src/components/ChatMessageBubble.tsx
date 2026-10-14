import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, Globe, Sparkles, User, RefreshCw, AlertCircle, Play, Pause, Mic } from 'lucide-react';
import { MatrixIcon } from './MatrixIcon.tsx';
import { renderMarkdownWithSyntax } from '../utils/markdownRenderer.ts';
import { soundFx } from '../utils/soundEffects.ts';
import { copyToClipboard } from '../utils/clipboard.ts';

export interface GroundingChunk {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelId?: 'matrix-lite' | 'matrix-base' | 'matrix-pro';
  image?: {
    data: string;
    mimeType: string;
    name?: string;
  };
  audio?: {
    data: string;
    mimeType: string;
    duration?: number;
    name?: string;
  };
  grounding?: {
    webSearchQueries?: string[];
    searchChunks?: GroundingChunk[];
  };
  isStreaming?: boolean;
  error?: string;
  creditsSpent?: number;
  savingsApplied?: string;
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
}

const AudioPlayerItem: React.FC<{ audio: NonNullable<ChatMessage['audio']> }> = ({ audio }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full flex items-center gap-3">
      <audio
        ref={audioRef}
        src={`data:${audio.mimeType};base64,${audio.data}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
        title={isPlaying ? 'Pause audio' : 'Play voice message'}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-300 flex items-center gap-1 font-medium">
            <Mic className="w-3 h-3 text-[#00E5FF]" />
            <span>Voice Audio</span>
          </span>
          <span className="text-slate-400">
            {formatTime(currentTime)} / {formatTime(audio.duration || 0)}
          </span>
        </div>

        {/* Audio waveform / progress visual */}
        <div className="flex items-center gap-1 h-3.5 pt-0.5">
          {[35, 65, 95, 50, 80, 40, 100, 60, 75, 45, 90, 30, 70, 50].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-[#00E5FF] animate-pulse' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onRetry }) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const [displayedLength, setDisplayedLength] = useState<number>(() =>
    isUser || !message.isStreaming ? (message.content?.length || 0) : 0
  );

  // Terminal character-by-character stream effect
  useEffect(() => {
    if (isUser) return;
    if (!message.isStreaming) {
      setDisplayedLength(message.content?.length || 0);
      return;
    }

    const targetLength = message.content?.length || 0;
    if (displayedLength >= targetLength) return;

    // Adaptive typing pace: 1 to 4 chars per tick so it never lags behind model stream
    const backlog = targetLength - displayedLength;
    const step = backlog > 50 ? 4 : backlog > 20 ? 2 : 1;
    const delay = backlog > 30 ? 6 : 10;

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + step, targetLength));
    }, delay);

    return () => clearTimeout(timer);
  }, [message.content, message.isStreaming, displayedLength, isUser]);

  const isStillTyping = !isUser && (message.isStreaming || displayedLength < (message.content?.length || 0));
  const activeContent = isUser
    ? message.content
    : message.isStreaming
    ? (message.content || '').slice(0, displayedLength)
    : message.content;

  const handleCopy = async () => {
    if (!message.content) return;
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getModelLabel = () => {
    if (message.modelId === 'matrix-base') {
      return { name: 'Matrix Base', sub: 'Standard Smart', color: 'text-[#00E5FF]' };
    }
    return { name: 'Matrix Lite', sub: 'Fast Everyday', color: 'text-[#6366F1]' };
  };

  const modelInfo = getModelLabel();

  // Handle click delegation on code blocks (e.g. Copy Code button)
  const handleContainerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const copyBtn = target.closest('.copy-code-btn') as HTMLButtonElement | null;
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const rawCode = copyBtn.getAttribute('data-code');
      const textToCopy = rawCode ? decodeURIComponent(rawCode) : '';
      if (textToCopy) {
        const success = await copyToClipboard(textToCopy);
        if (success) {
          soundFx.playClick();
          const label = copyBtn.querySelector('.copy-label');
          if (label) {
            const original = label.textContent || 'Copy';
            label.textContent = 'Copied!';
            copyBtn.classList.add('!text-emerald-400', '!border-emerald-500/50');
            setTimeout(() => {
              label.textContent = original;
              copyBtn.classList.remove('!text-emerald-400', '!border-emerald-500/50');
            }, 2000);
          }
        }
      }
    }
  };

  // Parse markdown with Prism syntax highlighting for model responses
  const renderFormattedContent = () => {
    if (isUser) {
      return <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>;
    }

    if (isStillTyping && !activeContent) {
      return (
        <div className="flex items-center gap-2 py-1.5 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-bounce" />
          <span className="text-xs font-mono text-slate-400 ml-1">Synthesizing response...</span>
        </div>
      );
    }

    try {
      const html = renderMarkdownWithSyntax(activeContent);
      return (
        <div>
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />
          {isStillTyping && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-[#00E5FF] animate-pulse rounded-[1px] shadow-[0_0_8px_#00E5FF] align-middle" />
          )}
        </div>
      );
    } catch {
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {activeContent}
          {isStillTyping && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-[#00E5FF] animate-pulse rounded-[1px] shadow-[0_0_8px_#00E5FF] align-middle" />
          )}
        </div>
      );
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`group w-full py-4 px-3 sm:px-6 flex gap-3 sm:gap-4 transition-all duration-300 ${
        isUser
          ? 'bg-transparent'
          : isStillTyping
          ? 'bg-[#090E1B]/90 border-y border-cyan-500/35 shadow-[0_0_20px_rgba(0,229,255,0.06)]'
          : 'bg-[#0A0E1A]/80 border-y border-cyan-950/60 shadow-[inset_0_1px_0_rgba(0,229,255,0.06)]'
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-950 to-indigo-900 border border-violet-500/40 flex items-center justify-center text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.25)]">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="relative">
            <MatrixIcon size="md" glow={true} className="border border-[#00E5FF]/50 shadow-[0_0_14px_rgba(0,229,255,0.3)]" />
            {isStillTyping && (
              <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E5FF]"></span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {isUser ? 'You' : 'matrixAI'}
            </span>
            {!isUser && (
              <span className={`text-[11px] font-mono ${modelInfo.color}`}>
                {modelInfo.name}
              </span>
            )}
            <span className="text-slate-500 font-mono text-[11px]">
              · {message.timestamp}
            </span>
            {!isUser && message.creditsSpent !== undefined && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono flex items-center gap-1">
                <span>⚡ {message.creditsSpent} cr</span>
                {message.savingsApplied && (
                  <span className="text-emerald-400">(-48%)</span>
                )}
              </span>
            )}
          </div>

          {/* Header Action buttons */}
          {!isUser && !isStillTyping && (
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                title="Copy to Clipboard"
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {onRetry && (
                <button
                  onClick={onRetry}
                  title="Regenerate response"
                  className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Uploaded User Image (if present) */}
        {message.image && (
          <div className="max-w-xs rounded-xl overflow-hidden border border-cyan-500/30 my-2 shadow-lg bg-black/40">
            <img
              src={`data:${message.image.mimeType};base64,${message.image.data}`}
              alt="Uploaded context"
              className="w-full max-h-60 object-contain"
            />
          </div>
        )}

        {/* Recorded Audio Message (if present) */}
        {message.audio && (
          <div className="my-2 p-3 rounded-2xl bg-[#0F172A]/90 border border-cyan-500/30 max-w-sm flex items-center gap-3 shadow-lg">
            <AudioPlayerItem audio={message.audio} />
          </div>
        )}

        {/* Content text */}
        <div className="text-slate-200 text-sm leading-relaxed overflow-x-auto">
          {renderFormattedContent()}
        </div>

        {/* Assistant Message Actions: Copy to Clipboard & Regenerate */}
        {!isUser && !isStillTyping && message.content && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/40 mt-2">
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white shadow-sm'
              }`}
              title="Copy to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300" />
                  <span className="text-[11px]">Copy to Clipboard</span>
                </>
              )}
            </button>

            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 text-xs transition-all"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Regenerate</span>
              </button>
            )}
          </div>
        )}

        {/* Error notification if any */}
        {message.error && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 mt-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{message.error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-500/40 transition-colors shrink-0 font-medium"
              >
                Retry Query
              </button>
            )}
          </div>
        )}

        {/* Google Search Grounding Citations */}
        {message.grounding?.searchChunks && message.grounding.searchChunks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Sources Verified</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {message.grounding.searchChunks.map((chunk, idx) => (
                <a
                  key={idx}
                  href={chunk.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800 text-[11px] text-slate-300 transition-all max-w-xs truncate"
                >
                  <span className="truncate">{chunk.title || 'Source'}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
