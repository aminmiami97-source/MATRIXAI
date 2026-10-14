import { ChatMessage } from '../components/ChatMessageBubble.tsx';

export function exportChatToMarkdown(
  sessionTitle: string,
  messages: ChatMessage[],
  modelId: string
): void {
  if (!messages || messages.length === 0) return;

  const dateString = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const header = [
    `# matrixAI Conversation — ${sessionTitle || 'New Conversation'}`,
    `> **Exported:** ${dateString} | **Model:** ${modelId === 'matrix-lite' ? 'Matrix Lite' : 'Matrix Base'}`,
    '',
    '---',
    '',
  ].join('\n');

  const body = messages
    .map((msg) => {
      const isUser = msg.role === 'user';
      const sender = isUser ? '👤 **You**' : '⚡ **matrixAI**';
      const time = msg.timestamp ? ` *(${msg.timestamp})*` : '';
      const creditNote = msg.creditsSpent !== undefined ? ` \`[${msg.creditsSpent} credits]\`` : '';

      let text = `### ${sender}${time}${creditNote}\n\n`;

      if (msg.image) {
        text += `*[Attached Image: ${msg.image.name || 'Image'} (${msg.image.mimeType})]*\n\n`;
      }

      text += `${msg.content || ''}\n\n`;

      if (msg.grounding?.searchChunks && msg.grounding.searchChunks.length > 0) {
        text += `**Sources:**\n`;
        msg.grounding.searchChunks.forEach((c) => {
          text += `- [${c.title}](${c.uri})\n`;
        });
        text += '\n';
      }

      return text;
    })
    .join('---\n\n');

  const markdownContent = `${header}${body}\n---\n*Exported from matrixAI platform.*\n`;

  // Create Blob and trigger download
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const sanitizedTitle = (sessionTitle || 'chat')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .slice(0, 40);
  anchor.download = `${sanitizedTitle || 'matrix_ai_chat'}_${Date.now()}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
