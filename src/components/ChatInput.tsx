import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Plus,
  X,
  Square,
  Mic,
  MicOff,
  Play,
  Pause,
  AlertCircle,
  Globe,
  Upload,
} from 'lucide-react';
import { ModelSelector } from './ModelSelector.tsx';
import {
  useAudioRecorder,
  RecordedAudioResult,
  convertAudioFileToResult,
} from '../utils/audioRecorder.ts';
import { soundFx } from '../utils/soundEffects.ts';

interface AttachedAudio {
  data: string;
  mimeType: string;
  duration: number;
  blobUrl: string;
  name: string;
}

interface ChatInputProps {
  onSendMessage: (
    text: string,
    image?: { data: string; mimeType: string; name?: string },
    customBaseMessages?: any,
    audio?: { data: string; mimeType: string; duration?: number; name?: string }
  ) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  selectedModelId: 'matrix-lite' | 'matrix-base';
  useSearch: boolean;
  onToggleSearch: (enabled: boolean) => void;
  onSelectModel: (modelId: 'matrix-lite' | 'matrix-base') => void;
  remainingCredits: number;
  onOpenCredits: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  selectedModelId,
  useSearch,
  onToggleSearch,
  onSelectModel,
  remainingCredits,
  onOpenCredits,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{
    data: string;
    mimeType: string;
    name?: string;
  } | null>(null);

  const [attachedAudio, setAttachedAudio] = useState<AttachedAudio | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording hook
  const {
    isRecording,
    duration: recordingDuration,
    error: recordingError,
    clearError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  // Controlled, auto-resizing text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
      if (inputText.trim()) {
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
      }
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    if (remainingCredits <= 0) {
      onOpenCredits();
      return;
    }

    // If currently recording, stop and attach before submitting
    let finalAudio = attachedAudio;
    if (isRecording) {
      const recResult = await stopRecording();
      if (recResult) {
        finalAudio = recResult;
      }
    }

    const trimmed = inputText.trim();
    if (!trimmed && !attachedImage && !finalAudio) return;

    onSendMessage(
      trimmed,
      attachedImage || undefined,
      undefined,
      finalAudio
        ? {
            data: finalAudio.data,
            mimeType: finalAudio.mimeType,
            duration: finalAudio.duration,
            name: finalAudio.name,
          }
        : undefined
    );

    setInputText('');
    setAttachedImage(null);
    setAttachedAudio(null);
    setIsPlayingPreview(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '28px';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await convertAudioFileToResult(file);
      setAttachedAudio(result);
      clearError();
      soundFx.playClick();
    } catch (err) {
      console.warn('Error reading audio file:', err);
    }
    e.target.value = '';
  };

  // Toggle microphone recording
  const handleMicClick = async () => {
    if (isRecording) {
      const result: RecordedAudioResult | null = await stopRecording();
      if (result) {
        setAttachedAudio(result);
        soundFx.playClick();
      }
    } else {
      soundFx.playClick();
      try {
        const started = await startRecording();
        if (started) {
          // Clear any previous audio preview
          setAttachedAudio(null);
          setIsPlayingPreview(false);
        }
      } catch (err) {
        console.warn('Microphone recording error:', err);
      }
    }
  };

