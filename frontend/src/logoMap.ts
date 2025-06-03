// Map of model and mini app names to logo image paths
const logoMap: Record<string, { light: string; dark?: string }> = {
  'chatgpt': { light: '/images/ChatGPT-Logo.png' },
  'openai': { light: '/images/openai-icon-2021x2048-4rpe5x7n.png' },
  'gemini': { light: '/images/gemini-logo_brandlogos.net_fwajr-512x512.png', dark: '/images/gemini.png' },
  'claude': { light: '/images/claude-1.png', dark: '/images/claude4477.logowik.com.webp' },
  // Add mini app logos here, e.g.:
  'aistudio': { light: '/images/aistudio.svg' },
  'abacus': { light: '/images/abacus.webp' },
  'duckduckgo': { light: '/images/duckduckgo.webp' },
  'grok': { light: '/images/grok-x.png', dark: '/images/grok.png' },
  'lechat': { light: '/images/lechat.png' },
  'n8n': { light: '/images/n8n.svg' },
  'notebooklm': { light: '/images/notebooklm.svg' },
  'perplexity': { light: '/images/perplexity.webp' },
  'poe': { light: '/images/poe.webp' },
  'qwenlm': { light: '/images/qwenlm.webp' },
  'sparkdesk': { light: '/images/sparkdesk.webp' },
  'dify': { light: '/images/dify.svg' },
  'github-copilot': { light: '/images/github-copilot.webp' },
  'default': { light: '/images/aistudio.svg' }
};

export default logoMap;
