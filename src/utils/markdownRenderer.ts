import { marked } from 'marked';
import Prism from 'prismjs';

// Load Prism language definitions
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-docker';

// Alias dictionary for language resolution
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  python: 'python',
  sh: 'bash',
  bash: 'bash',
  shell: 'bash',
  zsh: 'bash',
  json: 'json',
  html: 'markup',
  xml: 'markup',
  markup: 'markup',
  css: 'css',
  sql: 'sql',
  rust: 'rust',
  rs: 'rust',
  go: 'go',
  golang: 'go',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  cs: 'csharp',
  csharp: 'csharp',
  java: 'java',
  yaml: 'yaml',
  yml: 'yaml',
  docker: 'docker',
  dockerfile: 'docker',
  md: 'markdown',
  markdown: 'markdown',
};

// Human-friendly labels for UI pill
const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'React JSX',
  tsx: 'React TSX',
  python: 'Python',
  bash: 'Bash / Terminal',
  json: 'JSON',
  markup: 'HTML / XML',
  css: 'CSS',
  sql: 'SQL',
  rust: 'Rust',
  go: 'Go',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  java: 'Java',
  yaml: 'YAML',
  docker: 'Dockerfile',
  markdown: 'Markdown',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Custom Prism-powered Code Renderer for Marked
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const rawLang = (lang || '').trim().toLowerCase();
      const resolvedLang = LANGUAGE_ALIASES[rawLang] || rawLang;
      const displayLabel =
        LANGUAGE_LABELS[resolvedLang] || (rawLang ? rawLang.toUpperCase() : 'CODE');

      let highlightedCode: string;
      if (resolvedLang && Prism.languages[resolvedLang]) {
        try {
          highlightedCode = Prism.highlight(text, Prism.languages[resolvedLang], resolvedLang);
        } catch {
          highlightedCode = escapeHtml(text);
        }
      } else {
        highlightedCode = escapeHtml(text);
      }

      const encodedRawCode = encodeURIComponent(text);

      return `
<div class="code-block-wrapper my-3 rounded-xl border border-cyan-500/30 bg-[#070B13] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] group/code">
  <div class="code-block-header flex items-center justify-between px-3.5 py-1.5 bg-[#0B101D] border-b border-slate-800/80 text-[11px] font-mono select-none">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-500/70 border border-rose-500/30"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500/70 border border-amber-500/30"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/70 border border-emerald-500/30"></span>
      </div>
      <span class="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase ml-1 px-1.5 py-0.2 rounded bg-cyan-950/70 border border-cyan-500/30">
        ${escapeHtml(displayLabel)}
      </span>
    </div>

    <button
      type="button"
      class="copy-code-btn inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 border border-transparent hover:border-cyan-500/30 transition-all cursor-pointer"
      data-code="${encodedRawCode}"
      title="Copy code to clipboard"
    >
      <svg class="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke-width="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" stroke-width="2"></path>
      </svg>
      <span class="copy-label pointer-events-none">Copy</span>
    </button>
  </div>
  <pre class="p-3.5 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-200 bg-[#070B13] !m-0 !rounded-none !border-none"><code class="language-${escapeHtml(resolvedLang || 'text')}">${highlightedCode}</code></pre>
</div>`.trim();
    },
  },
});

/**
 * Render Markdown with Prism syntax highlighted code blocks
 */
export function renderMarkdownWithSyntax(content: string): string {
  if (!content) return '';
  try {
    return marked.parse(content) as string;
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return `<div class="whitespace-pre-wrap leading-relaxed">${escapeHtml(content)}</div>`;
  }
}
