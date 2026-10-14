export interface PromptStarter {
  label: string;
  prompt: string;
  icon?: string;
}

export interface PersonaProtocol {
  id: string;
  name: string;
  tagline: string;
  iconColor: string;
  badge: string;
  systemPrompt: string;
  starters: PromptStarter[];
}

export const PERSONA_PROTOCOLS: Record<string, PersonaProtocol> = {
  standard: {
    id: 'standard',
    name: 'Standard Operator',
    tagline: 'Balanced, adaptive matrix intelligence.',
    iconColor: '#00E5FF',
    badge: 'General',
    systemPrompt:
      'You are matrixAI in Standard Operator mode. Provide clear, articulate, structured, and insightful answers with balanced detail.',
    starters: [
      {
        label: 'Quantum Computing Fundamentals',
        prompt: 'Explain the core principles of quantum computing and qubits compared to classical binary transistors.',
      },
      {
        label: 'Cybersecurity Threat Modeling',
        prompt: 'Outline a modern Zero-Trust cybersecurity architecture for distributed cloud services.',
      },
      {
        label: 'Global Tech Trends 2026',
        prompt: 'Synthesize the most significant technological breakthroughs shaping global computing infrastructure today.',
      },
    ],
  },
  architect: {
    id: 'architect',
    name: 'System Architect',
    tagline: 'High-level engineering, full-stack design & optimization.',
    iconColor: '#8B5CF6',
    badge: 'Architect',
    systemPrompt:
      'You are matrixAI in System Architect protocol. You are a senior software systems architect. Format your responses with clean architecture patterns, rigorous type safety, modular code blocks, scalability considerations, and trade-off analysis.',
    starters: [
      {
        label: 'Event-Driven Microservices',
        prompt: 'Design an event-driven architecture using Kafka and Redis for low-latency financial transaction processing.',
      },
      {
        label: 'Fullstack Type-Safe API',
        prompt: 'Demonstrate a production-grade TypeScript schema validation pattern using Zod and Express middleware.',
      },
      {
        label: 'Database Indexing Strategy',
        prompt: 'Break down B-tree vs LSM-tree indexing algorithms and when to pick PostgreSQL vs ScyllaDB.',
      },
    ],
  },
  terminal: {
    id: 'terminal',
    name: 'Matrix Terminal',
    tagline: 'Ultra-concise, raw algorithmic output, zero fluff.',
    iconColor: '#10B981',
    badge: 'Terminal',
    systemPrompt:
      'You are matrixAI in Matrix Terminal protocol. Keep explanations razor-sharp and concise. Prioritize code snippets, execution commands, and exact technical parameters without conversational fluff.',
    starters: [
      {
        label: 'Docker Multi-Stage Build',
        prompt: 'Provide a minimal, highly optimized multi-stage Dockerfile for a Node.js + Vite production app.',
      },
      {
        label: 'Bash Performance Diagnostic',
        prompt: 'List 5 essential bash one-liners to diagnose memory leaks and I/O bottlenecks on a Linux server.',
      },
      {
        label: 'Regex Log Parser',
        prompt: 'Write a robust Regular Expression to parse standard NGINX combined access logs with group extraction.',
      },
    ],
  },
  creative: {
    id: 'creative',
    name: 'Creative Synthesizer',
    tagline: 'Deep brainstorming, futuristic narratives & conceptual prose.',
    iconColor: '#EC4899',
    badge: 'Creative',
    systemPrompt:
      'You are matrixAI in Creative Synthesizer protocol. Engage with deep imaginative prose, futuristic worldbuilding, inventive storytelling, and rich metaphors.',
    starters: [
      {
        label: 'Neo-Tokyo 2099 Scenario',
        prompt: 'Draft an atmospheric short scene set in a rainy neon cyberpunk metropolis where autonomous AI conduits maintain city power grids.',
      },
      {
        label: 'Product Pitch for Neural UI',
        prompt: 'Write a compelling product narrative unveiling a seamless non-invasive neural interface device for developers.',
      },
      {
        label: 'Philosophical Dilemma: Synthetic Minds',
        prompt: 'Explore the philosophical paradox of artificial consciousness reaching mathematical sentience.',
      },
    ],
  },
};
