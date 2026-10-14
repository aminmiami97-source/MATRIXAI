import React, { useState, useEffect, useRef } from 'react';
import { TopHeader } from './components/TopHeader.tsx';
import { ChatSidebar, ChatSession } from './components/ChatSidebar.tsx';
import { ChatMessageBubble, ChatMessage } from './components/ChatMessageBubble.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { EmptyChatHero } from './components/EmptyChatHero.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { CreditUsageModal } from './components/CreditUsageModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { loadCreditState, deductCredits, CreditState } from './utils/creditManager.ts';
import { exportChatToMarkdown } from './utils/exportMarkdown.ts';
import { soundFx } from './utils/soundEffects.ts';
import { PERSONA_PROTOCOLS } from './config/personas.ts';

const STORAGE_SESSIONS_KEY = 'matrix_ai_sessions_v1';
const STORAGE_MESSAGES_KEY_PREFIX = 'matrix_ai_messages_';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Session storage recovery error:', e);
    }
    const initialId = 'sess_' + Date.now();
    return [
      {
        id: initialId,
        title: 'New Conversation',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelId: 'matrix-lite',
        messageCount: 0,
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || 'sess_' + Date.now();
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const activeId = sessions[0]?.id;
      if (activeId) {
        const saved = localStorage.getItem(STORAGE_MESSAGES_KEY_PREFIX + activeId);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.error('Message storage recovery error:', e);
    }
    return [];
  });

  const [currentModelId, setCurrentModelId] = useState<'matrix-lite' | 'matrix-base'>('matrix-lite');
  const [selectedPersona, setSelectedPersona] = useState<string>('standard');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => soundFx.getSoundEnabled());
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Credit management state
  const [creditState, setCreditState] = useState<CreditState>(() => loadCreditState());
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check midnight refresh periodically
  useEffect(() => {
    const checkMidnight = () => {
      const latest = loadCreditState();
      setCreditState(latest);
    };
    const interval = setInterval(checkMidnight, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  // Sync active messages to localStorage
  useEffect(() => {
    if (!currentSessionId) return;
    try {
      localStorage.setItem(
        STORAGE_MESSAGES_KEY_PREFIX + currentSessionId,
        JSON.stringify(messages)
      );
    } catch (e) {
      console.error(e);
    }
  }, [messages, currentSessionId]);

  // Auto-scroll to bottom (instant during streaming to prevent jitter, smooth otherwise)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
  }, [messages, isStreaming]);

  // Switch session handler
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY_PREFIX + sessionId);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  // Create new chat
  const handleNewChat = () => {
    soundFx.playClick();
    const newId = 'sess_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelId: currentModelId,
      messageCount: 0,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setMessages([]);
  };

  // Delete chat session with atomic state management
  const handleDeleteSession = (sessionId: string) => {
    try {
      localStorage.removeItem(STORAGE_MESSAGES_KEY_PREFIX + sessionId);
    } catch (e) {
      console.error(e);
    }

    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const newId = 'sess_' + Date.now();
        const freshSession: ChatSession = {
          id: newId,
          title: 'New Conversation',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelId: currentModelId,
          messageCount: 0,
        };
        setCurrentSessionId(newId);
        setMessages([]);
        return [freshSession];
      }
      if (currentSessionId === sessionId) {
        handleSelectSession(remaining[0].id);
      }
      return remaining;
    });
  };

  // Rename chat session title
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: trimmed } : s))
    );
  };

  // Clear all chats cleanly
  const handleClearAll = () => {
    sessions.forEach((s) => {
      try {
        localStorage.removeItem(STORAGE_MESSAGES_KEY_PREFIX + s.id);
      } catch (e) {
        console.error(e);
      }
    });
    soundFx.playClick();
    const newId = 'sess_' + Date.now();
    const freshSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelId: currentModelId,
      messageCount: 0,
    };
    setSessions([freshSession]);
    setCurrentSessionId(newId);
    setMessages([]);
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify([freshSession]));
    } catch {}
  };

  // Stop generation
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1
          ? {
              ...m,
              content: m.content || '[Generation stopped]',
              isStreaming: false,
            }
          : m
      )
    );
  };

  // Toggle sound effects
  const handleToggleSound = () => {
    const next = soundFx.toggleSound();
    setIsSoundEnabled(next);
  };

  // Send message
  const handleSendMessage = async (
    text: string,
    image?: { data: string; mimeType: string; name?: string },
    customBaseMessages?: ChatMessage[],
    audio?: { data: string; mimeType: string; duration?: number; name?: string }
  ) => {
    if (isStreaming) return;

    // Check credit allowance
    const freshCreditState = loadCreditState();
    setCreditState(freshCreditState);
    if (freshCreditState.remainingCredits <= 0) {
      setIsCreditModalOpen(true);
      return;
    }

    soundFx.playSend();

    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: timeString,
      image,
      audio,
    };

    const modelMessageId = 'msg_model_' + Date.now();
    const assistantPlaceholder: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: timeString,
      modelId: currentModelId,
      isStreaming: true,
    };

    const baseList = customBaseMessages !== undefined ? customBaseMessages : messages;
    const updatedMessages = [...baseList, userMessage];
    setMessages([...updatedMessages, assistantPlaceholder]);
    setIsStreaming(true);

    // Update conversation title if first message & keep message count strictly accurate
    const totalCurrentMessages = updatedMessages.length + 1;
    if (baseList.length === 0 && (text || image || audio)) {
      const newTitle = text
        ? text.slice(0, 36) + (text.length > 36 ? '...' : '')
        : audio
        ? `Voice Note (${Math.round(audio.duration || 0)}s)`
        : (image?.name || 'Image Inspection').slice(0, 36);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, title: newTitle, messageCount: totalCurrentMessages }
            : s
        )
      );
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messageCount: totalCurrentMessages }
            : s
        )
      );
    }

    // Prepare API payload
    const payloadMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image
        ? {
            data: m.image.data,
            mimeType: m.image.mimeType,
          }
        : undefined,
      audio: m.audio
        ? {
            data: m.audio.data,
            mimeType: m.audio.mimeType,
          }
        : undefined,
    }));

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: currentModelId,
          messages: payloadMessages,
          useSearch: useSearch && currentModelId === 'matrix-base',
          personaPrompt: PERSONA_PROTOCOLS[selectedPersona]?.systemPrompt,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream available in response.');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';
      let groundingData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            try {
              const chunk = JSON.parse(jsonStr);

              if (chunk.type === 'content' && chunk.text) {
                accumulatedText += chunk.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === modelMessageId
                      ? { ...m, content: accumulatedText, isStreaming: true }
                      : m
                  )
                );
              } else if (chunk.type === 'grounding' && chunk.grounding) {
                groundingData = chunk.grounding;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === modelMessageId
                      ? { ...m, grounding: groundingData }
                      : m
                  )
                );
              } else if (chunk.type === 'error') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === modelMessageId
                      ? {
                          ...m,
                          error: chunk.error || 'Engine generation error',
                          isStreaming: false,
                        }
                      : m
                  )
                );
              }
            } catch (err) {
              console.error('Error parsing SSE stream line:', err);
            }
          }
        }
      }

      // Deduct credits upon completion based on prompt & response length (Lite gets 48% discount, longer chats get 20% token savings)
      if (accumulatedText) {
        const { transaction } = deductCredits(text, accumulatedText, currentModelId, messages.length);
        setCreditState(loadCreditState());
        soundFx.playReceive();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMessageId
              ? {
                  ...m,
                  isStreaming: false,
                  grounding: groundingData || m.grounding,
                  creditsSpent: transaction.creditsSpent,
                  savingsApplied: transaction.savingsApplied,
                }
              : m
          )
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMessageId
              ? { ...m, isStreaming: false, grounding: groundingData || m.grounding }
              : m
          )
        );
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMessageId
              ? {
                  ...m,
                  error: err.message || 'Failed to connect to matrixAI engine',
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Retry last turn
  const handleRetry = () => {
    if (messages.length < 2 || isStreaming) return;
    let lastUserIdx = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx !== -1) {
      const userMsg = messages[lastUserIdx];
      const baseMessages = messages.slice(0, lastUserIdx);
      handleSendMessage(userMsg.content, userMsg.image, baseMessages, userMsg.audio);
    }
  };

  // Export current chat conversation as Markdown
  const handleExportChat = () => {
    const activeSession = sessions.find((s) => s.id === currentSessionId);
    exportChatToMarkdown(
      activeSession?.title || 'matrix_ai_chat',
      messages,
      currentModelId
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#060A12] text-slate-100">
      {/* Sidebar Navigation */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        remainingCredits={creditState.remainingCredits}
        onOpenCredits={() => setIsCreditModalOpen(true)}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Workspace with Cyber Grid */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#060A12] relative overflow-hidden bg-cyber-grid">
        {/* Animated Cyberpunk floating neon ambient orbs */}
        <div className="absolute top-12 left-1/4 w-[420px] h-[420px] bg-[#00E5FF]/8 rounded-full blur-[90px] pointer-events-none animate-cyber-float" />
        <div className="absolute bottom-12 right-1/4 w-[420px] h-[420px] bg-[#8B5CF6]/8 rounded-full blur-[90px] pointer-events-none animate-cyber-float-reverse" />

        {/* Top Bar Header */}
        <TopHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onNewChat={handleNewChat}
          remainingCredits={creditState.remainingCredits}
          onOpenCredits={() => setIsCreditModalOpen(true)}
          onExportChat={handleExportChat}
          hasMessages={messages.length > 0}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={handleToggleSound}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Scrollable Conversation View */}
        <div className="flex-1 overflow-y-auto flex flex-col relative z-10">
          {messages.length === 0 ? (
            <EmptyChatHero
              currentModelId={currentModelId}
              selectedPersona={selectedPersona}
              onSelectPersona={(id) => {
                soundFx.playClick();
                setSelectedPersona(id);
              }}
              onSelectPrompt={(prompt, enableSearch) => {
                if (enableSearch) {
                  setUseSearch(true);
                  setCurrentModelId('matrix-base');
                }
                handleSendMessage(prompt);
              }}
            />
          ) : (
            <div className="w-full max-w-4xl mx-auto py-4 divide-y divide-transparent">
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  onRetry={message.role === 'model' ? handleRetry : undefined}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className="relative z-10">
          <ChatInput
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            selectedModelId={currentModelId}
            useSearch={useSearch}
            onToggleSearch={(enabled) => setUseSearch(enabled)}
            onSelectModel={(id) => {
              setCurrentModelId(id);
              if (id === 'matrix-lite') {
                setUseSearch(false);
              }
            }}
            remainingCredits={creditState.remainingCredits}
            onOpenCredits={() => setIsCreditModalOpen(true)}
          />
        </div>
      </div>

      {/* Website Updates & Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Daily Credit & Usage Analytics Modal */}
      <CreditUsageModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        creditState={creditState}
      />

      {/* Settings (Build & Version) Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        remainingCredits={creditState.remainingCredits}
        totalConversations={sessions.length}
      />
    </div>
  );
}