  // Toggle preview playback of recorded audio
  const handleTogglePreviewPlay = () => {
    if (!previewAudioRef.current || !attachedAudio) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play().catch(() => {});
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3">
      {/* Recording Error Notification */}
      {recordingError && (
        <div className="mb-2 p-2.5 rounded-xl bg-zinc-900/95 border border-red-500/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{recordingError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3 h-3 text-[#00E5FF]" />
              <span>Select Audio File</span>
            </button>
            <button
              type="button"
              onClick={() => clearError()}
              className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
              title="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Attachments Preview Area (Image & Audio Voice Note) */}
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Attached Image Preview */}
        {attachedImage && (
          <div className="p-1.5 rounded-xl bg-[#1e1f23] border border-white/10 inline-flex items-center gap-2.5 shadow-md animate-in fade-in">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-zinc-700 bg-black/60 shrink-0">
              <img
                src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`}
                alt="attachment"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <p className="text-zinc-200 font-medium truncate max-w-[160px]">
                {attachedImage.name || 'Attached Image'}
              </p>
              <p className="text-cyan-400 text-[10px] font-mono">Vision Attached</p>
            </div>
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Attached Audio Voice Note Preview */}
        {attachedAudio && (
          <div className="p-1.5 px-2.5 rounded-xl bg-[#1e1f23] border border-cyan-500/30 inline-flex items-center gap-2.5 shadow-md animate-in fade-in">
            <audio
              ref={previewAudioRef}
              src={attachedAudio.blobUrl}
              onPlay={() => setIsPlayingPreview(true)}
              onPause={() => setIsPlayingPreview(false)}
              onEnded={() => setIsPlayingPreview(false)}
            />
            <button
              type="button"
              onClick={handleTogglePreviewPlay}
              className="w-7 h-7 rounded-full bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-[0_0_8px_rgba(0,229,255,0.3)]"
              title={isPlayingPreview ? 'Pause preview' : 'Listen to recording'}
            >
              {isPlayingPreview ? (
                <Pause className="w-3 h-3 fill-current" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>
            <div className="text-xs">
              <div className="flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-[#00E5FF]" />
                <span className="text-zinc-200 font-medium text-[11px]">
                  Voice Note ({attachedAudio.duration}s)
                </span>
              </div>
              <p className="text-emerald-400 text-[10px] font-mono">Audio Attached for AI</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (previewAudioRef.current) previewAudioRef.current.pause();
                setAttachedAudio(null);
                setIsPlayingPreview(false);
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Remove audio recording"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Card Container Matching User Requested Design */}
      <div className="relative rounded-2xl bg-[#1e1f23] border border-white/5 focus-within:border-zinc-700/80 transition-all p-3 sm:p-3.5 shadow-2xl">
        {/* Active Audio Recording Bar */}
        {isRecording ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-red-950/40 border border-red-500/30 mb-2 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs text-red-300 font-semibold tracking-wide">
                {formatTimer(recordingDuration)}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Recording audio for AI...
              </span>
              {/* Wave animation */}
              <div className="flex items-center gap-1 h-3 ml-2">
                {[30, 80, 50, 100, 60, 90, 40, 70].map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h}%` }}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  const result = await stopRecording();
                  if (result) setAttachedAudio(result);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-400 text-white font-medium text-xs transition-colors flex items-center gap-1"
                title="Finish recording"
              >
                <span>Done</span>
              </button>
              <button
                type="button"
                onClick={cancelRecording}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Cancel recording"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Make changes, add new features, ask for anything"
          rows={1}
          style={{ minHeight: '28px', height: '28px' }}
          className="w-full bg-transparent text-zinc-100 placeholder-[#717682] text-sm sm:text-[15px] focus:outline-none resize-none leading-relaxed scrollbar-none"
        />

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between pt-2 mt-1">
          {/* Left Side: Circular Plus Button */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={audioFileInputRef}
              onChange={handleAudioFileChange}
              accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach picture (+)"
              aria-label="Attach picture"
              className="w-8 h-8 rounded-full border border-[#3e4149] hover:border-zinc-400 bg-transparent flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-zinc-400 hover:text-white" />
            </button>

            {/* Google Search Indicator Pill if Matrix Base is active */}
            {selectedModelId === 'matrix-base' && (
              <button
                type="button"
                onClick={() => onToggleSearch(!useSearch)}
                title="Toggle Google Search data grounding"
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] transition-all border ${
                  useSearch
                    ? 'bg-cyan-950/60 text-[#00E5FF] border-[#00E5FF]/40'
                    : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-800/60'
                }`}
              >
                <Globe className={`w-3 h-3 ${useSearch ? 'text-[#00E5FF]' : 'text-zinc-500'}`} />
                <span>Search</span>
              </button>
            )}
          </div>

          {/* Right Side: [Default ˇ] [Mic] [↑] */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Model Selector Pill (e.g. Default ˇ) */}
            <ModelSelector
              currentModelId={selectedModelId}
              onSelectModel={onSelectModel}
              direction="up"
              variant="pill"
              align="right"
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'bg-[#24262b] hover:bg-[#2c2f35] border border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
              title={
                isRecording
                  ? 'Stop recording voice note'
                  : 'Record audio for AI (Microphone)'
              }
              aria-label="Microphone record audio"
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-zinc-300" />
              )}
            </button>

            {/* Send / Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 flex items-center justify-center transition-all cursor-pointer"
                title="Stop response"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  (!inputText.trim() && !attachedImage && !attachedAudio && !isRecording) ||
                  remainingCredits <= 0
                }
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  (inputText.trim() || attachedImage || attachedAudio || isRecording) &&
                  remainingCredits > 0
                    ? 'bg-zinc-200 hover:bg-white text-zinc-950 shadow-md hover:scale-105 active:scale-95'
                    : 'bg-[#24262b] text-zinc-600 border border-white/5 cursor-not-allowed'
                }`}
                title={
                  remainingCredits <= 0
                    ? 'Daily credit quota reached'
                    : 'Send message'
                }
              >
                <ArrowUp className="w-4 h-4 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
