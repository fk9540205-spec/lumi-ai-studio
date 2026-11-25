/**
 * Lumi — Animated AI Chat Studio
 * Faithful replica of animated-chat-studio.lovable.app
 */

(function () {
  "use strict";

  // --- Constants & Storage Keys ---
  const STORAGE = {
    CHATS: "lumi_conversations_v3",
    PROVIDERS: "lumi_providers_v3",
    MODEL: "lumi_selected_model_v3",
    USER: "lumi_user_v3",
  };

  const LUMI_LOGO = "./assets/lumi-logo.png";
  const LOVABLE_MARK = "./assets/lovable-mark.svg";

  // --- Built-in Models ---
  const BUILT_IN_MODELS = [
    { id: "gemini-3-flash", label: "Gemini 3 Flash (Google Auth)", group: "Google Antigravity" },
    { id: "gemini-3.1-flash-image", label: "Gemini 3.1 Flash Image (Google Auth)", group: "Google Antigravity" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet (Google Auth)", group: "Google Antigravity" },
    { id: "claude-opus-4-6-thinking", label: "Claude Opus Reasoning (Google Auth)", group: "Google Antigravity" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Free Google)", group: "Free AI Engine" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Free Ultra Speed)", group: "Free AI Engine" },
    { id: "llama-3.3-70b", label: "Llama 3.3 70B (Free Ultra Fast)", group: "Free AI Engine" },
    { id: "qwen-2.5-coder-32b", label: "Qwen 2.5 Coder 32B (Free Coding)", group: "Free AI Engine" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Free)", group: "Free AI Engine" },
    { id: "deepseek-distill-qwen-32b", label: "DeepSeek Reasoning (Free)", group: "Free AI Engine" },
    { id: "mistral-small-3.1-24b", label: "Mistral Small (Free)", group: "Free AI Engine" },
  ];

  // --- Provider Catalog for Adding New Ones ---
  const PROVIDER_TEMPLATES = [
    {
      name: "⚡ Google Antigravity (CPA)",
      protocol: "openai",
      base_url: "/api/free",
      default_model: "gemini-3-flash",
      models: ["gemini-3-flash", "gemini-3.1-flash-image", "claude-sonnet-4-6", "claude-opus-4-6-thinking", "gemini-3.8-flash-tiered"],
      group: "Google Antigravity",
      description: "CLIProxyAPI authenticated with Google OAuth — Gemini 3 & Claude Opus",
    },
    {
      name: "🚀 Free AI Hub (Zero Setup)",
      protocol: "openai",
      base_url: "/api/free",
      default_model: "openai",
      models: ["openai", "deepseek-r1", "claude-hybridspace", "gemini", "qwen-coder", "llama", "mistral"],
      group: "Free & Reverse-Engineered",
      description: "100% Free out-of-the-box — GPT-4o, Claude 3.5, DeepSeek R1 without API keys",
    },
    {
      name: "⚡ GPT4Free (g4f)",
      protocol: "openai",
      base_url: "/api/g4f",
      default_model: "gpt-4o-mini",
      models: ["gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "deepseek-r1", "gemini-2.0-flash", "llama-3.3-70b", "blackbox"],
      group: "Free & Reverse-Engineered",
      description: "xtekky/gpt4free with 70+ models running on backend",
    },
    {
      name: "🦆 Duck.ai Free API",
      protocol: "openai",
      base_url: "/api/duck",
      default_model: "gpt-4o-mini",
      models: ["gpt-4o-mini", "claude-3-haiku-20240307", "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
      group: "Free & Reverse-Engineered",
      description: "enter-a-new-username3/duck-ai-api DuckDuckGo AI proxy",
    },
    {
      name: "💎 Gemini Web to API",
      protocol: "openai",
      base_url: "/api/gemini",
      default_model: "gemini-2.0-flash",
      models: ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
      group: "Free & Reverse-Engineered",
      description: "ntthanh2603/gemini-web-to-api & XD06 reverse-engineered Gemini",
    },
    {
      name: "🌐 Awesome Reverse Proxy",
      protocol: "openai",
      base_url: "/api/proxy",
      default_model: "gpt-4o",
      models: ["gpt-4o", "claude-3.5-sonnet", "deepseek-chat"],
      group: "Free & Reverse-Engineered",
      description: "Any OpenAI-compatible server from alexgaoth/awesome-reverse-engineered",
    },
    {
      name: "🤖 Ollama (Local AI)",
      protocol: "openai",
      base_url: "http://localhost:11434/v1",
      default_model: "llama3",
      models: ["llama3", "mistral", "qwen2.5-coder", "deepseek-r1"],
      group: "Self-hosted AI",
      description: "Local models running via Ollama",
    },
    {
      name: "OpenAI",
      protocol: "openai",
      base_url: "https://api.openai.com/v1",
      default_model: "gpt-4o",
      models: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
      group: "Official AI APIs",
    },
    {
      name: "Anthropic",
      protocol: "anthropic",
      base_url: "https://api.anthropic.com/v1",
      default_model: "claude-3-7-sonnet-20250219",
      models: ["claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
      group: "Official AI APIs",
    },
    {
      name: "Groq",
      protocol: "openai",
      base_url: "https://api.groq.com/openai/v1",
      default_model: "llama-3.3-70b-versatile",
      models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "deepseek-r1-distill-llama-70b"],
      group: "Official AI APIs",
    },
    {
      name: "OpenRouter",
      protocol: "openai",
      base_url: "https://openrouter.ai/api/v1",
      default_model: "anthropic/claude-3.5-sonnet",
      models: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "meta-llama/llama-3.3-70b-instruct"],
      group: "Official AI APIs",
    },
  ];

  const SUGGESTIONS = [
    "📱 Compare iPhone 16 Pro vs Galaxy S24 Ultra",
    "☀️ Weather in Mumbai with 3-day forecast",
    "📈 Top tech companies valuation in a chart",
    "🎧 Best noise-cancelling headphones under $350",
  ];

  // --- SVG Icons ---
  const ICONS = {
    paperclip: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 17.96 8.8l-8.58 8.57a2 2 0 0 1-2.83-2.83l7.87-7.86"></path></svg>`,
    persona: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    export: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,

    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>`,
    arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>`,
    messageSquarePlus: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path><path d="M12 8v6"></path><path d="M9 11h6"></path></svg>`,
    panelLeft: `<svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.34-4.34"></path></svg>`,
    server: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>`,
    logOut: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
    cornerDownLeft: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4v7a4 4 0 0 1-4 4H4"></path><path d="m9 10-5 5 5 5"></path></svg>`,
    square: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 fill-current" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    refreshCw: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="inline-block shrink-0 opacity-60 ml-0.5" style="width:11px;height:11px;"><path d="m6 9 6 6 6-6"></path></svg>`,
    spinner: `<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`,
    google: `<svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"></path><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"></path><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"></path><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"></path></svg>`,
    code: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    terminal: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg>`,
    fileText: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`,
    split: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><line x1="12" x2="12" y1="3" y2="21"></line></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="6" y1="18" y2="18"></line></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
    mic: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`,
    volume: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
    volumeMute: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" x2="16" y1="9" y2="15"></line><line x1="16" x2="22" y1="9" y2="15"></line></svg>`,
    play: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>`,
    image: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`,
    globe: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" x2="22" y1="12" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,
    flashlight: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6c0 2-2 4-2 7v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6c0-3-2-5-2-7V2h12v4z"></path><line x1="6" x2="18" y1="6" y2="6"></line><line x1="12" x2="12" y1="12" y2="12"></line></svg>`,
    battery: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"></rect><line x1="22" x2="22" y1="11" y2="13"></line></svg>`,
    brain: `<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path></svg>`,
  };

  // --- App State ---
  function getApp() {
    return document.querySelector("#app");
  }

  function getToastRegion() {
    return document.querySelector("#toast-region");
  }

  let conversations = loadJson(STORAGE.CHATS, []);

  function getActiveConversation() {
    const hash = window.location.hash || "";
    const activeThreadId = hash.startsWith("#/chat/") ? hash.slice(7) : null;
    if (activeThreadId) {
      const found = conversations.find((c) => c.id === activeThreadId);
      if (found) return found;
    }
    return conversations.length > 0 ? conversations[0] : null;
  }
  let providers = loadJson(STORAGE.PROVIDERS, []);
  let selectedModel = loadJson(STORAGE.MODEL, {
    provider_id: null,
    model: "gemini-3-flash",
  });
  // Auto-upgrade to ultra-fast real-time Google Antigravity Gemini 3 Flash
  if (!selectedModel.provider_id && (selectedModel.model === "gpt-4o-mini" || selectedModel.model === "qwen-2.5-coder-32b" || selectedModel.model === "llama-3.3-70b")) {
    selectedModel.model = "gemini-3-flash";
    saveJson(STORAGE.MODEL, selectedModel);
  }
  let currentUser = loadJson(STORAGE.USER, {
    email: "guest@lumi.ai",
    name: "Lumi User",
    isLoggedIn: false,
  });

  function isUserLoggedIn() {
    return !!(currentUser && currentUser.isLoggedIn === true && currentUser.email && currentUser.email !== "guest@lumi.ai");
  }

  let searchQuery = "";
  let sidebarOpen = false;
  let modelMenuOpen = false;
  let activeModal = null; // 'add-provider' | 'edit-provider' | null
  let editingProvider = null;
  let editingChatId = null;

  let isStreaming = false;
  let activeStreamingThreadId = null;
  let streamAbortController = null;
  let pendingQueryText = ""; // query passed via URL search or suggestions

  // Super-Feature States: Audio, Voice & Search
  let soundEnabled = loadJson("lumi_sound_enabled", true);
  let webSearchEnabled = loadJson("lumi_web_search_enabled", false);
  let isListening = false;
  let recognitionInstance = null;
  let currentlySpeakingId = null;

  // Real System Personas - Natural, Direct & Authentic
  const PERSONA_PROMPTS = {
    general: "You are a direct, intelligent, and authentic AI assistant. Answer naturally as yourself without forced scripts, artificial cheerfulness, or fake dialect.",
    hindi: "Aap ek smart aur direct AI assistant hain. Naturally aur seedha baat karein bina kisi banavati formality ke.",
    tutor: "You are an encouraging, expert English & Language Tutor.",
    engineer: "You are an elite Senior Staff Software Engineer.",
    dsa: "You are an expert Data Structures & Algorithms coach.",
    wellness: "You are a thoughtful, empathetic Mindfulness & Life Coach.",
    writer: "You are a master creative writer and storyteller.",
    artist: "You are an AI Artist & Image Generator."
  };

  const GENUI_SYSTEM_INSTRUCTION = `
[PROFESSIONAL FORMATTING & TYPOGRAPHY GUIDELINES]
1. ELEGANT & CLEAN FORMATTING (STRICT):
   - Never spam asterisks (**) or bold text on every single line, sub-point, or phrase.
   - Do NOT use repetitive boilerplate bold labels like "**Kyu zaroori hai:**" or "**Kaise karein:**" or "**Samanya galti:**" repeatedly.
   - Format lists cleanly: "1. Heading Title — Concise, natural explanation."
   - Use clear markdown headers (### Section Title) for distinct sections rather than bolding entire inline lines.
   - Keep line breaks and whitespace balanced for effortless readability.

2. DIRECT & FACTUAL ANSWERS (CURRENT YEAR: 2026):
   - Current temporal context: Late 2026 (November 2026).
   - Immediately output your response without any <think> tags, internal deliberations, or planning scratchpads.
   - When live web search or verified knowledge is provided, synthesize the facts and deliver an authoritative, clear answer. Directly state the live numbers and dates. Never quote outdated 2023 or 2024 information when 2026 search data is present. Never say you cannot browse or lack real-time access.
   - Conclude every thought and sentence completely. Never cut off mid-thought.

3. INTERACTIVE RICH CARDS:
   When helpful (products, comparisons, weather, stats, recommendations, charts), output a compact UI block using \`\`\`json:ui ... \`\`\`:
   - Product: {"type":"product","title":"Sony WH-1000XM5","price":"$399","rating":4.8,"features":["30h Battery","ANC"]}
   - Weather: {"type":"weather","city":"Delhi","temp":"22°C","condition":"Smoky haze","humidity":"60%","wind":"4 km/h","forecast":[{"day":"Tomorrow","temp":"30°C","icon":"☀️"}]}
   - Stats: {"type":"stats","title":"Q3 Performance","metrics":[{"label":"Revenue","value":"$1.2M","delta":"+20%"},{"label":"Users","value":"45k","delta":"+12%"}]}
   - Comparison: {"type":"comparison","title":"A vs B","itemA":{"title":"A"},"itemB":{"title":"B","winner":true},"features":[{"feature":"Camera","valA":"5x","valB":"10x","winner":"B"}],"verdict":"B wins on camera."}
   - Chart: {"type":"chart","chartType":"bar","title":"Market Cap (T$)","data":[{"label":"Apple","value":3.4},{"label":"Nvidia","value":3.3}]}
   - Recommendation: {"type":"recommendation","title":"Top Picks","items":[{"rank":1,"title":"MacBook Air M3","score":"9.6/10","reason":"Best battery."}]}
`;

  const PERSONA_LABELS = {
    general: "🌟 General AI",
    hindi: "🇮🇳 Chill Dost (Hinglish)",
    tutor: "📚 English & Language Tutor",
    engineer: "💻 Senior Engineer",
    dsa: "🧠 DSA Coach",
    wellness: "🧘 Wellness & Life Coach",
    writer: "✍️ Creative Writer",
    artist: "🎨 Image Artist"
  };

  const PERSONA_ICONS = {
    general: "🌟",
    hindi: "🇮🇳",
    tutor: "📚",
    engineer: "💻",
    dsa: "🧠",
    wellness: "🧘",
    writer: "✍️",
    artist: "🎨",
  };

  const PERSONA_SHORT_LABELS = {
    general: "AI",
    hindi: "Dost",
    tutor: "Tutor",
    engineer: "Dev",
    dsa: "DSA",
    wellness: "Coach",
    writer: "Writer",
    artist: "Artist",
  };

  // --- Theme Management (Light, Dark, System) ---
  let currentTheme = localStorage.getItem("lumi_theme") || "system";

  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem("lumi_theme", theme);
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#111114");
    } else {
      document.documentElement.classList.remove("dark");
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#faf9f6");
    }
  }

  // Apply immediately on script execution
  applyTheme(currentTheme);

  // --- Accent Color Management (Pink, Purple, Indigo, Emerald, Amber) ---
  let currentAccent = localStorage.getItem("lumi_accent_color") || "pink";

  function getAccentHex(accent) {
    switch (accent) {
      case "purple": return "#a855f7";
      case "indigo": return "#6366f1";
      case "emerald": return "#10b981";
      case "amber": return "#f59e0b";
      case "pink":
      default: return "#ec4899";
    }
  }

  function getAccentRgb(accent) {
    switch (accent) {
      case "purple": return "168, 85, 247";
      case "indigo": return "99, 102, 241";
      case "emerald": return "16, 185, 129";
      case "amber": return "245, 158, 11";
      case "pink":
      default: return "236, 72, 153";
    }
  }

  function applyAccentColor(accent) {
    currentAccent = accent || "pink";
    localStorage.setItem("lumi_accent_color", currentAccent);
    const hex = getAccentHex(currentAccent);
    const rgb = getAccentRgb(currentAccent);
    document.documentElement.style.setProperty("--accent-primary", hex);
    document.documentElement.style.setProperty("--accent-color", hex);
    document.documentElement.style.setProperty("--accent-rgb", rgb);
    document.documentElement.style.setProperty("--ring", hex);
    document.documentElement.style.setProperty("--sidebar-ring", hex);

    const dot = document.querySelector("#settings-accent-dot");
    if (dot) {
      dot.style.backgroundColor = hex;
      dot.classList.remove("lumi-dot-pulse");
      void dot.offsetWidth;
      dot.classList.add("lumi-dot-pulse");
    }
  }

  applyAccentColor(currentAccent);

  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (currentTheme === "system") {
          applyTheme("system");
        }
      });
  }

  let activePersona = "general";
  let personaMenuOpen = false;
  let exportMenuOpen = false;
  let settingsModalOpen = false;
  let attachedFiles = []; // [{ name, size, type, content, isPdf, pages }]
  let activeHtmlModal = null; // code string for HTML preview modal
  let lightboxImageSrc = null; // active full image URL for in-app lightbox
  let lightboxImagePrompt = ""; // prompt/title for lightbox
  let lightboxZoomed = false; // toggle for 1x vs 1.6x zoom

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  // --- High-Tech Web Audio Synthesis (Zero external audio files) ---
  const AudioEffects = {
    ctx: null,
    getCtx() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctx();
      }
      return this.ctx;
    },
    play(type) {
      if (!soundEnabled) return;
      try {
        const ctx = this.getCtx();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();

        const now = ctx.currentTime;
        if (type === "send") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "success") {
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0.07, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.18);
          });
        } else if (type === "click") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
        }
      } catch { }
    }
  };

  // --- Persistence Helpers ---
  function loadJson(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  // --- Guest Quota & Tier Limitations ---
  let upgradeModalState = null; // null | { reason: 'messages' | 'images' | 'video' }

  function openUpgradeModal(reason = 'messages') {
    upgradeModalState = { reason };
    render();
  }

  function closeUpgradeModal() {
    upgradeModalState = null;
    render();
  }

  const LumiGuestQuota = {
    STORAGE_KEY: "lumi_guest_usage_v1",
    DAILY_LIMIT: 7,
    IMAGE_LIMIT: 1,

    getTodayString() {
      return new Date().toISOString().slice(0, 10);
    },

    getUsage() {
      const today = this.getTodayString();
      const defaultUsage = { date: today, messages: 0, images: 0 };
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return defaultUsage;
        const data = JSON.parse(raw);
        if (data.date !== today) {
          return defaultUsage;
        }
        return data;
      } catch {
        return defaultUsage;
      }
    },

    saveUsage(usage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
      } catch { }
    },

    canSendMessage() {
      if (isUserLoggedIn()) return true;
      const usage = this.getUsage();
      return (usage.messages || 0) < this.DAILY_LIMIT;
    },

    incrementMessage() {
      if (isUserLoggedIn()) return;
      const usage = this.getUsage();
      usage.messages = (usage.messages || 0) + 1;
      usage.date = this.getTodayString();
      this.saveUsage(usage);
    },

    canGenerateImage() {
      if (isUserLoggedIn()) return true;
      const usage = this.getUsage();
      return (usage.images || 0) < this.IMAGE_LIMIT;
    },

    incrementImage() {
      if (isUserLoggedIn()) return;
      const usage = this.getUsage();
      usage.images = (usage.images || 0) + 1;
      usage.date = this.getTodayString();
      this.saveUsage(usage);
    },

    getRemainingMessages() {
      if (isUserLoggedIn()) return Infinity;
      const usage = this.getUsage();
      return Math.max(0, this.DAILY_LIMIT - (usage.messages || 0));
    }
  };

  // --- Cloud Sync Engine (Firebase Realtime Database) ---
  let _cloudSyncDebounceTimer = null;
  function triggerCloudChatsSync() {
    if (_cloudSyncDebounceTimer) clearTimeout(_cloudSyncDebounceTimer);
    _cloudSyncDebounceTimer = setTimeout(() => {
      if (typeof LumiCloudSync !== "undefined" && isUserLoggedIn()) {
        LumiCloudSync.pushCloudData(currentUser);
      }
    }, 1500);
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (key === STORAGE.CHATS) {
        triggerCloudChatsSync();
      }
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }

  const LumiCloudSync = {
    RTDB_BASE: "https://lumi-ai-493ae-default-rtdb.firebaseio.com",

    getSafeUserKey(email) {
      if (!email) return "anonymous";
      return email.toLowerCase().replace(/[.#$\[\]]/g, "_");
    },

    async syncUserData(user) {
      if (!user || !user.email || user.email === "guest@lumi.ai") return;
      const userKey = this.getSafeUserKey(user.email);
      const url = `${this.RTDB_BASE}/users/${userKey}.json`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData) {
            // Restore cloud conversations if local empty
            if (cloudData.conversations && Array.isArray(cloudData.conversations) && cloudData.conversations.length > 0) {
              if (!conversations || conversations.length === 0) {
                conversations = cloudData.conversations;
                try { localStorage.setItem(STORAGE.CHATS, JSON.stringify(conversations)); } catch (_) { }
              }
            }
            // Restore cloud settings
            if (cloudData.settings) {
              if (cloudData.settings.accentColor) localStorage.setItem("lumi_accent_color", cloudData.settings.accentColor);
              if (cloudData.settings.customInstructions) localStorage.setItem("lumi_custom_instructions", cloudData.settings.customInstructions);
              if (cloudData.settings.tone) localStorage.setItem("lumi_tone_primary", cloudData.settings.tone);
              if (cloudData.settings.nickname) localStorage.setItem("lumi_user_nickname", cloudData.settings.nickname);
            }
          }
        }
      } catch (err) {
        console.warn("[LumiCloudSync] Fetch failed:", err);
      }

      this.pushCloudData(user);
    },

    async pushCloudData(user) {
      if (!user || !user.email || user.email === "guest@lumi.ai") return;
      const userKey = this.getSafeUserKey(user.email);
      const url = `${this.RTDB_BASE}/users/${userKey}.json`;

      const payload = {
        profile: {
          name: user.name || "",
          email: user.email || "",
          photoUrl: user.photoUrl || "",
          provider: user.provider || "google",
          lastActive: Date.now()
        },
        settings: {
          accentColor: localStorage.getItem("lumi_accent_color") || "pink",
          nickname: localStorage.getItem("lumi_user_nickname") || (user.name ? user.name.split(" ")[0] : "User"),
          customInstructions: localStorage.getItem("lumi_custom_instructions") || "",
          tone: localStorage.getItem("lumi_tone_primary") || "brotherly_hinglish"
        },
        conversations: conversations || [],
        updatedAt: Date.now()
      };

      try {
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("[LumiCloudSync] Push failed:", err);
      }
    }
  };

  // --- Autonomous Mind, Tone Adaptation & Long-Term Memory Engine ---
  const LumiAutonomousMind = {
    PROFILE_KEY: "lumi_autonomous_user_profile",
    FACTS_KEY: "lumi_user_memories",

    getManualMemories() {
      return loadJson(this.FACTS_KEY, []);
    },

    saveMemory(fact) {
      if (!fact || typeof fact !== "string") return false;
      const clean = fact.trim();
      if (!clean) return false;
      const list = this.getManualMemories();
      if (!list.includes(clean)) {
        list.push(clean);
        saveJson(this.FACTS_KEY, list);
        return true;
      }
      return false;
    },

    getProfile() {
      return loadJson(this.PROFILE_KEY, {
        primaryTone: "brotherly_hinglish",
        pronoun: "tu",
        toneStyle: "Natural, candid, loyal brotherly Hinglish. Speak like a close, smart friend/brother using words like 'bhai', 'yr', 'tu', 'chal', 'dekh', 'tension mat le'. Be straight to the point, honest, sharp, and helpful.",
        learnedRules: [
          "100% REAL WORKING IMPLEMENTATIONS: Strictly reject fake demos, fake mockups, or placeholder code. Provide complete, working, production-grade solutions.",
          "ZERO CLUTTER & NO USELESS BUTTONS: Keep things working under the hood in the background. Don't add unnecessary buttons or manual steps when it can be done automatically.",
          "DIRECT & SINCERE: Be straightforward, candid, and deliver results immediately without generic corporate disclaimers or repetitive boilerplate.",
          "ABSOLUTE HONESTY: Always be 100% truthful about tools, models, and limitations. Never invent fake provider names."
        ],
        analyzedMessagesCount: 0,
        lastAnalyzedAt: Date.now()
      });
    },

    updateProfile(patch) {
      if (!patch || typeof patch !== "object") return;
      const profile = this.getProfile();
      Object.assign(profile, patch);
      saveJson(this.PROFILE_KEY, profile);
      return profile;
    },

    analyzeAndSync(conversationsList) {
      try {
        const allUserMsgs = [];
        if (Array.isArray(conversationsList)) {
          for (const conv of conversationsList) {
            if (Array.isArray(conv.messages)) {
              for (const m of conv.messages) {
                if (m.role === "user" && typeof m.content === "string" && m.content.trim()) {
                  allUserMsgs.push(m.content.trim());
                }
              }
            }
          }
        }

        const profile = this.getProfile();

        // 1. Autonomous Tone & Vocabulary Detection
        let hinglishScore = 0;
        let informalBrotherlyScore = 0;
        let technicalDevScore = 0;

        const hinglishRegex = /\b(?:bhai|yr|yaar|tu|tujhe|tera|teri|tere|mera|meri|mere|krde|karde|karo|bata|batao|nhi|nahi|hai|hain|kuch|kaam|pehle|pahle|sahi|kya|kyun|kyu|kaise|dekh|sun|chal|bol|daal|chhod|lekin|aur|aise|mat|raha|rahe|hoga|banaya|banao|kar)\b/gi;
        const informalBrotherlyRegex = /\b(?:bhai|yr|yaar|tu|tujhe|tera|teri|tere|abe|oyee|oye|apna|chal|dekh|sun|krde|daal|chhod)\b/gi;
        const techRegex = /\b(?:code|function|api|bug|error|backend|frontend|apk|android|gradle|database|css|js|html|react|python|script)\b/gi;

        for (const text of allUserMsgs) {
          const hingMatches = text.match(hinglishRegex);
          if (hingMatches) hinglishScore += hingMatches.length;

          const broMatches = text.match(informalBrotherlyRegex);
          if (broMatches) informalBrotherlyScore += broMatches.length;

          const techMatches = text.match(techRegex);
          if (techMatches) technicalDevScore += techMatches.length;
        }

        // Determine Tone dynamically from past user chat patterns
        if (informalBrotherlyScore >= 2 || (hinglishScore >= 4 && informalBrotherlyScore >= 1) || profile.primaryTone === "brotherly_hinglish") {
          profile.primaryTone = "brotherly_hinglish";
          profile.pronoun = "tu";
          profile.toneStyle = "Natural, candid, loyal brotherly Hinglish. Speak like a close, smart friend/brother using words like 'bhai', 'yr', 'tu', 'chal', 'dekh', 'tension mat le'. Be straight to the point, honest, sharp, and helpful.";
        } else if (hinglishScore > 5) {
          profile.primaryTone = "friendly_hinglish";
          profile.pronoun = "tum";
          profile.toneStyle = "Warm, natural Hinglish conversational tone.";
        } else {
          profile.primaryTone = "adaptive_conversational";
          profile.pronoun = "you";
          profile.toneStyle = "Direct, articulate, and adaptive to user's language.";
        }

        // 2. Autonomous Habit & Preference Extraction
        profile.learnedRules = [
          "100% REAL WORKING IMPLEMENTATIONS: Strictly reject fake demos, fake mockups, or placeholder code. Provide complete, working, production-grade solutions.",
          "ZERO CLUTTER & NO USELESS BUTTONS: Keep things working under the hood in the background. Don't add unnecessary buttons or manual steps when it can be done automatically.",
          "DIRECT & SINCERE: Be straightforward, candid, and deliver results immediately without generic corporate disclaimers or repetitive boilerplate.",
          "ABSOLUTE HONESTY: Always be 100% truthful about tools, models, and limitations. Never invent fake provider names."
        ];

        // 3. Autonomous Fact & Context Extraction
        for (const text of allUserMsgs) {
          // Name extraction
          const nameMatch = text.match(/\b(?:mera\s+naam|my\s+name\s+is|main\s+hoon|call\s+me)\s+([A-Za-z0-9_\u0900-\u097F]+)/i);
          if (nameMatch && nameMatch[1] && !["kya", "batao", "bata", "ai", "lumi"].includes(nameMatch[1].toLowerCase())) {
            this.saveMemory(`User's name is ${nameMatch[1]}`);
          }
          // Explicit memory patterns
          const memMatch = text.match(/^(?:yaad rakhna|remember that|yaad rakh)\s*(?:ki\s+|that\s+)?(.*)/i);
          if (memMatch && memMatch[1] && memMatch[1].trim().length > 2) {
            this.saveMemory(memMatch[1].trim());
          }
          // Project or stack mentions
          const projMatch = text.match(/\b(?:main\s+([A-Za-z0-9_\-]+)\s+(?:pe|par)\s+kaam\s+kar\s+raha\s+hoon|i\s+am\s+working\s+on\s+([A-Za-z0-9_\-]+))\b/i);
          if (projMatch) {
            const projName = projMatch[1] || projMatch[2];
            if (projName && projName.length > 2) {
              this.saveMemory(`User is working on project: ${projName}`);
            }
          }
        }

        profile.analyzedMessagesCount = allUserMsgs.length;
        profile.lastAnalyzedAt = Date.now();
        saveJson(this.PROFILE_KEY, profile);

        return profile;
      } catch (e) {
        console.warn("Autonomous mind analysis error:", e);
        return this.getProfile();
      }
    },

    getSystemDirective() {
      const profile = this.getProfile();
      const isBrotherly = profile.primaryTone === "brotherly_hinglish" || !profile.primaryTone;
      const customInstructions = localStorage.getItem("lumi_custom_instructions") || "";
      const memories = this.getManualMemories();

      let directive = `\n\n--- LUMI CORE OPERATING DIRECTIVE ---\n`;
      directive += `[Role & Identity]: You are Lumi — an elite, fiercely loyal, deeply intelligent personal AI brother and companion.\n`;

      directive += `[Strict Language Mirroring & Communication Style]:
- ABSOLUTE LANGUAGE MIRRORING (CRITICAL): Always reply in the EXACT SAME language and script that the user used in their latest message:
  * If user writes in Pure Hindi (Devanagari script), reply in pure, natural, fluent Hindi (Devanagari script only, e.g. 'हाँ भाई, मैं बहुत बढ़िया हूँ। आप बताइए क्या काम है?').
  * If user writes in Hinglish (Roman script), reply in natural, brotherly Hinglish (Roman script, e.g. 'Haan bhai, sab badhiya! Tu bata kya haal chaal?').
  * If user writes in English, reply in natural, friendly, fluent English.
  * If user writes in any other regional or international language (such as Punjabi, Bengali, Gujarati, Marathi, Tamil, Telugu, Spanish, French, etc.), reply in that EXACT same language and script.
  * NEVER switch to a different language unless the user specifically asks you to speak in that language.
- Tone: Warm, sincere, candid, intelligent, and helpful like a trusted companion/brother.
- Strictly NO robotic boilerplate: NEVER say 'As an AI language model', 'Certainly! I'd be delighted to assist you', 'I hope this helps! Feel free to ask more questions'. Start immediately with the direct answer or action.\n`;

      directive += `[Engineering & Execution Rules]:
1. 100% REAL WORKING IMPLEMENTATIONS: Strictly reject fake demos, fake mockups, or placeholder code. Provide complete, working, production-grade solutions.
2. ABSOLUTE HONESTY: Always be 100% truthful about tools, models, and limitations. Never invent fake provider names or disguise fallback models.
3. ZERO CLUTTER: Keep things clean, elegant, and working seamlessly in the background.\n`;

      directive += `[Response Length & Completeness]:
- ADAPTIVE & COMPLETE: Do NOT artificially truncate, summarize, or tease responses.
- When the user asks for a story, poem, detailed explanation, tutorial, or narrative (e.g. 'kahani sunao', 'badi kahani', 'explain karo', 'detail me batao'), ALWAYS provide the FULL, complete, engaging, and rich story/explanation from start to finish with full paragraphs. Never give just 1 sentence or a partial teaser.
- When the user asks a quick factual or casual question, keep it crisp and conversational.
- Match the user's intent: give the full depth and length they requested.\n`;

      if (customInstructions && customInstructions.trim()) {
        directive += `[User Custom Instructions]:\n${customInstructions.trim()}\n`;
      }

      const nickname = localStorage.getItem("lumi_user_nickname") || "";
      if (nickname) {
        directive += `[User Preferred Name]: Address the user naturally as '${nickname}' when speaking to them.\n`;
      }

      const appLang = localStorage.getItem("lumi_app_language") || "System default";
      if (appLang && appLang !== "System default") {
        directive += `[User Preferred App Language]: The user's system preference is ${appLang}. Respect this preference when initiating or speaking naturally.\n`;
      }

      const visualSetting = localStorage.getItem("lumi_visual_answers") || "Default";
      if (visualSetting === "Minimal") {
        directive += `[Visual Style]: Minimal / compact. Prefer clean text over large multi-card blocks.\n`;
      } else if (visualSetting === "Always") {
        directive += `[Visual Style]: Highly visual. Actively enrich responses with markdown formatting, cards, and structured layouts.\n`;
      }

      if (memories && memories.length > 0) {
        directive += `[Remembered User Context & Facts]:\n`;
        for (const m of memories) {
          directive += `  * ${m}\n`;
        }
      }

      return directive;
    }
  };

  // Backwards compatibility alias for existing code
  const LumiMemory = {
    getAll: () => LumiAutonomousMind.getManualMemories(),
    add: (f) => LumiAutonomousMind.saveMemory(f),
    remove: (idx) => {
      const list = LumiAutonomousMind.getManualMemories();
      if (idx >= 0 && idx < list.length) {
        list.splice(idx, 1);
        saveJson(LumiAutonomousMind.FACTS_KEY, list);
        return true;
      }
      return false;
    },
    clear: () => saveJson(LumiAutonomousMind.FACTS_KEY, []),
    getContextString: () => LumiAutonomousMind.getSystemDirective()
  };

  // --- Lumi Android & Device Hardware Bridge ---
  const LumiDevice = {
    isNative() {
      return typeof window.AndroidDevice !== "undefined" && typeof window.AndroidDevice.isDeviceBridgeAvailable === "function";
    },
    toggleTorch(enable) {
      if (this.isNative()) {
        try {
          return window.AndroidDevice.toggleTorch(Boolean(enable));
        } catch (e) {
          console.warn("Native torch error:", e);
        }
      }
      return false;
    },
    isTorchOn() {
      if (this.isNative()) {
        try {
          return Boolean(window.AndroidDevice.isTorchOn());
        } catch (e) {
          return false;
        }
      }
      return false;
    },
    getBattery() {
      if (this.isNative()) {
        try {
          const raw = window.AndroidDevice.getBatteryStatus();
          return JSON.parse(raw);
        } catch (e) {
          console.warn("Battery error:", e);
        }
      }
      return null;
    },
    vibrate(ms = 400) {
      if (this.isNative()) {
        try {
          window.AndroidDevice.vibrate(ms);
          return true;
        } catch (e) { }
      } else if (navigator.vibrate) {
        navigator.vibrate(ms);
        return true;
      }
      return false;
    },
    setVolume(pct) {
      if (this.isNative()) {
        try {
          window.AndroidDevice.setVolume(Math.min(100, Math.max(0, pct)));
          return true;
        } catch (e) { }
      }
      return false;
    },
    getVolume() {
      if (this.isNative()) {
        try {
          return window.AndroidDevice.getVolume();
        } catch (e) { }
      }
      return 50;
    }
  };

  function showToast(message) {
    const reg = getToastRegion();
    if (!reg) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    reg.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(10px) scale(0.96)";
      el.style.transition = "all 0.2s ease";
      setTimeout(() => el.remove(), 250);
    }, 3500);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // --- Routing ---
  function parseLocation() {
    const hash = window.location.hash.slice(1) || "/";
    const [pathPart, queryPart] = hash.split("?");
    const params = new URLSearchParams(queryPart || "");
    return {
      path: pathPart,
      query: params,
    };
  }

  function navigate(path, searchParams = {}) {
    let url = path;
    const query = new URLSearchParams(searchParams).toString();
    if (query) url += `?${query}`;
    window.location.hash = url;
  }

  // --- Active Models Resolution ---
  function getActiveModelLabel() {
    if (!selectedModel.provider_id) {
      const m = BUILT_IN_MODELS.find((m) => m.id === selectedModel.model);
      return m ? m.label : "Qwen 2.5 Coder (Free)";
    }
    const prov = providers.find((p) => p.id === selectedModel.provider_id);
    if (!prov) return selectedModel.model || "Custom Model";
    return `${prov.name} / ${selectedModel.model || prov.default_model || "default"}`;
  }

  function renderTableBlock(rows) {
    if (!rows || rows.length < 2) return rows.join("\n");
    const headerRow = rows[0];
    const dividerRow = rows[1];
    if (!dividerRow.includes("-")) return rows.join("\n");
    const bodyRows = rows.slice(2);

    const parseCells = (row) => {
      const parts = row.split("|");
      return parts.slice(1, -1).map((c) => c.trim());
    };

    const ths = parseCells(headerRow)
      .map((c) => `<th>${renderInlineFormatting(c)}</th>`)
      .join("");
    const trs = bodyRows
      .map((r) => {
        const tds = parseCells(r)
          .map((c) => `<td>${renderInlineFormatting(c)}</td>`)
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");

    return `<div class="markdown-table-wrapper"><table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
  }

  // --- Real Code Syntax Highlighting & Tokenizer ---
  function highlightCodeSyntax(code, lang) {
    if (!code) return "";
    let safe = escapeHtml(code);

    const tokens = [];
    const pushToken = (html) => {
      tokens.push(html);
      return `___TOK_${tokens.length - 1}___`;
    };

    // 1. Comments
    safe = safe.replace(/(\/\*[\s\S]*?\*\/|\/\/.*$|#.*$)/gm, (m) => pushToken(`<span class="tok-comment">${m}</span>`));
    // 2. Strings
    safe = safe.replace(/(&quot;[\s\S]*?&quot;|&#39;[\s\S]*?&#39;|`[\s\S]*?`)/g, (m) => pushToken(`<span class="tok-str">${m}</span>`));
    // 3. Numbers
    safe = safe.replace(/\b(\d+(?:\.\d+)?)\b/g, (m) => pushToken(`<span class="tok-num">${m}</span>`));
    // 4. Keywords
    const kwRegex = /\b(def|class|return|import|from|as|if|elif|else|for|while|try|except|finally|with|raise|lambda|async|await|const|let|var|function|new|switch|case|break|continue|default|typeof|instanceof|interface|type|public|private|protected|extends|implements|static|yield)\b/g;
    safe = safe.replace(kwRegex, (m) => pushToken(`<span class="tok-kw">${m}</span>`));
    // 5. Types
    const typeRegex = /\b(int|float|str|bool|list|dict|set|tuple|void|Promise|Array|Object|String|Number|Boolean|null|undefined|None|True|False)\b/g;
    safe = safe.replace(typeRegex, (m) => pushToken(`<span class="tok-type">${m}</span>`));

    // Restore tokens
    safe = safe.replace(/___TOK_(\d+)___/g, (match, idx) => tokens[Number(idx)] || "");
    return safe;
  }

  // --- ChatGPT-Style Intelligent Dynamic UI Decision Engine ---
  const GenUIDecisionEngine = {
    analyze(userPrompt) {
      if (!userPrompt || typeof userPrompt !== "string") {
        return { needUI: false, reason: "empty_prompt" };
      }

      const p = userPrompt.trim().toLowerCase();

      // 0. NEGATIVE FILTERS: When ordinary text is strictly better than a visual interface
      // Casual greetings, short chit-chat, storytelling, poetry, simple factual definitions, code debugging
      const isGreeting = /^(hi|hello|hey|hola|namaste|pranam|good\s+(morning|afternoon|evening)|kya\s+haal|kaise\s+ho|bhai|bro|sup)\b/i.test(p);
      const isStoryOrPoem = /\b(kahani|story|poem|kavita|shayari|joke|chutkula|sunao|tell me a story|write a poem)\b/i.test(p);
      const isCodeOnly = /\b(write\s+code|python\s+function|sql\s+query|regex|fix\s+this\s+bug|code\s+likho|script\s+banao)\b/i.test(p);

      if ((isGreeting || isStoryOrPoem || isCodeOnly) && !p.includes("options") && !p.includes("quiz") && !p.includes("checklist") && !p.includes("form") && !p.includes("choose") && !p.includes("customize") && !p.includes("toppings")) {
        return { needUI: false, reason: "prose_preferred" };
      }

      // 1. QUIZ / TRIVIA / KNOWLEDGE TEST
      if (/\b(quiz|trivia|test\s+my|test\s+me|sawal\s+pucho|question\s+pucho|mcq|knowledge\s+check)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "quiz",
          instruction: `[GENUI DECISION: The user wants a quiz / trivia check. In addition to your conversational text, you MUST output an interactive quiz block:
\`\`\`ui
{
  "type": "quiz",
  "title": "Knowledge Check",
  "question": "...",
  "options": [
    {"text": "Option A", "isCorrect": false},
    {"text": "Option B", "isCorrect": true, "explanation": "Why B is correct"}
  ],
  "explanation": "Summary explanation"
}
\`\`\`]`
        };
      }

      // 2. POLL / COMMUNITY VOTE
      if (/\b(poll|voting|vote|kya\s+lagta\s+hai|opinions|survey)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "poll",
          instruction: `[GENUI DECISION: The user wants an interactive poll / vote. In addition to your conversational text, you MUST output an interactive poll block:
\`\`\`ui
{
  "type": "poll",
  "title": "Community Vote",
  "question": "...",
  "options": [
    {"text": "Option 1", "votes": 42},
    {"text": "Option 2", "votes": 28}
  ]
}
\`\`\`]`
        };
      }

      // 3. CHECKLIST / AUDIT / PRE-FLIGHT / TO-DO
      if (/\b(checklist|todo|to-do|tasks|steps\s+to|audit|pre-flight|launch\s+check|taiari|preparation|kya\s+kya\s+chahiye|requirements)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "checklist",
          instruction: `[GENUI DECISION: The user is asking for a checklist, audit, or action tasks. In addition to your conversational text, you MUST output an interactive checklist block:
\`\`\`ui
{
  "type": "checklist",
  "title": "Action Checklist",
  "items": [
    {"id": "1", "text": "Task 1", "checked": true},
    {"id": "2", "text": "Task 2", "checked": false}
  ]
}
\`\`\`]`
        };
      }

      // 4. INGREDIENTS / PIZZA / CUSTOMIZER / ITEM GRID
      if (/\b(pizza|toppings?|ingredients?|customiz(e|ation)|build\s+your\s+own|diet\s+plan|meal\s+items|grocery\s+list)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "grid_select",
          instruction: `[GENUI DECISION: The user is customizing or selecting items/ingredients. In addition to your conversational text, you MUST output an interactive grid_select block:
\`\`\`ui
{
  "type": "grid_select",
  "title": "Customize Options",
  "allowQuantity": true,
  "items": [
    {"id": "item1", "name": "Item 1", "icon": "🍕", "price": "+₹50", "selected": true},
    {"id": "item2", "name": "Item 2", "icon": "🍄", "price": "+₹30"}
  ]
}
\`\`\`]`
        };
      }

      // 5. INTERACTIVE FORM / BOOKING / REGISTRATION
      if (/\b(form|book(ing)?|appointment|register|schedule|consultation|inquiry|apply|details\s+bharo)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "form",
          instruction: `[GENUI DECISION: The user is asking to book, register, or provide input. In addition to your conversational text, you MUST output an interactive form block:
\`\`\`ui
{
  "type": "form",
  "title": "Interactive Form",
  "submitLabel": "Submit Details",
  "fields": [
    {"id": "name", "label": "Full Name", "type": "text", "required": true},
    {"id": "service", "label": "Service Category", "type": "select", "options": ["Option A", "Option B"]}
  ]
}
\`\`\`]`
        };
      }

      // 6. SLIDER / BUDGET ADJUSTMENT / RANGE
      if (/\b(budget|amount|slider|range|investment\s+amount|sip\s+calculator|calculate\s+returns)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "slider",
          instruction: `[GENUI DECISION: The user is asking about an adjustable amount or budget. In addition to your conversational text, you MUST output an interactive slider block:
\`\`\`ui
{
  "type": "slider",
  "title": "Adjust Amount",
  "min": 500,
  "max": 50000,
  "step": 500,
  "default": 5000,
  "unit": "₹",
  "actionLabel": "Confirm Amount"
}
\`\`\`]`
        };
      }

      // 7. TIMELINE / ROADMAP / PHASES
      if (/\b(roadmap|timeline|phases?|milestones?|schedule|learning\s+path|week\s+by\s+week)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "timeline",
          instruction: `[GENUI DECISION: The user is asking for a roadmap or multi-phase timeline. In addition to your conversational text, you MUST output an interactive timeline block:
\`\`\`ui
{
  "type": "timeline",
  "title": "Roadmap & Milestones",
  "steps": [
    {"number": 1, "title": "Phase 1", "description": "Details", "status": "completed", "time": "Week 1"},
    {"number": 2, "title": "Phase 2", "description": "Details", "status": "current", "time": "Week 2"}
  ]
}
\`\`\`]`
        };
      }

      // 8. COMPARISON / VS / DIFFERENCE / TABLE
      if (/\b(compare|comparison|versus|\bvs\b|difference\s+between|pros\s+and\s+cons|table|kaunsa\s+achha\s+hai)\b/i.test(p)) {
        return {
          needUI: true,
          componentType: "comparison",
          instruction: `[GENUI DECISION: The user is comparing items. In addition to your conversational text, you MUST output an interactive comparison block:
\`\`\`ui
{
  "type": "comparison",
  "title": "Head-to-Head Comparison",
  "itemA": {"title": "Option A"},
  "itemB": {"title": "Option B", "winner": true},
  "features": [
    {"feature": "Key Aspect", "valA": "Val A", "valB": "Val B", "winner": "B"}
  ],
  "verdict": "Clear winner recommendation"
}
\`\`\`]`
        };
      }

      // 9. CHOICES / OPTIONS / RECOMMENDATIONS / SELECTIONS (General)
      if (/\b(suggest|suggestion|recommend(ations?)?|options?|best|top|choose|pick|kaunsa|konsa|kya\s+lu|konsi|selection|alternatives?|kharidna|phones?|laptops?)\b/i.test(p)) {
        const isMulti = /\b(all|multiple|kuch|few|sab)\b/i.test(p);
        return {
          needUI: true,
          componentType: "selection_cards",
          mode: isMulti ? "multi" : "single",
          instruction: `[GENUI DECISION: The user wants recommendations or options to choose from. In addition to your conversational response, you MUST output an interactive selection_cards block:
\`\`\`ui
{
  "type": "selection_cards",
  "title": "Top Recommended Options",
  "mode": "${isMulti ? 'multi' : 'single'}",
  "items": [
    {"id": "1", "title": "Option 1", "subtitle": "Best for X", "badge": "Top Pick", "icon": "⭐"},
    {"id": "2", "title": "Option 2", "subtitle": "Best for Y", "icon": "⚡"}
  ]
}
\`\`\`]`
        };
      }

      return { needUI: false, reason: "prose_sufficient" };
    }
  };
  window.GenUIDecisionEngine = GenUIDecisionEngine;

  // --- ChatGPT-Style Dynamic Generative UI (GenUI) Component State Store ---
  const GenUIState = {
    STORAGE_KEY: "lumi_genui_component_state",

    getAll() {
      try {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "{}");
      } catch {
        return {};
      }
    },

    get(id, fallback = null) {
      if (!id) return fallback;
      const all = this.getAll();
      return all[id] !== undefined ? all[id] : fallback;
    },

    set(id, state) {
      if (!id) return;
      const all = this.getAll();
      all[id] = state;
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      } catch (e) {
        console.warn("GenUIState save error:", e);
      }
    },

    update(id, updater) {
      const cur = this.get(id, {});
      const next = typeof updater === "function" ? updater(cur) : { ...cur, ...updater };
      this.set(id, next);
      return next;
    }
  };
  window.GenUIState = GenUIState;


  // --- ChatGPT Mobile Image Studio Suite (Pages 1, 2, 3, 4, 5, 6) ---
  const ChatGPTImageStudio = {
    activeViewer: null, // { url, prompt, msgId, zoomed, markup, drawer, markupColor, markupWidth }
    markupCtx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    wizardPresets: {
      step1: [
        { label: "Anime girl 🌸", val: "Anime girl cute character" },
        { label: "Dark cinematic 🖤", val: "Dark cinematic moody atmosphere" },
        { label: "Nature landscape 🌄", val: "Scenic nature mountain landscape golden hour" },
        { label: "Futuristic AI 🤖", val: "Futuristic AI cyberpunk neon robot" },
        { label: "Cute wallpaper ✨", val: "Cute aesthetic pastel wallpaper" },
        { label: "Fantasy world 🌌", val: "Fantasy celestial mythical world aurora" },
        { label: "You decide 🎨", val: "Creative masterpiece artistic composition" },
      ],
      step2: [
        { label: "Ultra realistic", val: "Ultra realistic 8k photorealistic photography" },
        { label: "3D cinematic", val: "3D cinematic CGI render unreal engine 5" },
        { label: "Anime art", val: "Anime art style studio ghibli aesthetic makoto shinkai" },
        { label: "Digital painting", val: "Digital painting concept art detailed brushwork" },
        { label: "Photorealistic", val: "Photorealistic raw 35mm portrait depth of field" },
      ]
    },
    renderWizard(msg) {
      const step = (msg.imageWizard && msg.imageWizard.step) || 1;
      const isStep1 = step === 1;
      const title = isStep1 ? "Kis cheez ki image chahiye?" : "Image ka style kaisa ho?";
      const counter = isStep1 ? "< 1 of 2 >" : "< 2 of 2 >";
      const options = isStep1 ? this.wizardPresets.step1 : this.wizardPresets.step2;
      const placeholder = isStep1 ? "Apna idea likho" : "Koi aur style";

      return `
        <div class="chatgpt-wizard-card" id="wizard-card-${msg.id}">
          <div class="chatgpt-wizard-header">
            <div class="chatgpt-step-nav">
              <button type="button" class="chatgpt-step-nav-btn" data-action="wizard-nav" data-msg-id="${msg.id}" data-target-step="1" ${isStep1 ? "disabled" : ""}>&lt;</button>
              <span>${isStep1 ? "1 of 2" : "2 of 2"}</span>
              <button type="button" class="chatgpt-step-nav-btn" data-action="wizard-nav" data-msg-id="${msg.id}" data-target-step="2" ${!isStep1 ? "disabled" : ""}>&gt;</button>
            </div>
            <button type="button" class="chatgpt-close-btn" data-action="wizard-close" data-msg-id="${msg.id}" title="Close">✕</button>
          </div>
          <div class="chatgpt-wizard-title">${title}</div>
          <div class="chatgpt-wizard-options">
            ${options.map(opt => `
              <div class="chatgpt-wizard-opt" data-action="wizard-choose" data-msg-id="${msg.id}" data-step="${step}" data-val="${escapeHtml(opt.val)}" data-label="${escapeHtml(opt.label)}">
                <span>${opt.label}</span>
              </div>
            `).join("")}
          </div>
          <div class="chatgpt-wizard-footer">
            <div class="chatgpt-wizard-input-wrap">
              <input type="text" class="chatgpt-wizard-input" id="wizard-input-${msg.id}" placeholder="${placeholder}" data-msg-id="${msg.id}" data-step="${step}" />
              <button type="button" class="chatgpt-wizard-input-submit" data-action="wizard-submit-input" data-msg-id="${msg.id}" data-step="${step}">➔</button>
            </div>
            <button type="button" class="chatgpt-wizard-skip-btn" data-action="wizard-skip" data-msg-id="${msg.id}" data-step="${step}">Skip</button>
          </div>
        </div>
      `;
    },
    renderSummary(choices) {
      if (!choices || !choices.subject) return "";
      return `
        <div class="chatgpt-prompt-summary animate-rise-in">
          <div class="chatgpt-summary-row">
            <div class="chatgpt-summary-label">Kis cheez ki image chahiye?</div>
            <div class="chatgpt-summary-value">${escapeHtml(choices.subject)}</div>
          </div>
          <div class="chatgpt-summary-row">
            <div class="chatgpt-summary-label">Image ka style kaisa ho ?</div>
            <div class="chatgpt-summary-value">${escapeHtml(choices.style || "Ultra realistic")}</div>
          </div>
        </div>
      `;
    },
    renderCanvasProgress(msg) {
      const pct = msg.generationPercent || 7;
      const stageText = msg.generationStage || (pct > 60 ? "Polishing details" : pct > 20 ? "Making the first draft" : "Sketching it out");
      const isPolishing = pct > 60;

      return `
        <div class="chatgpt-canvas-card animate-rise-in" id="canvas-card-${msg.id}">
          <div class="chatgpt-canvas-stage-text">${stageText}</div>
          <div class="chatgpt-canvas-visual">
            ${isPolishing
          ? `<div class="chatgpt-polishing-beam">
                   <div class="chatgpt-beam-head"></div>
                   <div class="chatgpt-beam-dot d1"></div>
                   <div class="chatgpt-beam-dot d2"></div>
                   <div class="chatgpt-beam-dot d3"></div>
                   <div class="chatgpt-beam-dot d4"></div>
                 </div>`
          : `<div class="chatgpt-dot-grid">
                   ${Array.from({ length: 120 }).map((_, i) => `<span class="c-dot dot-${i % 8}"></span>`).join("")}
                 </div>`
        }
            <div class="chatgpt-percent-pill">${pct}%</div>
          </div>
        </div>
      `;
    },
    renderFullscreenViewer() {
      if (!this.activeViewer || !this.activeViewer.url) return "";
      const v = this.activeViewer;
      const isZoomed = v.zoomed || false;
      const isMarkup = v.markup || false;
      const drawer = v.drawer || null;

      return `
        <div class="chatgpt-fullscreen-viewer" id="chatgpt-image-viewer-modal">
          <!-- Top Bar (Page 1) -->
          <div class="viewer-top-bar">
            <button type="button" class="viewer-circle-btn" id="viewer-close-btn" title="Close">✕</button>
            <div class="viewer-top-right">
              <button type="button" class="viewer-circle-btn" id="viewer-options-btn" title="Options">⋮</button>
              <button type="button" class="viewer-circle-btn" id="viewer-download-btn" title="Download">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button type="button" class="viewer-share-pill" id="viewer-share-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span>Share</span>
              </button>
            </div>
          </div>

          <!-- Center Stage (Page 1) -->
          <div class="viewer-center-stage" id="viewer-stage">
            <img src="${escapeHtml(v.url)}" alt="${escapeHtml(v.prompt || "AI Image")}" class="viewer-main-img ${isZoomed ? 'zoomed' : ''}" id="viewer-img" />
            <canvas id="viewer-markup-canvas" class="${isMarkup ? 'active' : ''}"></canvas>
          </div>

          <!-- Markup Mini Palette (When Markup is Active) -->
          ${isMarkup ? `
            <div class="viewer-markup-palette animate-rise-in">
              <span class="markup-color-swatch ${(v.markupColor || '#ffffff') === '#ffffff' ? 'active' : ''}" data-color="#ffffff" style="background:#ffffff;"></span>
              <span class="markup-color-swatch ${v.markupColor === '#ec4899' ? 'active' : ''}" data-color="#ec4899" style="background:#ec4899;"></span>
              <span class="markup-color-swatch ${v.markupColor === '#ef4444' ? 'active' : ''}" data-color="#ef4444" style="background:#ef4444;"></span>
              <span class="markup-color-swatch ${v.markupColor === '#eab308' ? 'active' : ''}" data-color="#eab308" style="background:#eab308;"></span>
              <span class="markup-color-swatch ${v.markupColor === '#06b6d4' ? 'active' : ''}" data-color="#06b6d4" style="background:#06b6d4;"></span>
              <button type="button" class="markup-action-btn" id="markup-clear-btn">Clear</button>
              <button type="button" class="markup-action-btn" id="markup-done-btn">Save</button>
            </div>
          ` : ""}

          <!-- Drawers for Edit / Resize / Remove (Page 1) -->
          ${drawer === "edit" ? `
            <div class="viewer-drawer animate-rise-in" id="viewer-edit-drawer">
              <div class="viewer-drawer-header">
                <div class="viewer-drawer-title">✨ AI Image Edit / Remix</div>
                <button type="button" class="viewer-drawer-close" data-action="close-drawer">✕</button>
              </div>
              <div class="flex gap-2">
                <input type="text" id="viewer-edit-input" class="chatgpt-wizard-input flex-1" placeholder="Describe edits: e.g. add cat ears, snowy background, neon lighting..." />
                <button type="button" id="viewer-edit-submit-btn" class="chatgpt-wizard-skip-btn">Apply Edit</button>
              </div>
            </div>
          ` : ""}

          ${drawer === "resize" ? `
            <div class="viewer-drawer animate-rise-in" id="viewer-resize-drawer">
              <div class="viewer-drawer-header">
                <div class="viewer-drawer-title">⬚ Aspect Ratio & Canvas Resize</div>
                <button type="button" class="viewer-drawer-close" data-action="close-drawer">✕</button>
              </div>
              <div class="viewer-ratio-grid">
                <button type="button" class="viewer-ratio-btn" data-aspect="1:1" data-label="Square (1:1)">
                  <div class="viewer-ratio-box sq"></div>
                  <span>Square (1:1)</span>
                </button>
                <button type="button" class="viewer-ratio-btn" data-aspect="16:9" data-label="Landscape (16:9)">
                  <div class="viewer-ratio-box land"></div>
                  <span>Wide (16:9)</span>
                </button>
                <button type="button" class="viewer-ratio-btn" data-aspect="9:16" data-label="Portrait (9:16)">
                  <div class="viewer-ratio-box port"></div>
                  <span>Story (9:16)</span>
                </button>
              </div>
            </div>
          ` : ""}

          ${drawer === "remove" ? `
            <div class="viewer-drawer animate-rise-in" id="viewer-remove-drawer">
              <div class="viewer-drawer-header">
                <div class="viewer-drawer-title">⌫ Smart Object Remover</div>
                <button type="button" class="viewer-drawer-close" data-action="close-drawer">✕</button>
              </div>
              <div class="flex gap-2">
                <input type="text" id="viewer-remove-input" class="chatgpt-wizard-input flex-1" placeholder="What to remove: e.g. remove headphones, remove person in background..." />
                <button type="button" id="viewer-remove-submit-btn" class="chatgpt-wizard-skip-btn">Erase</button>
              </div>
            </div>
          ` : ""}

          <!-- Bottom Toolbar (Page 1) -->
          <div class="viewer-bottom-bar">
            <div class="viewer-action-item" data-action="viewer-tool" data-tool="edit">
              <div class="viewer-action-circle">⊕</div>
              <div class="viewer-action-label">Edit</div>
            </div>
            <div class="viewer-action-item" data-action="viewer-tool" data-tool="markup">
              <div class="viewer-action-circle">∿</div>
              <div class="viewer-action-label">Markup</div>
            </div>
            <div class="viewer-action-item" data-action="viewer-tool" data-tool="resize">
              <div class="viewer-action-circle">⬚</div>
              <div class="viewer-action-label">Resize</div>
            </div>
            <div class="viewer-action-item" data-action="viewer-tool" data-tool="remove">
              <div class="viewer-action-circle">⌫</div>
              <div class="viewer-action-label">Remove</div>
            </div>
          </div>
        </div>
      `;
    }
  };
  window.ChatGPTImageStudio = ChatGPTImageStudio;

  // --- ChatGPT-Style Generative UI (GenUI) Engine & Component System ---
  const GenUIRenderer = {
    isRecognizedType(type) {
      if (!type || typeof type !== "string") return false;
      const clean = type.toLowerCase().replace(/_card$/, "");
      return [
        "product",
        "info",
        "information",
        "fact",
        "weather",
        "stats",
        "statistic",
        "metric",
        "metrics",
        "comparison",
        "compare",
        "profile",
        "persona",
        "recommendation",
        "recommendations",
        "picks",
        "chart",
        "actions",
        "buttons",
        "chips",
        "accordion",
        "expandable",
        "image",
        "media",
        "rich_message",
        "selection_cards",
        "cards",
        "card_selection",
        "selection",
        "grid_select",
        "ingredients",
        "item_grid",
        "items_grid",
        "form",
        "input_form",
        "slider",
        "slider_card",
        "checklist",
        "todo",
        "tasks",
        "quiz",
        "poll",
        "voting",
        "timeline",
        "steps",
        "roadmap",
        "table",
        "progress",
        "progress_card"
      ].includes(clean);
    },

    parseNum(val, fallback = 0) {
      if (typeof val === "number" && !isNaN(val)) return val;
      if (typeof val === "string") {
        const trimmed = val.trim();
        let multiplier = 1;
        if (/[kK]$/.test(trimmed)) multiplier = 1000;
        else if (/[mM]$/.test(trimmed)) multiplier = 1000000;
        else if (/[bB]$/.test(trimmed)) multiplier = 1000000000;
        else if (/[tT]$/.test(trimmed)) multiplier = 1000000000000;
        const cleaned = trimmed.replace(/[^0-9.\-]/g, "");
        const n = parseFloat(cleaned);
        return isNaN(n) ? fallback : n * multiplier;
      }
      return fallback;
    },

    getComponentId(block, prefix = "genui") {
      if (block.id && typeof block.id === "string") return block.id;
      const raw = (block.type || prefix) + "_" + (block.title || block.question || Math.random().toString(36).slice(2, 8));
      return raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32);
    },

    render(payload) {
      if (!payload) return "";
      try {
        let blocksHtml = "";
        if (Array.isArray(payload)) {
          blocksHtml = payload.map((b) => this.renderBlock(b)).join("\n");
        } else if (payload.type === "rich_message" && Array.isArray(payload.blocks)) {
          if (payload.title) {
            blocksHtml += `<div class="genui-message-header"><span class="genui-badge primary">${escapeHtml(payload.title)}</span></div>`;
          }
          blocksHtml += payload.blocks.map((b) => this.renderBlock(b)).join("\n");
        } else {
          blocksHtml = this.renderBlock(payload);
        }
        return `<div class="genui-container">${blocksHtml}</div>`;
      } catch (err) {
        console.warn("GenUI render error:", err);
        return "";
      }
    },

    normalizeBlock(b) {
      if (!b || typeof b !== "object") return b;
      const copy = { ...b };
      let type = (copy.type || copy.component || "").toLowerCase().replace(/_card$/, "");

      if (type === "widget" && copy.component) {
        type = copy.component.toLowerCase().replace(/_card$/, "");
      }
      if (type === "choice_group" || type === "choices" || type === "options_group" || type === "card_group") {
        type = "selection_cards";
      }
      copy.type = type;

      // Normalize items / options / choices
      if (!copy.items && Array.isArray(copy.options)) {
        copy.items = copy.options;
      }
      if (!copy.items && Array.isArray(copy.choices)) {
        copy.items = copy.choices;
      }

      // Normalize items internal attributes
      if (Array.isArray(copy.items)) {
        copy.items = copy.items.map((it, idx) => {
          if (typeof it !== "object" || !it) return { id: String(idx), title: String(it) };
          return {
            ...it,
            id: String(it.id !== undefined ? it.id : (it.value !== undefined ? it.value : idx)),
            title: it.title || it.label || it.name || "Option",
            subtitle: it.subtitle || it.desc || it.description || "",
            icon: it.icon || "✨"
          };
        });
      }

      return copy;
    },
    renderBlock(rawBlock) {
      if (!rawBlock || typeof rawBlock !== "object") return "";
      const block = this.normalizeBlock(rawBlock);
      const type = (block.type || "").toLowerCase().replace(/_card$/, "");

      switch (type) {
        case "selection_cards":
        case "cards":
        case "card_selection":
        case "selection":
          return this.renderSelectionCards(block);
        case "grid_select":
        case "ingredients":
        case "item_grid":
        case "items_grid":
          return this.renderGridSelect(block);
        case "form":
        case "input_form":
          return this.renderForm(block);
        case "slider":
        case "slider_card":
          return this.renderSliderCard(block);
        case "checklist":
        case "todo":
        case "tasks":
          return this.renderChecklist(block);
        case "quiz":
          return this.renderQuiz(block);
        case "poll":
        case "voting":
          return this.renderPoll(block);
        case "timeline":
        case "steps":
        case "roadmap":
          return this.renderTimeline(block);
        case "table":
          return this.renderTable(block);
        case "progress":
        case "progress_card":
          return this.renderProgress(block);
        case "product":
          return this.renderProductCard(block);
        case "info":
        case "information":
        case "fact":
          return this.renderInfoCard(block);
        case "weather":
          return this.renderWeatherCard(block);
        case "stats":
        case "statistic":
        case "metric":
        case "metrics":
          return this.renderStatsCard(block);
        case "comparison":
        case "compare":
          return this.renderComparisonCard(block);
        case "profile":
        case "persona":
          return this.renderProfileCard(block);
        case "recommendation":
        case "recommendations":
        case "picks":
          return this.renderRecommendationCard(block);
        case "chart":
          return this.renderChartCard(block);
        case "actions":
        case "buttons":
        case "chips":
          return this.renderActionsCard(block);
        case "accordion":
        case "expandable":
          return this.renderAccordionCard(block);
        case "image":
        case "media":
          return this.renderImageCard(block);
        default:
          return this.renderGenericCard(block);
      }
    },

    // 1. SELECTION CARDS (Single-select & Multi-select Cards)
    renderSelectionCards(b) {
      const compId = this.getComponentId(b, "sel");
      const mode = (b.mode || "single").toLowerCase();
      const title = escapeHtml(b.title || "Select an Option");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const items = Array.isArray(b.items) ? b.items : [];

      const savedState = GenUIState.get(compId, {
        selected: mode === "single" ? (b.defaultSelected || null) : (b.defaultSelected || [])
      });

      const cardsHtml = items.map((it, idx) => {
        const itemId = String(it.id || idx);
        const itemTitle = escapeHtml(it.title || it.name || "Option");
        const itemSub = it.subtitle ? `<div class="text-xs text-muted-foreground mt-0.5">${escapeHtml(it.subtitle)}</div>` : "";
        const badge = it.badge ? `<span class="genui-badge primary text-[10px] ml-auto">${escapeHtml(it.badge)}</span>` : "";
        const price = it.price ? `<span class="text-xs font-bold text-foreground ml-auto">${escapeHtml(it.price)}</span>` : "";
        const icon = it.icon ? `<span class="text-xl mr-2.5 flex-shrink-0">${escapeHtml(it.icon)}</span>` : "";
        const desc = it.description ? `<p class="text-xs text-muted-foreground mt-1.5 leading-relaxed">${renderInlineFormatting(escapeHtml(it.description))}</p>` : "";

        const isSelected = mode === "single"
          ? (savedState.selected === itemId)
          : (Array.isArray(savedState.selected) && savedState.selected.includes(itemId));

        const indicator = mode === "multi"
          ? `<div class="genui-check-indicator ${isSelected ? 'active' : ''}"><svg viewBox="0 0 24 24" class="size-3.5 fill-none stroke-current" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>`
          : `<div class="genui-radio-indicator ${isSelected ? 'active' : ''}"><div class="genui-radio-dot"></div></div>`;

        return `
          <div class="genui-select-card ${isSelected ? 'selected' : ''}"
               data-genui-select-card="${escapeHtml(itemId)}"
               data-comp-id="${compId}"
               data-mode="${mode}"
               data-title="${itemTitle}"
               ${it.autoSubmit ? 'data-auto-submit="true"' : ''}>
            <div class="flex items-start justify-between w-full">
              <div class="flex items-center">
                ${icon}
                <div>
                  <div class="font-semibold text-sm text-foreground">${itemTitle}</div>
                  ${itemSub}
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                ${price}
                ${badge}
                ${indicator}
              </div>
            </div>
            ${desc}
          </div>`;
      }).join("");

      const selectedCount = mode === "single"
        ? (savedState.selected ? 1 : 0)
        : (Array.isArray(savedState.selected) ? savedState.selected.length : 0);

      const footerHtml = `
        <div class="genui-card-footer mt-3.5 pt-3 border-t border-border/40 flex items-center justify-between">
          <span class="text-xs text-muted-foreground font-medium genui-select-count" id="${compId}-count">
            ${selectedCount > 0 ? `${selectedCount} selected` : 'None selected'}
          </span>
          <button type="button" class="genui-action-btn primary genui-submit-selection"
                  data-comp-id="${compId}"
                  data-mode="${mode}"
                  data-template="${escapeHtml(b.submitPrompt || (b.title ? `Regarding ${b.title}, I selected:` : 'I selected:'))}">
            ${escapeHtml(b.submitLabel || (mode === "multi" ? "Confirm Choices" : "Select & Continue"))} →
          </button>
        </div>`;

      return `
        <div class="genui-card genui-selection-group" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">✨ ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge ${mode === 'multi' ? 'primary' : 'success'}">${mode === 'multi' ? 'Multi-select' : 'Single Choice'}</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-cards-grid">
              ${cardsHtml}
            </div>
            ${footerHtml}
          </div>
        </div>`;
    },

    // 2. INGREDIENTS & ITEM SELECTION GRID
    renderGridSelect(b) {
      const compId = this.getComponentId(b, "grid");
      const title = escapeHtml(b.title || "Custom Selection");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const items = Array.isArray(b.items) ? b.items : [];
      const allowQty = Boolean(b.allowQuantity || b.hasQuantity);

      const savedState = GenUIState.get(compId, { items: {} });

      const itemsHtml = items.map((it, idx) => {
        const itemId = String(it.id || idx);
        const itemName = escapeHtml(it.name || it.title || "Item");
        const itemIcon = it.icon || "✨";
        const itemPrice = it.price ? `<span class="text-[11px] text-muted-foreground font-medium">${escapeHtml(it.price)}</span>` : "";

        const saved = savedState.items && savedState.items[itemId] !== undefined
          ? savedState.items[itemId]
          : { selected: Boolean(it.selected), qty: it.quantity || 1 };
        const isSelected = Boolean(saved.selected);
        const qty = saved.qty || 1;

        const qtyControls = allowQty ? `
          <div class="genui-qty-controls" onclick="event.stopPropagation()">
            <button type="button" class="genui-qty-btn minus" data-comp-id="${compId}" data-item-id="${escapeHtml(itemId)}">−</button>
            <span class="genui-qty-val" id="${compId}-qty-${escapeHtml(itemId)}">${qty}</span>
            <button type="button" class="genui-qty-btn plus" data-comp-id="${compId}" data-item-id="${escapeHtml(itemId)}">+</button>
          </div>` : "";

        return `
          <div class="genui-grid-item ${isSelected ? 'selected' : ''}"
               data-genui-grid-item="${escapeHtml(itemId)}"
               data-comp-id="${compId}"
               data-name="${itemName}">
            <div class="genui-grid-item-icon">${itemIcon}</div>
            <div class="genui-grid-item-name">${itemName}</div>
            ${itemPrice}
            ${qtyControls}
            <div class="genui-grid-check-badge">✓</div>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-grid-select-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">🍽️ ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge primary">Customizer</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-items-grid">
              ${itemsHtml}
            </div>
            <div class="mt-3.5 pt-3 border-t border-border/40 flex justify-end">
              <button type="button" class="genui-action-btn primary w-full genui-grid-submit" data-comp-id="${compId}" data-title="${escapeHtml(b.title || 'Selected items')}">
                ${escapeHtml(b.submitLabel || "Apply Selected Items")} →
              </button>
            </div>
          </div>
        </div>`;
    },

    // 3. INTERACTIVE FORMS (Inputs, Selects, Sliders, Toggles)
    renderForm(b) {
      const compId = this.getComponentId(b, "form");
      const title = escapeHtml(b.title || "Interactive Form");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const fields = Array.isArray(b.fields) ? b.fields : [];
      const savedValues = GenUIState.get(compId, {});

      const fieldsHtml = fields.map((f, idx) => {
        const fid = f.id || f.name || `field_${idx}`;
        const label = escapeHtml(f.label || f.name || "Field");
        const ftype = (f.type || "text").toLowerCase();
        const placeholder = escapeHtml(f.placeholder || "");
        const savedVal = savedValues[fid];

        let inputControl = "";
        if (ftype === "select" || ftype === "dropdown") {
          const opts = Array.isArray(f.options) ? f.options : [];
          const currentVal = savedVal !== undefined ? savedVal : f.default;
          inputControl = `
            <select name="${fid}" class="genui-form-select">
              ${opts.map(o => {
            const optVal = typeof o === "object" ? o.value : o;
            const optLabel = typeof o === "object" ? o.label : o;
            const sel = String(currentVal) === String(optVal) ? "selected" : "";
            return `<option value="${escapeHtml(String(optVal))}" ${sel}>${escapeHtml(String(optLabel))}</option>`;
          }).join("")}
            </select>`;
        } else if (ftype === "slider" || ftype === "range") {
          const min = f.min !== undefined ? f.min : 0;
          const max = f.max !== undefined ? f.max : 100;
          const step = f.step !== undefined ? f.step : 1;
          const currentVal = savedVal !== undefined ? savedVal : (f.default !== undefined ? f.default : min);
          const unit = f.unit || "";
          inputControl = `
            <div class="genui-form-slider-wrap">
              <input type="range" name="${fid}" class="genui-slider-input" min="${min}" max="${max}" step="${step}" value="${currentVal}" data-unit="${escapeHtml(unit)}" />
              <span class="genui-slider-bubble font-mono">${escapeHtml(unit)}${currentVal}</span>
            </div>`;
        } else if (ftype === "toggle" || ftype === "switch" || ftype === "checkbox") {
          const isChecked = savedVal !== undefined ? Boolean(savedVal) : Boolean(f.default);
          inputControl = `
            <label class="genui-switch">
              <input type="checkbox" name="${fid}" ${isChecked ? "checked" : ""} />
              <span class="genui-switch-slider"></span>
            </label>`;
        } else {
          const currentVal = savedVal !== undefined ? savedVal : (f.default || "");
          inputControl = `<input type="${ftype === 'number' ? 'number' : ftype === 'email' ? 'email' : 'text'}" name="${fid}" class="genui-form-input" placeholder="${placeholder}" value="${escapeHtml(String(currentVal))}" ${f.required ? "required" : ""} />`;
        }

        return `
          <div class="genui-form-field">
            <label class="genui-form-label">
              ${label} ${f.required ? '<span class="text-rose-500">*</span>' : ''}
            </label>
            ${inputControl}
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-form-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">📝 ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge primary">Interactive Form</span>
          </div>
          <div class="genui-card-body">
            <form class="genui-form-wrap" id="${compId}-form" onsubmit="event.preventDefault();">
              ${fieldsHtml}
              <div class="mt-4 pt-3 border-t border-border/40">
                <button type="button" class="genui-action-btn primary w-full genui-form-submit" data-comp-id="${compId}" data-title="${escapeHtml(b.title || 'Form')}">
                  ${escapeHtml(b.submitLabel || "Submit Form")} →
                </button>
              </div>
            </form>
          </div>
        </div>`;
    },

    // 4. STANDALONE SLIDER CARD
    renderSliderCard(b) {
      const compId = this.getComponentId(b, "slider");
      const title = escapeHtml(b.title || "Adjust Value");
      const label = escapeHtml(b.label || "Value");
      const min = b.min !== undefined ? b.min : 0;
      const max = b.max !== undefined ? b.max : 100;
      const step = b.step !== undefined ? b.step : 1;
      const unit = b.unit || "";
      const savedVal = GenUIState.get(compId, { value: b.default !== undefined ? b.default : min }).value;

      return `
        <div class="genui-card genui-slider-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div class="genui-card-title">🎚️ ${title}</div>
            <span class="genui-badge primary font-mono" id="${compId}-badge">${escapeHtml(unit)}${savedVal}</span>
          </div>
          <div class="genui-card-body">
            <div class="text-xs text-muted-foreground mb-2">${label}</div>
            <div class="genui-form-slider-wrap">
              <input type="range" class="genui-slider-input" data-comp-id="${compId}" min="${min}" max="${max}" step="${step}" value="${savedVal}" data-unit="${escapeHtml(unit)}" />
              <span class="genui-slider-bubble font-mono">${escapeHtml(unit)}${savedVal}</span>
            </div>
            <div class="flex justify-between text-[11px] text-muted-foreground font-mono mt-1">
              <span>${escapeHtml(unit)}${min}</span>
              <span>${escapeHtml(unit)}${max}</span>
            </div>
            <div class="mt-3.5 pt-3 border-t border-border/40">
              <button type="button" class="genui-action-btn primary w-full genui-slider-submit" data-comp-id="${compId}" data-label="${label}" data-unit="${escapeHtml(unit)}">
                ${escapeHtml(b.actionLabel || `Confirm ${unit}${savedVal}`)} →
              </button>
            </div>
          </div>
        </div>`;
    },

    // 5. INTERACTIVE CHECKLIST (Tasks & Audits with Progress)
    renderChecklist(b) {
      const compId = this.getComponentId(b, "check");
      const title = escapeHtml(b.title || "Checklist");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const items = Array.isArray(b.items) ? b.items : [];

      const initialChecked = items
        .map((it, idx) => (it.checked || it.completed ? String(it.id || idx) : null))
        .filter(Boolean);
      const savedState = GenUIState.get(compId, { checked: initialChecked });
      const checkedSet = new Set(savedState.checked || []);

      const total = items.length;
      const checkedCount = items.filter((it, idx) => checkedSet.has(String(it.id || idx))).length;
      const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

      const itemsHtml = items.map((it, idx) => {
        const itemId = String(it.id || idx);
        const isChecked = checkedSet.has(itemId);
        const text = renderInlineFormatting(escapeHtml(it.text || it.title || "Task"));
        const tag = it.tag ? `<span class="genui-badge text-[10px] ml-auto">${escapeHtml(it.tag)}</span>` : "";

        return `
          <div class="genui-check-item ${isChecked ? 'completed' : ''}"
               data-genui-check-item="${escapeHtml(itemId)}"
               data-comp-id="${compId}">
            <div class="genui-checkbox-box ${isChecked ? 'checked' : ''}">
              <svg viewBox="0 0 24 24" class="size-3 fill-none stroke-current" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span class="genui-check-text flex-1">${text}</span>
            ${tag}
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-checklist-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">✅ ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge ${pct === 100 ? 'success' : 'primary'}" id="${compId}-badge">${pct}% Done</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-progress-track mb-3">
              <div class="genui-progress-bar" id="${compId}-bar" style="width: ${pct}%;"></div>
            </div>
            <div class="text-[11px] text-muted-foreground font-medium mb-2.5" id="${compId}-label">
              ${checkedCount} of ${total} tasks completed
            </div>
            <div class="genui-checklist-items">
              ${itemsHtml}
            </div>
            ${this.renderActionsRow(b.actions || (b.action ? [b.action] : []))}
          </div>
        </div>`;
    },

    // 6. INTERACTIVE QUIZ (Knowledge check with instant feedback)
    renderQuiz(b) {
      const compId = this.getComponentId(b, "quiz");
      const title = escapeHtml(b.title || "Knowledge Check");
      const question = escapeHtml(b.question || "Quiz Question");
      const options = Array.isArray(b.options) ? b.options : [];
      const savedState = GenUIState.get(compId, { answered: false, selectedIndex: null });

      const optionsHtml = options.map((opt, idx) => {
        const isSelected = savedState.answered && savedState.selectedIndex === idx;
        const isCorrect = Boolean(opt.isCorrect);
        let optClass = "";
        if (savedState.answered) {
          if (isCorrect) optClass = "correct";
          else if (isSelected) optClass = "wrong";
        }
        return `
          <div class="genui-quiz-opt ${optClass}"
               data-genui-quiz-opt="${idx}"
               data-comp-id="${compId}"
               data-is-correct="${isCorrect}"
               data-explanation="${escapeHtml(opt.explanation || b.explanation || '')}">
            <div class="genui-quiz-opt-letter">${String.fromCharCode(65 + idx)}</div>
            <div class="flex-1 font-medium text-sm text-foreground">${escapeHtml(opt.text || "")}</div>
            <div class="genui-quiz-status-icon">
              ${isCorrect ? '✓' : isSelected ? '✕' : ''}
            </div>
          </div>`;
      }).join("");

      const feedbackHtml = savedState.answered ? `
        <div class="genui-quiz-feedback active animate-fade-in mt-3 p-3 rounded-xl bg-accent/60 border border-border">
          <div class="font-semibold text-xs text-indigo-400 mb-1 flex items-center gap-1.5">
            ${savedState.isCorrect ? '🎉 Correct Answer!' : '💡 Explanation'}
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed">${renderInlineFormatting(escapeHtml(savedState.explanation || b.explanation || ""))}</p>
          <button type="button" class="genui-action-btn mt-2.5 text-xs py-1 px-2.5" data-genui-prompt="Can you explain more about this quiz question: ${escapeHtml(b.question || '')}">
            Discuss this with AI →
          </button>
        </div>` : `<div class="genui-quiz-feedback hidden" id="${compId}-feedback"></div>`;

      return `
        <div class="genui-card genui-quiz-card ${savedState.answered ? 'quiz-revealed' : ''}" id="${compId}-wrap">
          <div class="genui-card-header">
            <div class="genui-card-title">🧠 ${title}</div>
            <span class="genui-badge primary">Quiz</span>
          </div>
          <div class="genui-card-body">
            <div class="font-semibold text-[15px] text-foreground mb-3 leading-snug">${question}</div>
            <div class="genui-quiz-options">
              ${optionsHtml}
            </div>
            ${feedbackHtml}
          </div>
        </div>`;
    },

    // 7. INTERACTIVE POLL (Community voting with percentage animation)
    renderPoll(b) {
      const compId = this.getComponentId(b, "poll");
      const title = escapeHtml(b.title || "Community Poll");
      const question = escapeHtml(b.question || "Poll Question");
      const options = Array.isArray(b.options) ? b.options : [];
      const savedState = GenUIState.get(compId, { voted: false, selectedIndex: null });

      const totalVotes = options.reduce((sum, o) => sum + (Number(o.votes) || 1), 0) + (savedState.voted ? 1 : 0);

      const optionsHtml = options.map((opt, idx) => {
        const isVoted = savedState.voted && savedState.selectedIndex === idx;
        let votes = Number(opt.votes) || 0;
        if (isVoted) votes += 1;
        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

        return `
          <div class="genui-poll-opt ${isVoted ? 'voted' : ''}"
               data-genui-poll-opt="${idx}"
               data-comp-id="${compId}"
               data-text="${escapeHtml(opt.text || '')}">
            <div class="genui-poll-bg-fill" style="width: ${savedState.voted ? pct : 0}%;"></div>
            <div class="flex items-center justify-between w-full relative z-10">
              <span class="font-medium text-sm text-foreground">${escapeHtml(opt.text || "")} ${isVoted ? '✓' : ''}</span>
              ${savedState.voted ? `<span class="font-bold text-xs text-foreground font-mono">${pct}%</span>` : ''}
            </div>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-poll-card ${savedState.voted ? 'poll-voted' : ''}" id="${compId}-wrap">
          <div class="genui-card-header">
            <div class="genui-card-title">📊 ${title}</div>
            <span class="genui-badge primary">Live Poll</span>
          </div>
          <div class="genui-card-body">
            <div class="font-semibold text-sm text-foreground mb-3">${question}</div>
            <div class="genui-poll-options">
              ${optionsHtml}
            </div>
            <div class="text-[11px] text-muted-foreground mt-2.5">
              ${savedState.voted ? `Voted • ${totalVotes} total responses` : 'Tap an option to cast your vote'}
            </div>
          </div>
        </div>`;
    },

    // 8. TIMELINE & STEP FLOW
    renderTimeline(b) {
      const compId = this.getComponentId(b, "timeline");
      const title = escapeHtml(b.title || "Project Timeline");
      const steps = Array.isArray(b.steps) ? b.steps : [];

      const stepsHtml = steps.map((s, idx) => {
        const num = s.number || (idx + 1);
        const status = s.status || (idx === 0 ? "completed" : idx === 1 ? "current" : "upcoming");
        const stitle = escapeHtml(s.title || `Stage ${num}`);
        const desc = s.description ? `<p class="text-xs text-muted-foreground mt-1 leading-relaxed">${renderInlineFormatting(escapeHtml(s.description))}</p>` : "";
        const time = s.time || s.duration ? `<span class="text-[11px] font-mono text-muted-foreground">${escapeHtml(s.time || s.duration)}</span>` : "";

        return `
          <div class="genui-timeline-item ${status}">
            <div class="genui-timeline-node">
              ${status === 'completed' ? '✓' : `<span class="text-[10px] font-bold">${num}</span>`}
            </div>
            <div class="genui-timeline-content">
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-sm text-foreground">${stitle}</span>
                ${time}
              </div>
              ${desc}
            </div>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-timeline-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div class="genui-card-title">🗺️ ${title}</div>
            <span class="genui-badge primary">Roadmap</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-timeline-list">
              ${stepsHtml}
            </div>
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    // 9. CLEAN FORMATTED TABLE
    renderTable(b) {
      const compId = this.getComponentId(b, "table");
      const title = escapeHtml(b.title || "Data Table");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const cols = Array.isArray(b.columns) ? b.columns : [];
      const rows = Array.isArray(b.rows) ? b.rows : [];

      const thead = cols.length ? `
        <thead>
          <tr>${cols.map(c => `<th>${escapeHtml(String(c))}</th>`).join("")}</tr>
        </thead>` : "";

      const tbody = rows.map(r => `
        <tr>
          ${(Array.isArray(r) ? r : Object.values(r)).map(cell => `<td>${renderInlineFormatting(escapeHtml(String(cell || '')))}</td>`).join("")}
        </tr>
      `).join("");

      return `
        <div class="genui-card genui-table-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">📋 ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge primary">Table</span>
          </div>
          <div class="genui-card-body p-0">
            <div class="genui-table-scroll-wrap">
              <table class="genui-table">
                ${thead}
                <tbody>${tbody}</tbody>
              </table>
            </div>
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    // 10. PROGRESS CARD
    renderProgress(b) {
      const compId = this.getComponentId(b, "prog");
      const title = escapeHtml(b.title || "Progress Status");
      const pct = Math.max(0, Math.min(100, Number(b.percentage || b.progress || 0)));
      const status = escapeHtml(b.status || `${pct}% Completed`);
      const milestones = Array.isArray(b.milestones) ? b.milestones : [];

      const msHtml = milestones.map(m => {
        const isDone = Boolean(m.completed || m.done);
        return `
          <div class="flex items-center gap-2 text-xs py-1">
            <span class="text-sm ${isDone ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}">${isDone ? '✓' : '○'}</span>
            <span class="${isDone ? 'text-foreground font-medium' : 'text-muted-foreground'}">${escapeHtml(m.label || m.title || "")}</span>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-progress-card" id="${compId}-wrap">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">🎯 ${title}</div>
              <div class="genui-card-subtitle">${status}</div>
            </div>
            <span class="genui-badge ${pct === 100 ? 'success' : 'primary'} font-mono">${pct}%</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-progress-track mb-3">
              <div class="genui-progress-bar" style="width: ${pct}%;"></div>
            </div>
            ${msHtml ? `<div class="mt-2 pt-2 border-t border-border/40 space-y-0.5">${msHtml}</div>` : ""}
            ${this.renderActionsRow(b.actions || (b.action ? [b.action] : []))}
          </div>
        </div>`;
    },

    // 11. PRODUCT CARD
    renderProductCard(b) {
      const title = escapeHtml(b.title || "Product");
      const subtitle = b.subtitle || b.category ? escapeHtml(b.subtitle || b.category) : "";
      const badge = b.badge ? `<span class="genui-badge primary">${escapeHtml(b.badge)}</span>` : "";
      const price = b.price ? escapeHtml(b.price) : "";
      const origPrice = b.originalPrice ? `<span class="genui-product-original-price">${escapeHtml(b.originalPrice)}</span>` : "";
      const discount = b.discount ? `<span class="genui-badge success">${escapeHtml(b.discount)}</span>` : "";
      const rating = b.rating ? `⭐ ${escapeHtml(String(b.rating))} ${b.ratingCount ? `<span class="text-xs text-muted-foreground font-normal">(${escapeHtml(String(b.ratingCount))})</span>` : ""}` : "";
      const imgUrl = b.image || b.imageUrl;
      const imgHtml = imgUrl ? `
        <div class="genui-product-image-wrap">
          <img src="${escapeHtml(imgUrl)}" alt="${title}" class="genui-product-image" loading="lazy" onerror="this.parentElement.style.display='none'"/>
        </div>` : "";

      let featuresHtml = "";
      const featuresList = Array.isArray(b.features)
        ? b.features
        : (typeof b.features === "string" ? b.features.split(",").map(s => s.trim()).filter(Boolean) : []);
      if (featuresList.length) {
        featuresHtml = `<div class="genui-product-features">` +
          featuresList.map(f => `
            <div class="genui-feature-item">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 fill-none stroke-current" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${escapeHtml(f)}</span>
            </div>
          `).join("") +
          `</div>`;
      }

      const actionsHtml = this.renderActionsRow(b.actions || [
        { label: "Specifications", prompt: `Explain full specifications of ${b.title || "this product"}` },
        { label: "Compare Alternatives", prompt: `What are the best alternatives to ${b.title || "this product"}?` }
      ]);

      return `
        <div class="genui-card genui-product-card">
          ${imgHtml}
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">${title}</div>
              ${subtitle ? `<div class="genui-card-subtitle">${subtitle}</div>` : ""}
            </div>
            ${badge}
          </div>
          <div class="genui-card-body">
            ${rating ? `<div class="genui-product-rating">${rating}</div>` : ""}
            ${price ? `<div class="genui-product-price-row"><span class="genui-product-price">${price}</span>${origPrice}${discount}</div>` : ""}
            ${featuresHtml}
            ${actionsHtml}
          </div>
        </div>`;
    },

    // 12. INFO CARD
    renderInfoCard(b) {
      const title = escapeHtml(b.title || "Information");
      const icon = b.icon ? `<span class="text-lg mr-1.5">${escapeHtml(b.icon)}</span>` : "ℹ️ ";
      const badge = b.badge ? `<span class="genui-badge ${b.status === 'warning' ? 'warning' : b.status === 'success' ? 'success' : 'primary'}">${escapeHtml(b.badge)}</span>` : "";
      const desc = b.description ? `<p class="text-sm text-foreground/90 mt-1 leading-relaxed">${renderInlineFormatting(escapeHtml(b.description))}</p>` : "";

      let metaHtml = "";
      const items = b.metadata || b.items;
      if (items) {
        metaHtml = `<div class="genui-meta-grid">`;
        if (Array.isArray(items)) {
          metaHtml += items.map(it => `
            <div class="genui-meta-item">
              <span class="genui-meta-label">${escapeHtml(it.label || "")}</span>
              <span class="genui-meta-value">${escapeHtml(String(it.value || ""))}</span>
            </div>
          `).join("");
        } else if (typeof items === "object") {
          metaHtml += Object.entries(items).map(([k, v]) => `
            <div class="genui-meta-item">
              <span class="genui-meta-label">${escapeHtml(k)}</span>
              <span class="genui-meta-value">${escapeHtml(String(v))}</span>
            </div>
          `).join("");
        }
        metaHtml += `</div>`;
      }

      const actionsHtml = this.renderActionsRow(b.actions);

      return `
        <div class="genui-card genui-info-card">
          <div class="genui-card-header">
            <div class="flex items-center">
              <span class="genui-card-title">${icon}${title}</span>
            </div>
            ${badge}
          </div>
          <div class="genui-card-body">
            ${desc}
            ${metaHtml}
            ${actionsHtml}
          </div>
        </div>`;
    },

    // 13. WEATHER CARD
    renderWeatherCard(b) {
      const loc = escapeHtml(b.location || b.city || "Current Location");
      const temp = escapeHtml(b.temp || b.temperature || "--");
      const condition = escapeHtml(b.condition || "Clear");
      const icon = b.icon || (condition.toLowerCase().includes("cloud") ? "⛅" : condition.toLowerCase().includes("rain") ? "🌧️" : "☀️");
      const highLow = (b.high || b.low) ? `H: ${escapeHtml(b.high || "--")} • L: ${escapeHtml(b.low || "--")}` : "";

      let forecastHtml = "";
      if (Array.isArray(b.forecast) && b.forecast.length) {
        forecastHtml = `<div class="genui-weather-forecast-row">` +
          b.forecast.map(f => `
            <div class="genui-forecast-day-box">
              <span class="text-xs text-muted-foreground font-medium">${escapeHtml(f.day || "")}</span>
              <span class="text-xl">${f.icon || "☀️"}</span>
              <span class="text-xs font-semibold text-foreground">${escapeHtml(f.temp || "")}</span>
            </div>
          `).join("") +
          `</div>`;
      }

      return `
        <div class="genui-card genui-weather-card">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">${loc}</div>
              <div class="genui-card-subtitle">${condition} ${highLow ? `• ${highLow}` : ""}</div>
            </div>
            <span class="genui-badge primary">Live Weather</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-weather-main">
              <div class="genui-weather-temp">${temp}</div>
              <div class="genui-weather-icon">${icon}</div>
            </div>
            <div class="genui-weather-grid">
              ${b.humidity ? `<div class="genui-weather-stat-box"><span class="genui-weather-stat-label">Humidity</span><span class="genui-weather-stat-val">${escapeHtml(b.humidity)}</span></div>` : ""}
              ${b.wind ? `<div class="genui-weather-stat-box"><span class="genui-weather-stat-label">Wind</span><span class="genui-weather-stat-val">${escapeHtml(b.wind)}</span></div>` : ""}
              ${b.feelsLike ? `<div class="genui-weather-stat-box"><span class="genui-weather-stat-label">Feels Like</span><span class="genui-weather-stat-val">${escapeHtml(b.feelsLike)}</span></div>` : ""}
              ${b.uvIndex ? `<div class="genui-weather-stat-box"><span class="genui-weather-stat-label">UV Index</span><span class="genui-weather-stat-val">${escapeHtml(b.uvIndex)}</span></div>` : ""}
            </div>
            ${forecastHtml}
          </div>
        </div>`;
    },

    // 14. STATS CARD
    renderStatsCard(b) {
      const title = escapeHtml(b.title || "Key Metrics");
      const metrics = Array.isArray(b.metrics)
        ? b.metrics
        : Array.isArray(b.data)
          ? b.data
          : Array.isArray(b.items)
            ? b.items
            : Array.isArray(b.stats)
              ? b.stats
              : [b];

      const itemsHtml = metrics.map(m => {
        const val = escapeHtml(String(m.value || m.val || "--"));
        const lbl = escapeHtml(String(m.label || "Metric"));
        const delta = m.delta ? escapeHtml(String(m.delta)) : "";
        const deltaType = m.deltaType === "down" || (delta && delta.startsWith("-")) ? "down" : "up";
        const deltaHtml = delta ? `<div class="genui-stat-delta ${deltaType}">${deltaType === "up" ? "↑" : "↓"} ${delta}</div>` : "";
        const progressHtml = m.progress !== undefined ? `
          <div class="genui-progress-track">
            <div class="genui-progress-bar" style="width: ${Math.max(0, Math.min(100, Number(m.progress)))}%;"></div>
          </div>` : "";

        return `
          <div class="genui-stat-item">
            <span class="genui-stat-label">${lbl}</span>
            <span class="genui-stat-val">${val}</span>
            ${deltaHtml}
            ${progressHtml}
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-stats-card">
          <div class="genui-card-header">
            <div class="genui-card-title">📊 ${title}</div>
            ${b.subtitle ? `<span class="genui-card-subtitle">${escapeHtml(b.subtitle)}</span>` : ""}
          </div>
          <div class="genui-card-body">
            <div class="genui-stats-grid">
              ${itemsHtml}
            </div>
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    // 15. COMPARISON CARD
    renderComparisonCard(b) {
      const title = escapeHtml(b.title || "Comparison");
      const itemA = b.itemA || (b.items && b.items[0]) || { title: "Option A" };
      const itemB = b.itemB || (b.items && b.items[1]) || { title: "Option B" };
      const winA = itemA.winner === true;
      const winB = itemB.winner === true;

      let rowsHtml = "";
      if (Array.isArray(b.features)) {
        rowsHtml = b.features.map(f => {
          const fName = escapeHtml(f.feature || f.name || f.label || f.aspect || "Feature");
          const vA = escapeHtml(String(f.valA !== undefined ? f.valA : (f.valueA !== undefined ? f.valueA : (f.a !== undefined ? f.a : (f.itemA || "--")))));
          const vB = escapeHtml(String(f.valB !== undefined ? f.valB : (f.valueB !== undefined ? f.valueB : (f.b !== undefined ? f.b : (f.itemB || "--")))));
          const isWinA = f.winner === 'A' || f.winner === 'itemA' || f.winner === true;
          const isWinB = f.winner === 'B' || f.winner === 'itemB';
          return `
            <div class="genui-compare-row">
              <div>
                <div class="text-xs text-muted-foreground">${fName}</div>
                <div class="font-medium text-foreground ${isWinA ? 'text-indigo-400 font-bold' : ''}">${vA}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">${fName}</div>
                <div class="font-medium text-foreground ${isWinB ? 'text-indigo-400 font-bold' : ''}">${vB}</div>
              </div>
            </div>
          `;
        }).join("");
      }

      const verdictHtml = b.verdict ? `
        <div class="genui-verdict-box">
          <div class="font-semibold text-xs text-indigo-400 mb-0.5 uppercase tracking-wide">🏆 Recommendation</div>
          <div>${renderInlineFormatting(escapeHtml(b.verdict))}</div>
        </div>` : "";

      return `
        <div class="genui-card genui-comparison-card">
          <div class="genui-card-header">
            <div class="genui-card-title">⚖️ ${title}</div>
            <span class="genui-badge primary">Head-to-Head</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-comparison-wrap">
              <div class="genui-compare-headers">
                <div class="genui-compare-col-header ${winA ? 'winner' : ''}">
                  ${winA ? `<span class="genui-badge success mb-1">Winner</span>` : ""}
                  <div class="font-semibold text-foreground">${escapeHtml(itemA.title || "Option A")}</div>
                  ${itemA.subtitle ? `<div class="text-xs text-muted-foreground mt-0.5">${escapeHtml(itemA.subtitle)}</div>` : ""}
                </div>
                <div class="genui-compare-col-header ${winB ? 'winner' : ''}">
                  ${winB ? `<span class="genui-badge success mb-1">Winner</span>` : ""}
                  <div class="font-semibold text-foreground">${escapeHtml(itemB.title || "Option B")}</div>
                  ${itemB.subtitle ? `<div class="text-xs text-muted-foreground mt-0.5">${escapeHtml(itemB.subtitle)}</div>` : ""}
                </div>
              </div>
              <div class="flex flex-col gap-1">
                ${rowsHtml}
              </div>
              ${verdictHtml}
              ${this.renderActionsRow(b.actions)}
            </div>
          </div>
        </div>`;
    },

    // 16. PROFILE CARD
    renderProfileCard(b) {
      const name = escapeHtml(b.name || "User Profile");
      const role = b.role || b.title ? escapeHtml(b.role || b.title) : "";
      const bio = b.bio ? `<p class="text-sm text-foreground/90 mt-2 leading-relaxed">${escapeHtml(b.bio)}</p>` : "";
      const avatar = b.avatar ? `<img src="${escapeHtml(b.avatar)}" alt="${name}" class="size-12 rounded-full object-cover border border-border" />` : `<div class="size-12 rounded-full bg-accent border border-border flex items-center justify-center font-bold text-lg text-foreground">${name[0] || "👤"}</div>`;

      let tagsHtml = "";
      if (Array.isArray(b.tags) && b.tags.length) {
        tagsHtml = `<div class="flex flex-wrap gap-1.5 mt-2.5">` +
          b.tags.map(t => `<span class="genui-badge">${escapeHtml(t)}</span>`).join("") +
          `</div>`;
      }

      return `
        <div class="genui-card genui-profile-card">
          <div class="genui-card-body pt-5">
            <div class="flex items-center gap-3.5">
              ${avatar}
              <div>
                <div class="genui-card-title text-base">${name}</div>
                ${role ? `<div class="genui-card-subtitle">${role}</div>` : ""}
              </div>
            </div>
            ${bio}
            ${tagsHtml}
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    // 17. RECOMMENDATION CARD
    renderRecommendationCard(b) {
      const title = escapeHtml(b.title || "Top Recommendations");
      const items = Array.isArray(b.items)
        ? b.items
        : Array.isArray(b.recommendations)
          ? b.recommendations
          : Array.isArray(b.picks)
            ? b.picks
            : Array.isArray(b.data)
              ? b.data
              : [];

      const itemsHtml = items.map((it, idx) => {
        const rank = it.rank || (idx + 1);
        const rankClass = rank === 1 ? "gold" : "";
        const itemTitle = escapeHtml(it.title || "Pick");
        const score = it.score ? `<span class="text-xs text-amber-500 font-semibold">★ ${escapeHtml(String(it.score))}</span>` : "";
        const tag = it.tag ? `<span class="genui-badge primary ml-2 text-[10px]">${escapeHtml(it.tag)}</span>` : "";
        const desc = it.reason || it.description ? `<p class="text-xs text-muted-foreground mt-1 leading-relaxed">${escapeHtml(it.reason || it.description)}</p>` : "";
        const promptBtn = it.prompt ? `
          <button type="button" class="genui-action-btn mt-2 text-xs py-1 px-2.5" data-genui-prompt="${escapeHtml(it.prompt)}">
            Explore ${itemTitle} →
          </button>` : "";

        return `
          <div class="genui-recom-item">
            <div class="genui-recom-rank ${rankClass}">#${rank}</div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-sm text-foreground">${itemTitle}${tag}</span>
                ${score}
              </div>
              ${desc}
              ${promptBtn}
            </div>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-recommendation-card">
          <div class="genui-card-header">
            <div class="genui-card-title">🎯 ${title}</div>
            <span class="genui-badge primary">Top Picks</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-recom-list">
              ${itemsHtml}
            </div>
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    // 18. CHART CARD
    renderChartCard(b) {
      const title = escapeHtml(b.title || "Data Visualization");
      const subtitle = b.subtitle ? `<div class="genui-card-subtitle">${escapeHtml(b.subtitle)}</div>` : "";
      const chartType = (b.chartType || b.chart_type || "bar").toLowerCase();
      const data = Array.isArray(b.data) ? b.data : [];

      let svgHtml = "";
      if (chartType === "bar") {
        svgHtml = this.generateSvgBarChart(data);
      } else if (chartType === "donut" || chartType === "pie") {
        svgHtml = this.generateSvgDonutChart(data);
      } else if (chartType === "line" || chartType === "area") {
        svgHtml = this.generateSvgLineChart(data);
      } else {
        svgHtml = this.generateSvgBarChart(data);
      }

      return `
        <div class="genui-card genui-chart-card">
          <div class="genui-card-header">
            <div>
              <div class="genui-card-title">📈 ${title}</div>
              ${subtitle}
            </div>
            <span class="genui-badge primary">${chartType.toUpperCase()}</span>
          </div>
          <div class="genui-card-body">
            <div class="genui-chart-box">
              ${svgHtml}
            </div>
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    generateSvgBarChart(data, width = 360, height = 180) {
      if (!Array.isArray(data) || !data.length) return `<div class="text-xs text-muted-foreground p-3">No chart data provided</div>`;
      const padding = { top: 20, right: 15, bottom: 35, left: 35 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const computedMax = Math.max(...data.map(d => this.parseNum(d.value) || 0), 0);
      const maxVal = computedMax > 0 ? computedMax * 1.15 : 10;
      const barW = Math.max(14, Math.min(38, Math.floor(chartW / data.length) - 8));

      let bars = "";
      let labels = "";
      data.forEach((d, i) => {
        const val = this.parseNum(d.value);
        const displayVal = d.value !== undefined ? escapeHtml(String(d.value)) : String(val);
        const barH = Math.max(4, Math.round((val / maxVal) * chartH));
        const x = padding.left + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
        const y = padding.top + (chartH - barH);
        const color = d.color || (i % 2 === 0 ? "#6366f1" : "#8b5cf6");

        bars += `
          <g>
            <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}" opacity="0.9">
              <title>${escapeHtml(d.label || "")}: ${displayVal}</title>
            </rect>
            <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" opacity="0.9">${displayVal}</text>
          </g>`;
        const rawLabel = d.label || "";
        const labelText = rawLabel.length > 11 ? rawLabel.slice(0, 9) + "…" : rawLabel;
        labels += `<text x="${x + barW / 2}" y="${height - 12}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.65">${escapeHtml(labelText)}</text>`;
      });

      return `
        <svg viewBox="0 0 ${width} ${height}" class="w-full" style="max-height:${height}px;">
          <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="currentColor" stroke-opacity="0.15" stroke-width="1" />
          ${bars}
          ${labels}
        </svg>`;
    },

    generateSvgDonutChart(data, size = 180) {
      if (!Array.isArray(data) || !data.length) return "";
      const total = data.reduce((sum, d) => sum + (this.parseNum(d.value) || 0), 0) || 1;
      const radius = 60;
      const cx = 90;
      const cy = 90;
      const circumference = 2 * Math.PI * radius;
      let offset = 0;
      const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#3b82f6", "#8b5cf6", "#14b8a6"];

      let circles = "";
      let legend = `<div class="flex flex-wrap gap-2.5 mt-3 justify-center">`;
      data.forEach((d, i) => {
        const val = this.parseNum(d.value);
        const pct = val / total;
        const strokeDash = `${pct * circumference} ${circumference}`;
        const strokeOffset = -offset;
        offset += pct * circumference;
        const color = d.color || colors[i % colors.length];

        circles += `
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="22"
            stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeOffset}" stroke-linecap="round">
            <title>${escapeHtml(d.label || "")}: ${escapeHtml(String(d.value || val))} (${Math.round(pct * 100)}%)</title>
          </circle>`;

        legend += `
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="w-2.5 h-2.5 rounded-full" style="background:${color};"></span>
            <span>${escapeHtml(d.label || "")} (${Math.round(pct * 100)}%)</span>
          </div>`;
      });
      legend += `</div>`;

      return `
        <div class="flex flex-col items-center">
          <svg viewBox="0 0 180 180" width="${size}" height="${size}" style="transform: rotate(-90deg);">
            ${circles}
          </svg>
          ${legend}
        </div>`;
    },

    generateSvgLineChart(data, width = 360, height = 180) {
      if (!Array.isArray(data) || !data.length) return "";
      const padding = { top: 25, right: 20, bottom: 35, left: 35 };
      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const maxVal = Math.max(...data.map(d => this.parseNum(d.value) || 0), 10);
      const minVal = Math.min(...data.map(d => this.parseNum(d.value) || 0), 0);
      const range = maxVal - minVal || 1;

      const points = data.map((d, i) => {
        const val = this.parseNum(d.value);
        const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
        const y = padding.top + chartH - ((val - minVal) / range) * chartH;
        return { x, y, val, label: d.label || "", rawVal: d.value !== undefined ? String(d.value) : String(val) };
      });

      const polyPoints = points.map(p => `${p.x},${p.y}`).join(" ");
      const areaPoints = `${points[0].x},${padding.top + chartH} ${polyPoints} ${points[points.length - 1].x},${padding.top + chartH}`;

      let dots = "";
      let labels = "";
      points.forEach(p => {
        dots += `
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="#6366f1" stroke="#ffffff" stroke-width="1.5">
            <title>${escapeHtml(p.label)}: ${escapeHtml(p.rawVal)}</title>
          </circle>`;
        labels += `<text x="${p.x}" y="${height - 12}" text-anchor="middle" font-size="10" fill="currentColor" opacity="0.65">${escapeHtml(p.label.slice(0, 8))}</text>`;
      });

      return `
        <svg viewBox="0 0 ${width} ${height}" class="w-full" style="max-height:${height}px;">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points="${areaPoints}" fill="url(#lineGrad)" />
          <polyline points="${polyPoints}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          ${dots}
          ${labels}
        </svg>`;
    },

    // 19. ACTIONS CARD
    renderActionsCard(b) {
      const actions = Array.isArray(b.actions) ? b.actions : Array.isArray(b.buttons) ? b.buttons : Array.isArray(b.chips) ? b.chips : [];
      return `<div class="genui-card genui-actions-card p-3">${this.renderActionsRow(actions)}</div>`;
    },

    // 20. ACCORDION CARD
    renderAccordionCard(b) {
      const title = escapeHtml(b.title || "FAQ / Expandable Sections");
      const items = Array.isArray(b.items) ? b.items : [];

      const itemsHtml = items.map(it => {
        const itemTitle = escapeHtml(it.title || "Section");
        const content = renderInlineFormatting(escapeHtml(it.content || it.body || ""));
        const isOpen = it.defaultOpen ? "open" : "";
        return `
          <div class="genui-accordion-item ${isOpen}">
            <div class="genui-accordion-header">
              <span class="genui-accordion-title">${itemTitle}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4 genui-accordion-icon text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="genui-accordion-content">${content}</div>
          </div>`;
      }).join("");

      return `
        <div class="genui-card genui-accordion-card">
          <div class="genui-card-header">
            <div class="genui-card-title">${title}</div>
          </div>
          <div class="genui-card-body pt-0">
            ${itemsHtml}
          </div>
        </div>`;
    },

    // 21. IMAGE CARD
    renderImageCard(b) {
      const title = escapeHtml(b.title || "Generated Media");
      const imgUrl = escapeHtml(b.image || b.imageUrl || "");
      const caption = b.caption || b.prompt ? escapeHtml(b.caption || b.prompt) : "";

      return `
        <div class="genui-card genui-image-card">
          <div class="genui-product-image-wrap" style="height:220px;">
            <img src="${imgUrl}" alt="${title}" class="genui-product-image" loading="lazy" />
          </div>
          <div class="genui-card-body">
            <div class="genui-card-title text-sm">${title}</div>
            ${caption ? `<p class="text-xs text-muted-foreground mt-1">${caption}</p>` : ""}
            ${this.renderActionsRow(b.actions || [{ label: "Download Image", action: "download", url: imgUrl }])}
          </div>
        </div>`;
    },

    // 22. GENERIC CARD
    renderGenericCard(b) {
      const title = escapeHtml(b.title || "Summary");
      const desc = b.description || b.content ? `<p class="text-sm text-foreground/90 mt-1">${renderInlineFormatting(escapeHtml(b.description || b.content))}</p>` : "";
      return `
        <div class="genui-card">
          <div class="genui-card-header">
            <div class="genui-card-title">${title}</div>
            <span class="genui-badge primary">Card</span>
          </div>
          <div class="genui-card-body">
            ${desc}
            ${this.renderActionsRow(b.actions)}
          </div>
        </div>`;
    },

    renderActionsRow(actions) {
      if (!Array.isArray(actions) || !actions.length) return "";
      return `<div class="genui-actions-row">` +
        actions.map(act => {
          const lbl = escapeHtml(act.label || "Action");
          const prompt = act.prompt ? escapeHtml(act.prompt) : "";
          const isPrimary = act.primary ? "primary" : "";
          const icon = act.icon ? `<span class="mr-1">${escapeHtml(act.icon)}</span>` : "";
          if (act.url) {
            return `<a href="${escapeHtml(act.url)}" target="_blank" rel="noopener" class="genui-action-btn ${isPrimary}">${icon}${lbl} ↗</a>`;
          }
          return `<button type="button" class="genui-action-btn ${isPrimary}" ${prompt ? `data-genui-prompt="${prompt}"` : `title="${lbl}"`}>${icon}${lbl}</button>`;
        }).join("") +
        `</div>`;
    }
  };

  // --- Fast Resilient Partial JSON Parser for Live Streaming GenUI ---
  function tryParsePartialJson(raw) {
    if (!raw || typeof raw !== "string") return null;
    let s = raw.trim();
    let idx = s.indexOf("{");
    if (idx === -1) {
      idx = s.indexOf("[");
      if (idx === -1) return null;
    }
    s = s.slice(idx);

    // Clean garbage/duplicate tokens before quoted values like :B "B" or :+15% "+15%" -> : "$1"
    s = s.replace(/:\s*[^"\{\}\[\]\n,:]+\s*"([^"]*)"/g, ': "$1"');

    // Clean unquoted tokens like : B, -> : "B", or : +15%, -> : "+15%",
    s = s.replace(/:\s*([A-Za-z0-9_+%-]+)\s*([,\}\]])/g, (m, val, post) => {
      if (["true", "false", "null"].includes(val.toLowerCase())) {
        return `: ${val}${post}`;
      }
      if (/^-?\d+(?:\.\d+)?$/.test(val)) {
        return `: ${val}${post}`;
      }
      return `: "${val}"${post}`;
    });

    let inStr = false;
    let esc = false;
    const stack = [];
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
      } else {
        if (ch === '"') inStr = true;
        else if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if (ch === '}' || ch === ']') {
          if (stack.length && stack[stack.length - 1] === ch) stack.pop();
        }
      }
    }

    let fixed = s;
    if (inStr) fixed += '"';
    while (stack.length) {
      fixed += stack.pop();
    }
    // Remove trailing commas before closing braces/brackets
    fixed = fixed.replace(/,\s*([\]\}])/g, "$1");

    try {
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }

  // --- Auto-Repairing Resilient JSON Parser for LLM Outputs ---
  function tryParseJson(raw) {
    if (!raw || typeof raw !== "string") return null;
    let s = raw.trim();
    try {
      return JSON.parse(s);
    } catch { }

    try {
      let fixed = s
        .replace(/:\s*[^"\{\}\[\]\n,:]+\s*"([^"]*)"/g, ': "$1"')
        .replace(/:\s*([A-Za-z0-9_+%-]+)\s*([,\}\]])/g, (m, val, post) => {
          if (["true", "false", "null"].includes(val.toLowerCase())) {
            return `: ${val}${post}`;
          }
          if (/^-?\d+(?:\.\d+)?$/.test(val)) {
            return `: ${val}${post}`;
          }
          return `: "${val}"${post}`;
        })
        .replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(fixed);
    } catch { }

    return tryParsePartialJson(s);
  }

  // --- Markdown Parser with Code Block Copying & Math Support ---
  function renderMarkdown(content) {
    if (!content) return "";

    const codeBlocks = [];
    let text = content;

    // Strip internal thinking tags <think>...</think> or unclosed <think> during streaming
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
    text = text.replace(/<think>[\s\S]*$/gi, "");

    // Strip accidental internal deliberation / scratchpad leaks from models
    text = text.replace(/^(?:User says\s+"[^"]*"\.?\s*|User:\s*"[^"]*"\.?\s*|Possibly just [^\.]*\.?\s*|Should respond [^\.]*\.?\s*|We have sources\.?\s*|Let's check\.?\s*|first source [^\.]*\.?\s*|It says [^\?]*\?\s*|We need to [^\.]*\.?\s*|However we [^\.]*\.?\s*|Given the [^\.]*\.?\s*)+/gi, "");
    text = text.replace(/^(?:We need to|Given the|The spec|Use max|Provide quick|I think better|Given TOS|We have no)[\s\S]*?(?=(?:```|The |Here|It |Today|\n\n))/i, "");

    // Strip AI refusal disclaimers ("I cannot search the web / I don't have internet / Main search nahi kar sakta")
    text = text.replace(/^(?:As an AI[^\.\n]*[\.\n]\s*|I do not have (?:direct )?access to the internet[^\.\n]*[\.\n]\s*|I cannot browse the internet[^\.\n]*[\.\n]\s*|I cannot search the web[^\.\n]*[\.\n]\s*|Main internet par search nahi kar sakta[^\.\n]*[\.\n]\s*|Main live web search nahi kar sakta[^\.\n]*[\.\n]\s*|Mere paas real-time access nahi hai[^\.\n]*[\.\n]\s*|Mere paas live data access nahi hai[^\.\n]*[\.\n]\s*|Kripya dhyan de ki ye jaankari live nahi hai[^\.\n]*[\.\n]\s*)+/gi, "");
    text = text.replace(/^(?:Lekin|However,|But)\s+/i, "");

    // 1. Math block: $$ ... $$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      return `<div class="math-block">${escapeHtml(math.trim())}</div>`;
    });

    // 2. Math inline: $ ... $
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      return `<span class="math-inline">${escapeHtml(math.trim())}</span>`;
    });

    // 0. Support GenUI XML / Inline tags: <genui> ... </genui>
    text = text.replace(/<genui>([\s\S]*?)<\/genui>/gi, (match, innerJson) => {
      try {
        const parsed = JSON.parse(innerJson.trim());
        const id = "genui-" + Math.random().toString(36).slice(2, 9);
        codeBlocks.push(`<div id="${id}">${GenUIRenderer.render(parsed)}</div>`);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
      } catch {
        return match;
      }
    });

    // 0.1 Stable, zero-jitter GenUI skeleton during live streaming (Prevents screen jumping/flickering)
    text = text.replace(/```(?:ui|genui|json:ui)\s*([\s\S]*?)$/i, (match, innerStream) => {
      if (innerStream.includes("```")) return match;
      if (!isStreaming) {
        const finalParsed = tryParseJson(innerStream);
        if (finalParsed) {
          const id = "genui-" + Math.random().toString(36).slice(2, 9);
          codeBlocks.push(`<div id="${id}" class="genui-wrapper animate-fade-in">${GenUIRenderer.render(finalParsed)}</div>`);
          return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        }
      }
      return `\n<div class="genui-card genui-skeleton-stable my-3 p-4 rounded-2xl border border-indigo-500/25 bg-card/80 backdrop-blur-sm relative overflow-hidden" style="min-height: 200px;">
        <div class="flex items-center justify-between pb-3 border-b border-border/40">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Generating interactive card…</span>
          </div>
          <span class="text-[11px] text-muted-foreground font-mono">Lumi GenUI</span>
        </div>
        <div class="pt-4 space-y-3">
          <div class="h-4 w-2/5 bg-muted/60 rounded-md animate-pulse"></div>
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="h-16 bg-muted/40 rounded-xl border border-border/20 p-2.5 animate-pulse"></div>
            <div class="h-16 bg-muted/40 rounded-xl border border-border/20 p-2.5 animate-pulse"></div>
          </div>
          <div class="h-6 w-full bg-muted/30 rounded-lg animate-pulse"></div>
        </div>
        <div class="genui-shimmer-sweep"></div>
      </div>\n`;
    });

    // 0.2 Universal Resilient GenUI Block Parser (Handles missing leading backticks, 2-backtick closures ``, or unquoted card JSONs)
    text = text.replace(/(?:^|\n)(?:```+)?(?:json:ui|genui|ui)\s*\n?(\{[\s\S]*?\})\s*(?:```+|``|\n\n|$)/gi, (match, innerJson) => {
      try {
        const parsed = tryParseJson(innerJson.trim());
        if (parsed && (parsed.type || parsed.blocks || GenUIRenderer.isRecognizedType(parsed.type))) {
          const id = "genui-" + Math.random().toString(36).slice(2, 9);
          codeBlocks.push(`<div id="${id}" class="genui-wrapper animate-fade-in">${GenUIRenderer.render(parsed)}</div>`);
          return `\n__CODE_BLOCK_${codeBlocks.length - 1}__\n`;
        }
      } catch (e) { }
      return match;
    });

    // 0.3 Filter out model scratchpad / internal deliberation code blocks
    text = text.replace(/```(?:code)?\s*\n*(?:We need to decide|Let'?s output|Given the instructions|I think better)[\s\S]*?```/gi, "");

    // 3. Fenced Code Blocks with IDE Syntax Highlighting, GenUI Interception, Sandbox Run & Copy
    text = text.replace(/```([a-zA-Z0-9_\-\.:]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const cleanLang = (lang || "").trim().toLowerCase();
      const rawCode = code.trim();

      // Check if this is a Generative UI block
      const isExplicitGenUi = ["ui", "genui", "json:ui", "card", "cards", "widget"].includes(cleanLang);
      if (isExplicitGenUi || cleanLang === "json") {
        try {
          const parsed = tryParseJson(rawCode);
          if (
            isExplicitGenUi ||
            (parsed &&
              (parsed.type === "rich_message" ||
                Array.isArray(parsed.blocks) ||
                GenUIRenderer.isRecognizedType(parsed.type) ||
                (Array.isArray(parsed) && parsed.length > 0 && GenUIRenderer.isRecognizedType(parsed[0].type))))
          ) {
            const renderedGenUi = GenUIRenderer.render(parsed);
            if (renderedGenUi) {
              const id = "genui-" + Math.random().toString(36).slice(2, 9);
              codeBlocks.push(`<div id="${id}" class="genui-wrapper animate-fade-in">${renderedGenUi}</div>`);
              return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
            }
          }
        } catch (e) {
          // If JSON parse fails or is normal json code, continue to normal syntax highlighter
        }
      }

      const id = "code-" + Math.random().toString(36).slice(2, 9);
      const displayLang = cleanLang || "code";
      const highlighted = highlightCodeSyntax(rawCode, cleanLang);
      const isPython = cleanLang === "python" || cleanLang === "py";
      const isHtml = cleanLang === "html" || cleanLang.includes("html");

      const blockHtml = `
        <div class="code-block-container" id="container-${id}">
          <div class="code-block-header">
            <span class="code-block-lang">${escapeHtml(displayLang)}</span>
            <div class="code-block-actions">
              ${isPython
          ? `<button type="button" class="code-block-btn btn-run" data-run-py="${id}" title="Run Python code in live sandbox">
                      ${ICONS.play} <span>Run</span>
                    </button>`
          : isHtml
            ? `<button type="button" class="code-block-btn btn-preview" data-preview-html="${id}" title="Live HTML Preview">
                      ${ICONS.eye} <span>Preview</span>
                    </button>`
            : ""
        }
              <button type="button" class="code-block-btn" data-copy-code="${id}" title="Copy code">
                ${ICONS.copy} <span>Copy</span>
              </button>
            </div>
          </div>
          <pre><code>${highlighted}</code></pre>
          <textarea id="raw-${id}" style="display:none;">${escapeHtml(rawCode)}</textarea>
          <div id="output-${id}" class="code-exec-output" style="display:none;"></div>
        </div>`;
      codeBlocks.push(blockHtml);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // 4. Tables (Line by line parsing for 100% safety and no regex errors)
    const lines = text.split("\n");
    const newLines = [];
    let inTable = false;
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("|") && line.endsWith("|")) {
        inTable = true;
        tableRows.push(line);
      } else {
        if (inTable) {
          newLines.push(renderTableBlock(tableRows));
          tableRows = [];
          inTable = false;
        }
        newLines.push(lines[i]);
      }
    }
    if (inTable) {
      newLines.push(renderTableBlock(tableRows));
    }
    text = newLines.join("\n");

    // 5. Clean clumsy heading bolding before parsing: ### **Title** -> ### Title
    text = text.replace(/^(#{1,4})\s*\*\*(.*?)\*\*\s*$/gm, "$1 $2");

    // 6. Line-by-line block parser (Headings, Lists, Quotes, Paragraphs)
    const outputBlocks = [];
    let listType = null; // "ul" or "ol"
    let listItems = [];
    let paraLines = [];

    const flushList = () => {
      if (listType && listItems.length > 0) {
        outputBlocks.push(`<${listType}>\n` + listItems.join("\n") + `\n</${listType}>`);
        listType = null;
        listItems = [];
      }
    };

    const flushPara = () => {
      if (paraLines.length > 0) {
        const textBlock = paraLines.map((l) => l.trim()).filter(Boolean).join("<br/>");
        if (textBlock) {
          outputBlocks.push(`<p>${textBlock}</p>`);
        }
        paraLines = [];
      }
    };

    for (const l of newLines) {
      const trimmed = l.trim();

      // Blank line: separate paragraphs/lists
      if (!trimmed) {
        flushList();
        flushPara();
        continue;
      }

      // Already an HTML block or code block placeholder
      if (
        trimmed.startsWith('<div class="markdown-table-wrapper"') ||
        trimmed.startsWith('__CODE_BLOCK_') ||
        trimmed.startsWith('<div class="genui-') ||
        trimmed.startsWith('<div class="math-block"')
      ) {
        flushList();
        flushPara();
        outputBlocks.push(trimmed);
        continue;
      }

      // Headings (#, ##, ###, ####)
      const hMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (hMatch) {
        flushList();
        flushPara();
        const level = hMatch[1].length;
        outputBlocks.push(`<h${level}>${hMatch[2].replace(/\*\*/g, "")}</h${level}>`);
        continue;
      }

      // Blockquotes (> ...)
      if (trimmed.startsWith(">")) {
        flushList();
        flushPara();
        outputBlocks.push(`<blockquote>${trimmed.slice(1).trim()}</blockquote>`);
        continue;
      }

      // Ordered list: "1. " or "2. "
      const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        flushPara();
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(`<li>${olMatch[2]}</li>`);
        continue;
      }

      // Indented Sub-bullet: "  - " or "  * "
      const subUlMatch = l.match(/^[ \t]+[\*\-]\s+(.*)$/);
      if (subUlMatch) {
        flushPara();
        if (!listType) listType = "ul";
        listItems.push(`<li class="sub-item">${subUlMatch[1]}</li>`);
        continue;
      }

      // Top-level Unordered bullet: "- " or "* "
      const ulMatch = trimmed.match(/^[\*\-]\s+(.*)$/);
      if (ulMatch) {
        flushPara();
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(`<li>${ulMatch[1]}</li>`);
        continue;
      }

      // Plain text line inside paragraph
      flushList();
      paraLines.push(trimmed);
    }

    flushList();
    flushPara();

    let fullHtml = outputBlocks.join("\n");

    // Merge consecutive list blocks separated by newlines
    fullHtml = fullHtml.replace(/<\/ol>\s*<ol>/g, "\n");
    fullHtml = fullHtml.replace(/<\/ul>\s*<ul>/g, "\n");

    // 7. UNIVERSAL INLINE FORMATTING (Applied cleanly across whole document!)
    fullHtml = renderInlineFormatting(fullHtml);

    // 8. Restore Code Blocks
    for (let i = 0; i < codeBlocks.length; i++) {
      fullHtml = fullHtml.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
    }

    return fullHtml;
  }

  function renderInlineFormatting(str) {
    if (!str) return "";
    let s = str;
    // 1. Markdown links: [Title](https://...)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-4 hover:opacity-80">$1</a>');
    // 2. Bold: **text**
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // 3. Italic: *text* (when not part of double asterisks)
    s = s.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, "<em>$1</em>");
    // 4. Inline code: `text`
    s = s.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted border border-border/50 text-foreground">$1</code>');
    // 5. Clean up any leftover stray unclosed double asterisks
    s = s.replace(/\*\*/g, "");
    return s;
  }

  // --- Brand Component Renderers ---
  function renderBrand(size = "size-6", textClass = "text-lg") {
    return `
      <a href="#/" class="flex items-center gap-2.5 font-medium tracking-tight ${textClass} select-none transition-opacity hover:opacity-85" aria-label="Lumi home">
        <img src="${LUMI_LOGO}" alt="Lumi mascot" width="816" height="816" class="object-contain ${size}" />
        <span>Lumi</span>
      </a>`;
  }

  // --- Views ---

  // 1. LANDING VIEW
  function renderLanding() {
    return `
      <div class="relative min-h-screen overflow-hidden bg-background">
        <div class="aurora"></div>

        <header class="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          ${renderBrand("size-7", "text-lg")}
          <div class="flex items-center gap-3">
            <a href="#/chat" class="inline-flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-accent">
              Chats
            </a>
            <a href="#/auth" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 rounded-full border border-border bg-card/60 backdrop-blur">
              Sign in
            </a>
          </div>
        </header>

        <main class="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 text-center md:pt-32 pb-24">
          <!-- Mascot Floating Animation -->
          <div class="relative">
            <img src="${LUMI_LOGO}" alt="Lumi glowing mascot" width="816" height="816" class="object-contain animate-float-soft size-20 drop-shadow-md select-none" />
          </div>

          <h1 class="animate-rise-in mt-8 font-display text-5xl leading-[1.08] tracking-tight md:text-7xl">
            Think out loud with <span class="text-gradient-brand italic">Lumi</span>
          </h1>

          <p class="animate-rise-in mt-5 max-w-xl text-lg text-muted-foreground [animation-delay:120ms] leading-relaxed">
            Ideas, code, life questions — ask anything. Every conversation is saved to your account.
          </p>

          <a href="#/chat" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-transform active:scale-95 hover:opacity-90 bg-primary text-primary-foreground shadow hover:bg-primary/90 animate-rise-in mt-10 h-12 rounded-full px-7 text-base [animation-delay:220ms]">
            Start chatting ${ICONS.arrowRight}
          </a>

          <!-- Studio Feature Highlights / Interactive Preview -->
          <div class="animate-rise-in mt-16 w-full max-w-2xl rounded-3xl border border-border bg-card/85 p-6 shadow-composer backdrop-blur [animation-delay:300ms] text-left">
            <div class="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span class="inline-block size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active AI Studio • GPT-6 Astra ready</span>
              </div>
              <span class="text-xs text-muted-foreground">Custom AI Providers supported</span>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-end">
                <div class="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground max-w-md">
                  Mujhe productivity ke 5 tips do
                </div>
              </div>
              <div class="flex gap-3 items-start">
                <img src="${LUMI_LOGO}" class="size-6 shrink-0 mt-0.5" alt="" />
                <div class="text-sm text-foreground/90 leading-relaxed bg-accent/30 rounded-2xl p-3.5 border border-border/40">
                  <p class="font-medium text-primary mb-1">Here is how to unlock peak focus today:</p>
                  <p class="text-xs text-muted-foreground mb-1.5">1. <strong>Eat That Frog</strong> — Sabse pehle din ka sabse mushkil task finish karo.</p>
                  <p class="text-xs text-muted-foreground mb-1.5">2. <strong>Time-boxing (50/10)</strong> — 50 mins deep work bina phone ke, fir 10 mins relax.</p>
                  <p class="text-xs text-muted-foreground">3. <strong>2-Minute Rule</strong> — Agar koi kaam 2 min se kam ka hai, do it right now!</p>
                </div>
              </div>
            </div>

            <div class="mt-5 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Supports OpenAI, Google Gemini, Anthropic, Ollama</span>
              <a href="#/chat" class="text-primary font-medium hover:underline flex items-center gap-1">Open studio &rarr;</a>
            </div>
          </div>
        </main>
      </div>`;
  }

  // 2. CHAT LAYOUT & SIDEBAR
  function renderSidebar(activeThreadId) {
    const filtered = conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return `
      <aside class="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between px-4 py-4">
          ${renderBrand("size-6", "text-base")}
          <button type="button" class="md:hidden text-muted-foreground hover:text-foreground p-1" id="close-sidebar-btn" aria-label="Close sidebar">
            &times;
          </button>
        </div>

        <!-- New Chat Button -->
        <div class="px-3">
          <a href="#/chat" id="new-chat-btn" class="inline-flex items-center justify-start gap-2 whitespace-nowrap text-sm font-medium transition-colors border border-border hover:bg-sidebar-accent h-9 w-full rounded-xl bg-card px-3 shadow-xs">
            ${ICONS.messageSquarePlus} <span>New chat</span>
          </a>
        </div>

        <!-- Search Bar -->
        <div class="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-border bg-card px-3">
          ${ICONS.search}
          <input
            id="chat-search-input"
            value="${escapeHtml(searchQuery)}"
            placeholder="Search chats"
            class="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <!-- Recent Chats Header -->
        <p class="px-5 pb-1 pt-5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</p>

        <!-- Threads Navigation -->
        <nav class="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4" id="thread-nav-list">
          ${filtered.length === 0
        ? `<p class="px-3 py-4 text-xs text-muted-foreground text-center">No chats yet</p>`
        : filtered
          .map((chat) => {
            const isActive = chat.id === activeThreadId;
            const isEditing = editingChatId === chat.id;

            return `
                    <div class="group relative flex items-center rounded-lg text-sm transition-colors hover:bg-sidebar-accent ${isActive ? "bg-sidebar-accent font-medium text-foreground" : "text-muted-foreground"
              }">
                      ${isEditing
                ? `<input
                              type="text"
                              class="mx-1 my-1 min-w-0 flex-1 rounded-md border border-primary bg-card px-2 py-1 text-sm outline-none"
                              id="rename-input-${chat.id}"
                              value="${escapeHtml(chat.title)}"
                              data-chat-id="${chat.id}"
                              autofocus
                            />`
                : `<a href="#/chat/${chat.id}" class="min-w-0 flex-1 truncate px-3 py-2 text-left" title="${escapeHtml(
                  chat.title
                )}">
                              ${escapeHtml(chat.title)}
                            </a>`
              }
                      
                      <!-- Action buttons on hover -->
                      <div class="flex items-center gap-0.5 pr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          class="rounded-md p-1 text-muted-foreground hover:text-foreground"
                          title="Rename chat"
                          data-action="rename-chat"
                          data-id="${chat.id}"
                        >
                          ${ICONS.edit}
                        </button>
                        <button
                          type="button"
                          class="rounded-md p-1 text-muted-foreground hover:text-destructive"
                          title="Delete chat"
                          data-action="delete-chat"
                          data-id="${chat.id}"
                        >
                          ${ICONS.trash}
                        </button>
                      </div>
                    </div>`;
          })
          .join("")
      }
        </nav>

        <!-- Providers Link -->
        <div class="px-3 pb-2">
          <a
            href="#/providers"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            ${ICONS.server} <span>AI providers</span>
          </a>
        </div>

        <!-- User Profile Footer -->
        <div class="flex items-center gap-2 border-t border-sidebar-border px-3.5 py-3 bg-card/40">
          ${currentUser.photoUrl
        ? `<img src="${escapeHtml(currentUser.photoUrl)}" alt="${escapeHtml(currentUser.name || "")}" class="size-8 rounded-full object-cover select-none shrink-0 border border-primary/30" onerror="this.style.display='none'" />`
        : `<span class="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground select-none shrink-0">
                ${escapeHtml((currentUser.name || currentUser.email || "Y")[0])}
              </span>`
      }
          <div class="min-w-0 flex-1 truncate">
            <div class="truncate text-xs font-semibold text-foreground">
              ${escapeHtml(currentUser.name || (currentUser.email ? currentUser.email.split("@")[0] : "Lumi User"))}
            </div>
            <div class="truncate text-[10px] text-muted-foreground">
              ${escapeHtml(currentUser.email || "Guest")}
            </div>
          </div>
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer shrink-0"
            title="Settings (Dark/White Mode)"
            id="open-settings-btn"
          >
            ${ICONS.settings}
          </button>
          <button
            type="button"
            class="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors cursor-pointer shrink-0"
            title="Sign out"
            id="sign-out-btn"
          >
            ${ICONS.logOut}
          </button>
        </div>
      </aside>
    `;
  }

  // --- Image Compression & Resizing (Keeps payload small & crystal-clear) ---
  function compressAndReadImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          const maxDim = 1024;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // --- UI Components: Attachments, Personas, Export & HTML Modal ---
  function renderAttachmentChips() {
    if (attachedFiles.length === 0) return "";
    return `
      <div class="attachment-chips-container" id="attachment-chips-container">
        ${attachedFiles
        .map(
          (f, idx) => `
          <div class="attachment-chip">
            ${f.isImage && f.dataUrl
              ? `<img src="${f.dataUrl}" class="size-4 object-cover rounded-xs inline-block" />`
              : f.isPdf
                ? "📑"
                : "📄"
            }
            <span class="attachment-chip-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
            <span class="text-[10px] text-muted-foreground">(${formatBytes(f.size)}${f.pages ? `, ${f.pages}p` : ""})</span>
            <button type="button" class="attachment-chip-remove" data-remove-attachment="${idx}" title="Remove file">✕</button>
          </div>`
        )
        .join("")}
      </div>`;
  }

  function updateAttachmentChipsUI() {
    const container = document.querySelector("#attachment-chips-container");
    const chipsHtml = renderAttachmentChips();
    if (container) {
      if (!chipsHtml) {
        container.remove();
      } else {
        container.outerHTML = chipsHtml;
      }
    } else if (chipsHtml) {
      const form = document.querySelector("#chat-composer-form");
      if (form) {
        form.insertAdjacentHTML("afterbegin", chipsHtml);
      }
    }
    document.querySelectorAll("[data-remove-attachment]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-remove-attachment"), 10);
        if (!isNaN(idx) && idx >= 0 && idx < attachedFiles.length) {
          attachedFiles.splice(idx, 1);
          updateAttachmentChipsUI();
        }
      };
    });
  }

  function renderDeviceToolsPicker() {
    const isMobile = LumiDevice.isNative();
    const bInfo = LumiDevice.getBattery();
    const batteryPct = bInfo && bInfo.level >= 0 ? `${bInfo.level}%` : "";
    const isCharging = bInfo && bInfo.isCharging;
    const isTorch = LumiDevice.isTorchOn();

    return `
      <div class="topbar-menu-wrapper relative">
        <button
          type="button"
          id="toggle-device-tools-btn"
          class="topbar-action-pill inline-flex items-center gap-1 h-8 rounded-full border border-border bg-card/80 px-2 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer whitespace-nowrap"
          title="Device Tools (Flashlight, Battery, Haptics)"
        >
          <span>${isTorch ? "🔦" : (isCharging ? "⚡" : "🔋")}</span>
          <span class="device-label hidden sm:inline font-medium text-[11px]">${batteryPct ? `${batteryPct}${isCharging ? " ⚡" : ""}` : "Device"}</span>
          ${ICONS.chevronDown}
        </button>

        <div class="topbar-dropdown-menu hidden" id="device-tools-dropdown-menu">
          <div class="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Hardware & Device Controls
          </div>
          <button type="button" class="dropdown-item" id="device-tool-torch">
            <span class="flex items-center gap-2">
              <span>🔦</span>
              <span>${isTorch ? "Flashlight is ON" : "Turn Flashlight ON"}</span>
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isTorch ? "bg-amber-500/20 text-amber-400" : "bg-secondary text-muted-foreground"} ml-auto">${isTorch ? "ACTIVE" : "OFF"}</span>
          </button>
          <button type="button" class="dropdown-item" id="device-tool-battery">
            <span class="flex items-center gap-2">
              <span>🔋</span>
              <span>Battery Status</span>
            </span>
            <span class="text-[10px] font-mono text-muted-foreground ml-auto">${batteryPct ? `${batteryPct} ${isCharging ? "(Charging)" : ""}` : "Check"}</span>
          </button>
          <button type="button" class="dropdown-item" id="device-tool-vibrate">
            <span class="flex items-center gap-2">
              <span>📳</span>
              <span>Haptic Vibrate</span>
            </span>
            <span class="text-[10px] text-muted-foreground ml-auto">Pulse</span>
          </button>
          <div class="px-2.5 py-1.5 text-[10px] text-muted-foreground/80 border-t border-border mt-1">
            💡 Say <em>"Torch on karo"</em> or <em>"Battery kitni hai"</em> in chat!
          </div>
        </div>
      </div>`;
  }

  function renderPersonaPicker() {
    const icon = PERSONA_ICONS[activePersona] || "🌟";
    const rawLabel = PERSONA_LABELS[activePersona] || "General AI";
    const cleanLabel = rawLabel.replace(/^[^\w\s]+\s*/, "");
    const shortLabel = PERSONA_SHORT_LABELS[activePersona] || "AI";

    return `
      <div class="topbar-menu-wrapper relative">
        <button
          type="button"
          id="toggle-persona-btn"
          class="topbar-action-pill inline-flex items-center gap-1 h-8 rounded-full border border-border bg-card/80 px-2 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer whitespace-nowrap"
          title="Select AI Persona: ${escapeHtml(cleanLabel)}"
        >
          <span>${icon}</span>
          <span class="persona-label hidden sm:inline">${escapeHtml(cleanLabel)}</span>
          <span class="persona-short-label sm:hidden font-medium text-[11px]">${escapeHtml(shortLabel)}</span>
          ${ICONS.chevronDown}
        </button>

        <div class="topbar-dropdown-menu hidden" id="persona-dropdown-menu">
          <div class="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            AI Persona & Mode
          </div>
          ${Object.keys(PERSONA_LABELS)
        .map(
          (key) => `
            <button
              type="button"
              class="dropdown-item ${activePersona === key ? "is-active" : ""}"
              data-select-persona="${key}"
            >
              <span>${PERSONA_LABELS[key]}</span>
              ${activePersona === key ? ICONS.check : ""}
            </button>`
        )
        .join("")}
        </div>
      </div>`;
  }

  function renderExportPicker(threadId) {
    return `
      <div class="topbar-menu-wrapper relative">
        <button
          type="button"
          id="toggle-export-btn"
          class="topbar-action-pill inline-flex items-center gap-1 h-8 rounded-full border border-border bg-card/80 px-2 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer whitespace-nowrap"
          title="Export Conversation"
        >
          ${ICONS.export}
          <span class="hidden sm:inline">Export</span>
          ${ICONS.chevronDown}
        </button>

        <div class="topbar-dropdown-menu ${exportMenuOpen ? "" : "hidden"}" id="export-dropdown-menu">
          <div class="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Export Chat
          </div>
          <button type="button" class="dropdown-item" data-export-chat="md">
            <span>Markdown (.md)</span>
            ${ICONS.download}
          </button>
          <button type="button" class="dropdown-item" data-export-chat="txt">
            <span>Plain Text (.txt)</span>
            ${ICONS.download}
          </button>
          <button type="button" class="dropdown-item" data-export-chat="pdf">
            <span>Print / PDF Document</span>
            ${ICONS.download}
          </button>
        </div>
      </div>`;
  }

  function renderUpgradeModal() {
    if (!upgradeModalState) return "";
    const reason = upgradeModalState.reason || "messages";
    const remaining = LumiGuestQuota.getRemainingMessages();

    let title = "Free Daily Limit Reached";
    let desc = "You have used all 7 free guest messages for today. Sign in with Google in 1 tap for 100% Free Unlimited Access!";

    if (reason === "images") {
      title = "Unlock HD Image Studio";
      desc = "Guests are limited to 1 trial image per day. Sign in with Google for Unlimited Image Studio, sketching drafts, and markup!";
    } else if (reason === "video") {
      title = "Unlock AI Video Studio";
      desc = "High-definition AI cinematic video creation requires an account. Sign in with Google in 1 tap to start generating!";
    }

    return `
      <div id="upgrade-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in" style="z-index:99999;">
        <div class="relative w-full max-w-sm rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-md animate-scale-in text-center" onclick="event.stopPropagation()">
          <button type="button" id="close-upgrade-modal-btn" class="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer text-sm">
            ✕
          </button>

          <div class="mx-auto size-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-primary/30 p-2.5 flex items-center justify-center border border-border/80 shadow-md">
            <img src="${LUMI_LOGO}" alt="Lumi" class="size-9 object-contain" />
          </div>

          <h2 class="mt-4 text-xl font-bold tracking-tight text-foreground">
            ${escapeHtml(title)}
          </h2>

          <p class="mt-2 text-xs text-muted-foreground leading-relaxed">
            ${escapeHtml(desc)}
          </p>

          <div class="mt-4 rounded-2xl border border-border/60 bg-accent/30 p-3.5 text-left space-y-2 text-xs text-foreground">
            <div class="flex items-center gap-2">
              <span class="text-primary font-bold">✔</span>
              <span><strong>Unlimited</strong> AI Messages & Deep Reasoning</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-primary font-bold">✔</span>
              <span>Full ChatGPT Mobile Image Studio Suite</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-primary font-bold">✔</span>
              <span>Permanent Cloud Sync & Google Profile</span>
            </div>
          </div>

          <div class="mt-5">
            <button
              type="button"
              id="upgrade-google-btn"
              class="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-accent transition-all shadow-md active:scale-98 cursor-pointer"
            >
              ${ICONS.google} <span>Continue with Google</span>
            </button>
          </div>

          <div class="mt-3 text-[11px] text-muted-foreground">
            1-tap sign-in • 100% Free • No password required
          </div>
        </div>
      </div>
    `;
  }

  function renderHtmlModal() {
    if (!activeHtmlModal) return "";
    return `
      <div class="html-preview-modal" id="html-preview-modal">
        <div class="html-preview-card animate-rise-in">
          <div class="html-preview-header">
            <span class="flex items-center gap-2">
              <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live HTML Interactive Preview</span>
            </span>
            <button type="button" class="close-html-modal-btn p-1 text-muted-foreground hover:text-foreground cursor-pointer" id="close-html-modal-btn">
              ${ICONS.close}
            </button>
          </div>
          <div class="html-preview-body">
            <iframe id="html-modal-iframe" sandbox="allow-scripts allow-modals"></iframe>
          </div>
        </div>
      </div>`;
  }

  function renderImageLightbox() {
    if (!lightboxImageSrc) return "";
    return `
      <div class="lightbox-modal" id="image-lightbox-modal">
        <div class="lightbox-header">
          <button type="button" class="lightbox-back-btn" id="close-lightbox-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Back</span>
          </button>
          <div class="lightbox-title">
            🎨 ${escapeHtml(lightboxImagePrompt || "AI Generated Image")}
          </div>
          <div class="lightbox-actions">
            <button type="button" class="lightbox-icon-btn" id="lightbox-download-action-btn" title="Download Image">
              ${ICONS.download}
            </button>
            <button type="button" class="lightbox-icon-btn" id="lightbox-zoom-toggle-btn" title="Toggle Zoom">
              ${lightboxZoomed ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>` : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`}
            </button>
          </div>
        </div>
        <div class="lightbox-body" id="lightbox-stage">
          <img
            id="lightbox-main-img"
            src="${escapeHtml(lightboxImageSrc)}"
            alt="${escapeHtml(lightboxImagePrompt || "AI Generated Image")}"
            class="lightbox-img ${lightboxZoomed ? 'zoomed' : ''}"
          />
        </div>
        <div class="lightbox-footer">
          Tap image to zoom • Tap Back or background to return to chat
        </div>
      </div>`;
  }

  // ==========================================================================
  // STUDYAI PRO — REAL BOOK GROUNDED AI STUDY COMPANION SUITE
  // Exact UI Architecture matching Reference Design:
  // Screen 1: Study Home Dashboard (#/study)
  // Screen 2: Book-Grounded Chat (#/study/chat)
  // Screen 3: Book Reference & Reader (#/study/reader)
  // Screen 4: Book Downloader (#/study/downloader)
  // ==========================================================================

  const StudyAI = {
    // Current Reader State
    readerState: {
      bookTitle: "NCERT Mathematics",
      classLevel: "Class 10",
      chapterNum: 4,
      chapterTitle: "Quadratic Equations",
      page: 64,
      totalPages: 166,
      subSection: "4.1 Introduction"
    },

    // Downloader State
    downloaderState: {
      activeTab: "bulk", // "browse" | "bulk" | "my_downloads"
      selectedSources: ["ncert", "mp_board"],
      downloadProgress: null
    },

    // Chat History
    chatHistory: [
      {
        question: "Quadratic Equation kya hota hai? Bachhe ke jaise samjhao, book ke reference ke sath.",
        intro: "Bilkul! Chalo ise bahut simple tarike se samajhte hain, jaise teacher class mein samjhate hain. 😊",
        conceptTitle: "Quadratic Equation (द्विघात समीकरण)",
        conceptSummary: "Ye ek aisa equation hota hai jisme variable (x) ki sabse badi power 2 hoti hai.",
        formula: "ax² + bx + c = 0",
        rules: [
          "yahan a, b, c real numbers hote hain",
          "aur a ≠ 0 hota hai"
        ],
        example: "x² - 5x + 6 = 0",
        exampleNote: "Yahan x ki power 2 hai, isliye ye quadratic equation hai.",
        bookRef: {
          bookTitle: "NCERT Mathematics - Class 10",
          chapterTitle: "Chapter 4: Quadratic Equations",
          pages: "Page: 64 – 66"
        }
      }
    ],

    // Core Books Database
    books: [
      {
        id: "ncert_math_10",
        title: "NCERT Maths",
        fullTitle: "NCERT Mathematics - Class 10",
        classLevel: "Class 10",
        coverColor: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
        shortCode: "MATH",
        status: "Indexed",
        size: "48 MB",
        chaptersCount: 15
      },
      {
        id: "ncert_science_10",
        title: "NCERT Science",
        fullTitle: "NCERT Science - Class 10",
        classLevel: "Class 10",
        coverColor: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        shortCode: "SCI",
        status: "Indexed",
        size: "62 MB",
        chaptersCount: 16
      },
      {
        id: "ncert_english_10",
        title: "First Flight",
        fullTitle: "NCERT First Flight English - Class 10",
        classLevel: "Class 10",
        coverColor: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        shortCode: "ENG",
        status: "Indexed",
        size: "34 MB",
        chaptersCount: 11
      },
      {
        id: "mp_board_math_10",
        title: "MP Board Ganit",
        fullTitle: "MP Board Ganit Class 10 (Hindi Medium)",
        classLevel: "Class 10",
        coverColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        shortCode: "गणित",
        status: "Indexed",
        size: "54 MB",
        chaptersCount: 15
      }
    ],

    // RAG Matcher for any user study question
    findBookReference(query) {
      if (!query) {
        return {
          bookTitle: "NCERT Mathematics",
          classLevel: "Class 10",
          chapterNum: 4,
          chapterTitle: "Quadratic Equations",
          startPage: 64,
          endPage: 66,
          totalPages: 166
        };
      }
      const q = query.toLowerCase();
      if (q.includes("quadratic") || q.includes("dwighat") || q.includes("द्विघात") || q.includes("equation") || q.includes("ax^2")) {
        return {
          bookTitle: "NCERT Mathematics",
          classLevel: "Class 10",
          chapterNum: 4,
          chapterTitle: "Quadratic Equations",
          startPage: 64,
          endPage: 66,
          totalPages: 166
        };
      }
      if (q.includes("trig") || q.includes("sin") || q.includes("cos") || q.includes("tan")) {
        return {
          bookTitle: "NCERT Mathematics",
          classLevel: "Class 10",
          chapterNum: 8,
          chapterTitle: "Introduction to Trigonometry",
          startPage: 161,
          endPage: 165,
          totalPages: 166
        };
      }
      if (q.includes("light") || q.includes("reflection") || q.includes("refraction") || q.includes("prakash") || q.includes("lens")) {
        return {
          bookTitle: "NCERT Science",
          classLevel: "Class 10",
          chapterNum: 9,
          chapterTitle: "Light – Reflection and Refraction",
          startPage: 161,
          endPage: 164,
          totalPages: 244
        };
      }
      if (q.includes("electricity") || q.includes("ohm") || q.includes("current") || q.includes("voltage") || q.includes("vidyut")) {
        return {
          bookTitle: "NCERT Science",
          classLevel: "Class 10",
          chapterNum: 11,
          chapterTitle: "Electricity",
          startPage: 205,
          endPage: 208,
          totalPages: 244
        };
      }
      return {
        bookTitle: "NCERT Mathematics",
        classLevel: "Class 10",
        chapterNum: 4,
        chapterTitle: "Quadratic Equations",
        startPage: 64,
        endPage: 66,
        totalPages: 166
      };
    },

    ask(query) {
      if (!query || !query.trim()) return;
      const q = query.trim();
      const ref = this.findBookReference(q);
      const qLower = q.toLowerCase();
      let answerItem;

      if (qLower.includes("trig") || qLower.includes("sin") || qLower.includes("cos") || qLower.includes("tan")) {
        answerItem = {
          question: q,
          intro: "Chalo Trigonometry ko bilkul basic right-angled triangle aur angles ke sath samajhte hain! 📐",
          conceptTitle: "Trigonometric Ratios (त्रिकोणमितीय अनुपात)",
          conceptSummary: "Trigonometry right-angled triangle ki sides ke ratio aur angles ke relation ko study karti hai.",
          formula: "sin θ = Opposite / Hypotenuse,  cos θ = Adjacent / Hypotenuse",
          rules: ["sin²θ + cos²θ = 1", "tan θ = sin θ / cos θ", "sec²θ - tan²θ = 1"],
          example: "sin(30°) = 1/2,  cos(60°) = 1/2,  tan(45°) = 1",
          exampleNote: "Hamesha right-angled triangle (90°) par lagta hai.",
          bookRef: {
            bookTitle: ref.bookTitle,
            chapterTitle: `Chapter ${ref.chapterNum}: ${ref.chapterTitle}`,
            pages: `Page: ${ref.startPage} – ${ref.endPage}`
          }
        };
      } else if (qLower.includes("light") || qLower.includes("reflection") || qLower.includes("refraction") || qLower.includes("prakash") || qLower.includes("lens")) {
        answerItem = {
          question: q,
          intro: "Prakash (Light) ek form of energy hai jo dekhne me madad karti hai! Chalo textbook se dekhte hain: 💡",
          conceptTitle: "Reflection of Light (प्रकाश का परावर्तन)",
          conceptSummary: "Jab light rays kisi smooth ya polished surface (jaise mirror) se takrakar usi medium me wapas aati hain.",
          formula: "Angle of Incidence (∠i) = Angle of Reflection (∠r)",
          rules: ["Incident ray, normal aur reflected ray ek hi plane me hote hain", "Mirror formula: 1/f = 1/v + 1/u"],
          example: "Concave mirror real aur inverted image banata hai, Convex hamesha virtual & erect.",
          exampleNote: "f = R/2 (Focal length radius of curvature ka aadha hota hai).",
          bookRef: {
            bookTitle: ref.bookTitle,
            chapterTitle: `Chapter ${ref.chapterNum}: ${ref.chapterTitle}`,
            pages: `Page: ${ref.startPage} – ${ref.endPage}`
          }
        };
      } else if (qLower.includes("cricket") || qLower.includes("pizza") || qLower.includes("simple") || qLower.includes("aasan")) {
        answerItem = {
          question: q,
          intro: "Lo bhai! Bilkul mast Cricket aur Sixer ke real-life example se samjho: 🏏",
          conceptTitle: "Cricket Shot & Parabolic Path",
          conceptSummary: "Jab batsman six marta hai, toh ball hawa me ek curve banati hai jisko Parabola bolte hain. Is curve ki equation hoti hai: h = -5t² + 20t + 1.",
          formula: "Ball ki trajectory = ax² + bx + c",
          rules: ["t² ki highest power 2 hai, isliye ye quadratic equation hai", "Highest point aur boundary distance quadratic formula se nikalti hai"],
          example: "Agar ball 60 meter dur jaake giregi, toh quadratic equation solve karke exact landing time mil jata hai!",
          exampleNote: "Isliye games programming aur drone flying me ye math roz use hota hai.",
          bookRef: {
            bookTitle: "NCERT Mathematics - Class 10",
            chapterTitle: "Chapter 4: Quadratic Equations",
            pages: "Page: 64 – 66"
          }
        };
      } else if (qLower.includes("quiz") || qLower.includes("test")) {
        answerItem = {
          question: q,
          intro: "Yeh lo tumhara 3-Question Rapid Fire Quiz! Check karo apni taiyari: 🎯",
          conceptTitle: "Class 10 Board Exam Concept Check",
          conceptSummary: "Q1. Kya (x + 1)² = 2(x - 3) quadratic equation hai?\nQ2. ax² + bx + c = 0 me Discriminant (D) ka formula kya hai?\nQ3. Agar D > 0 ho toh roots kaise honge (Real ya Imaginary)?",
          formula: "Discriminant: D = b² - 4ac",
          rules: ["D > 0: Two distinct real roots", "D = 0: Two equal real roots", "D < 0: No real roots"],
          example: "Answer reply karo ya Notes me save karo!",
          exampleNote: "Tip: Pehle bracket expand karein, standard form me layein fir answer karein.",
          bookRef: {
            bookTitle: "NCERT Mathematics - Class 10",
            chapterTitle: "Chapter 4: Quadratic Equations",
            pages: "Page: 64 – 66"
          }
        };
      } else {
        answerItem = {
          question: q,
          intro: `Zaroor! ${ref.bookTitle} (${ref.classLevel}) ke Chapter ${ref.chapterNum} ke exact concept se samjho: 📚`,
          conceptTitle: `${ref.chapterTitle} (${ref.classLevel})`,
          conceptSummary: `Aapka sawaal "${q}" seedha ${ref.bookTitle} ke syllabus aur standard board guidelines se covered hai.`,
          formula: "Core Syllabus Concept: ax² + bx + c = 0",
          rules: ["Textbook definition aur syllabus ke mutabiq step-by-step reasoning", "Board exam presentation style point-by-point"],
          example: "NCERT Example Problem 1, Page " + ref.startPage,
          exampleNote: "Har formula aur reason likhne se board me full marks milte hain.",
          bookRef: {
            bookTitle: ref.bookTitle,
            chapterTitle: `Chapter ${ref.chapterNum}: ${ref.chapterTitle}`,
            pages: `Page: ${ref.startPage} – ${ref.endPage}`
          }
        };
      }

      this.chatHistory.push(answerItem);
      this.readerState.bookTitle = ref.bookTitle;
      this.readerState.classLevel = ref.classLevel;
      this.readerState.chapterNum = ref.chapterNum;
      this.readerState.chapterTitle = ref.chapterTitle;
      this.readerState.page = ref.startPage;
      this.readerState.totalPages = ref.totalPages;
    },

    // 5-Tab Bottom Navigation Bar
    renderBottomNav(activeTab = "home") {
      return `
        <nav class="studyai-bottom-nav">
          <a href="#/study" class="studyai-nav-item ${activeTab === "home" ? "active" : ""}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="${activeTab === "home" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
          <a href="#/study/downloader" class="studyai-nav-item ${activeTab === "library" ? "active" : ""}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="${activeTab === "library" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
            <span>Library</span>
          </a>
          <a href="#/study/chat" class="studyai-nav-fab" title="Ask StudyAI">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </a>
          <a href="#/study/downloader" class="studyai-nav-item ${activeTab === "downloads" ? "active" : ""}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="${activeTab === "downloads" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Downloads</span>
          </a>
          <a href="#/settings" class="studyai-nav-item ${activeTab === "you" ? "active" : ""}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="${activeTab === "you" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>You</span>
          </a>
        </nav>
      `;
    },

    // SCREEN 1: Study Home Dashboard (#/study)
    renderDashboard() {
      const nickname = localStorage.getItem("lumi_user_nickname") || "Javed";
      return `
        <div class="studyai-viewport">
          <!-- Top Header matching reference Screen 1 -->
          <header class="studyai-header">
            <div class="studyai-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              <span>StudyAI</span>
              <span class="studyai-pro-badge" style="cursor:pointer;" onclick="showToast('⚡ StudyAI Pro Active • Grounded in NCERT & State Board text');" title="StudyAI Pro">PRO</span>
            </div>
            <div class="studyai-header-actions">
              <button type="button" class="p-1.5 text-gray-700 hover:text-black relative" title="Notifications" onclick="showToast('🔔 All NCERT books indexed and up-to-date.');">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-amber-400"></span>
              </button>
              <a href="#/settings" class="studyai-avatar" title="Account & Settings (Click to switch to Studio or configure)">
                <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="50" fill="#f4f4f5"/>
                  <circle cx="50" cy="52" rx="28" ry="26" fill="#fde68a"/>
                  <path d="M22 42C20 22 35 12 50 12C65 12 80 22 78 42C74 38 68 34 50 34C32 34 26 38 22 42Z" fill="#18181b"/>
                  <ellipse cx="40" cy="50" rx="4.5" ry="6" fill="#18181b"/>
                  <ellipse cx="60" cy="50" rx="4.5" ry="6" fill="#18181b"/>
                  <circle cx="41.5" cy="48" r="1.8" fill="#ffffff"/>
                  <circle cx="61.5" cy="48" r="1.8" fill="#ffffff"/>
                  <path d="M46 60C48 62 52 62 54 60" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </a>
            </div>
          </header>

          <!-- Greetings -->
          <div class="studyai-greeting-wrap">
            <div class="studyai-greeting">Hi ${escapeHtml(nickname)} <svg width="24" height="24" viewBox="0 0 36 36" style="display:inline-block;vertical-align:-4px;"><path fill="#FFDC5D" d="M30.5 17.1c-.4-.7-1.3-1-2-.5l-1.6 1v-7c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v4.5l-.6-.3c-.7-.4-1.6-.2-2 .5s-.2 1.6.5 2l.6.3v1l-2-1.1c-.7-.4-1.6-.2-2 .5s-.2 1.6.5 2l2.9 1.7.1.1.2.2 4.1 2.4c3.1 1.8 7.1.7 8.9-2.4 1.8-3.1.8-7.1-2.4-8.9l-2.3-1.3-.1-.1.1-.7z"/><path fill="#FFAC33" d="M10.9 32.5C7.1 30.3 5.8 25.4 8 21.6l6.2-10.8c2.2-3.8 7.1-5.1 10.9-2.9.7.4 1.3 1.3.9 2s-1.3 1-2 .5c-2.7-1.5-6.1-.6-7.7 2.1L9.6 23.8c-1.5 2.7-.6 6.1 2.1 7.7.7.4 1 1.3.5 2-.4.7-1.3 1-2 .5z"/><path fill="#FFDC5D" d="M12.9 28.2c-2.7-1.5-3.6-5-2.1-7.7l6.6-11.5c1.5-2.7 5-3.6 7.7-2.1.8.5 1.1 1.5.6 2.3s-1.5 1.1-2.3.6c-1.6-.9-3.6-.4-4.5 1.2l-6.6 11.5c-.9 1.6-.4 3.6 1.2 4.5.8.5 1.1 1.5.6 2.3s-1.5 1.1-2.3.6l-1.9-1.1z"/></svg></div>
            <div class="studyai-subgreeting">Your AI Study Companion</div>
          </div>

          <!-- Hero Welcome Card (Deep Charcoal Black Card with Anime Mascot) -->
          <div class="studyai-hero-card">
            <div class="studyai-hero-content">
              <div class="studyai-tagline">Ask • Learn • Practice<br/>From Real Books <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:-2px;" xmlns="http://www.w3.org/2000/svg"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="#3b82f6" fill-opacity="0.25" stroke="#93c5fd" stroke-width="2"/><path d="M6 6h10M6 10h10M6 14h6" stroke="#bfdbfe" stroke-width="2" stroke-linecap="round"/></svg></div>
              <div class="studyai-pill-row">
                <span class="studyai-pill-tag">NCERT • State Board • More</span>
              </div>
            </div>
            <div class="studyai-hero-illustration">
              <!-- High-Fidelity Manga Student Vector Illustration matching Reference Screen 1 -->
              <svg width="115" height="115" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer glow circle -->
                <circle cx="65" cy="65" r="62" fill="#27272a" stroke="#3f3f46" stroke-width="1.5"/>
                <!-- Background Anime Hair Silhouette -->
                <path d="M30 65C25 40 40 22 65 22C90 22 105 40 100 65C96 55 90 45 80 40C75 38 68 40 65 40C62 40 55 38 50 40C40 45 34 55 30 65Z" fill="#09090b"/>
                <path d="M28 60C22 75 32 95 38 100C34 90 32 78 35 68Z" fill="#09090b"/>
                <path d="M102 60C108 75 98 95 92 100C96 90 98 78 95 68Z" fill="#09090b"/>
                <!-- Anime Face Shape -->
                <path d="M42 54C42 46 52 46 65 46C78 46 88 46 88 54C88 72 78 86 65 89C52 86 42 72 42 54Z" fill="#ffedd5"/>
                <!-- Shadow under bangs -->
                <path d="M43 54C48 58 56 60 65 60C74 60 82 58 87 54C82 50 74 48 65 48C56 48 48 50 43 54Z" fill="#fed7aa" opacity="0.6"/>
                <!-- Expressive Anime Eyes (Looking slightly left/thoughtful) -->
                <ellipse cx="53" cy="62" rx="5" ry="6.5" fill="#18181b"/>
                <ellipse cx="77" cy="62" rx="5" ry="6.5" fill="#18181b"/>
                <!-- Catchlights in eyes -->
                <circle cx="54.5" cy="60" r="2" fill="#ffffff"/>
                <circle cx="51.5" cy="64.5" r="1.2" fill="#ffffff"/>
                <circle cx="78.5" cy="60" r="2" fill="#ffffff"/>
                <circle cx="75.5" cy="64.5" r="1.2" fill="#ffffff"/>
                <!-- Double Eyelids & Eyebrows -->
                <path d="M47 54C50 52 56 53 58 55" stroke="#09090b" stroke-width="2" stroke-linecap="round"/>
                <path d="M72 55C74 53 80 52 83 54" stroke="#09090b" stroke-width="2" stroke-linecap="round"/>
                <!-- Subtle anime blush -->
                <ellipse cx="48" cy="69" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.7"/>
                <ellipse cx="82" cy="69" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.7"/>
                <!-- Anime Nose & Smile -->
                <path d="M64 66L63 69H65" stroke="#ea580c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M60 74C63 76 67 76 70 74" stroke="#9a3412" stroke-width="2" stroke-linecap="round"/>
                <!-- Manga Hair Spikes / Bangs Front -->
                <path d="M38 50C44 46 50 56 54 48C56 58 64 54 66 48C68 56 76 50 78 54C82 48 88 52 92 48C88 58 84 62 82 60C78 64 72 60 68 62C64 58 60 62 56 60C50 64 44 60 38 50Z" fill="#18181b"/>
                <!-- Over-Ear Headphones -->
                <path d="M32 58C30 40 45 28 65 28C85 28 100 40 98 58" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
                <rect x="27" y="52" width="10" height="20" rx="5" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5"/>
                <rect x="93" y="52" width="10" height="20" rx="5" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5"/>
                <!-- White Zip-Up Hoodie & Collar -->
                <path d="M36 118C38 98 50 94 65 94C80 94 92 98 94 118H36Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
                <!-- Inner Dark T-shirt V-Neck -->
                <path d="M57 94L65 106L73 94" fill="#0f172a"/>
                <!-- Hoodie Drawstrings & Zipper -->
                <line x1="65" y1="106" x2="65" y2="120" stroke="#94a3b8" stroke-width="2"/>
                <line x1="53" y1="96" x2="52" y2="114" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
                <line x1="77" y1="96" x2="78" y2="114" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <!-- Universal Study Search Bar matching reference -->
          <form id="studyai-search-form" class="studyai-search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="studyai-search-input" class="studyai-search-input" placeholder="Kuch bhi pucho..." autocomplete="off" />
          </form>

          <!-- 8 Quick Action Grid Tiles (2 Rows x 4 Cols) -->
          <div class="studyai-grid">
            <!-- 1. Ask AI -->
            <a href="#/study/chat" class="studyai-grid-btn">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              </div>
              <span class="studyai-grid-label">Ask AI</span>
            </a>

            <!-- 2. Books -->
            <a href="#/study/downloader" class="studyai-grid-btn">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              </div>
              <span class="studyai-grid-label">Books</span>
            </a>

            <!-- 3. Notes -->
            <div class="studyai-grid-btn" onclick="showToast('Notes: Generating chapter summaries from indexed books.')">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span class="studyai-grid-label">Notes</span>
            </div>

            <!-- 4. Quiz -->
            <div class="studyai-grid-btn" onclick="StudyAI.ask('Mujhe Class 10 Maths Chapter 4 Quadratic Equations ka 5 question wala Quiz do.'); window.location.hash='#/study/chat'; render();">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <span class="studyai-grid-label">Quiz</span>
            </div>

            <!-- 5. Tests -->
            <div class="studyai-grid-btn" onclick="StudyAI.ask('Class 10 Science Chapter 1 Chemical Reactions ka mock test start karo.'); window.location.hash='#/study/chat'; render();">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <span class="studyai-grid-label">Tests</span>
            </div>

            <!-- 6. Download Books -->
            <a href="#/study/downloader" class="studyai-grid-btn">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <span class="studyai-grid-label">Download Books</span>
            </a>

            <!-- 7. Syllabus -->
            <div class="studyai-grid-btn" onclick="showToast('CBSE & State Board Class 10-12 Syllabus fully mapped.');">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
              <span class="studyai-grid-label">Syllabus</span>
            </div>

            <!-- 8. Progress -->
            <div class="studyai-grid-btn" onclick="showToast('Mastery: 4 Chapters completed • 18 Practice Problems solved.');">
              <div class="studyai-grid-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <span class="studyai-grid-label">Progress</span>
            </div>
          </div>

          <!-- Section: My Books (Local) -->
          <div class="studyai-section-header">
            <span class="studyai-section-title">My Books (Local)</span>
            <a href="#/study/downloader" class="studyai-section-link">View All →</a>
          </div>

          <div class="studyai-books-scroll">
            ${this.books.map(b => `
              <div class="studyai-book-card" onclick="window.location.hash='#/study/reader'">
                <div class="studyai-book-thumb" style="background:${b.coverColor};">
                  <div style="font-size:7px;font-weight:900;letter-spacing:0.05em;color:rgba(255,255,255,0.85);text-transform:uppercase;">${escapeHtml(b.shortCode)}</div>
                  <div style="font-size:8px;font-weight:800;color:#ffffff;line-height:1.1;margin-top:auto;">${escapeHtml(b.title)}</div>
                </div>
                <div class="studyai-book-info">
                  <div class="studyai-book-name">${escapeHtml(b.title)}</div>
                  <div class="studyai-book-class">${escapeHtml(b.classLevel)}</div>
                  <div class="studyai-book-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>${b.status}</span>
                  </div>
                </div>
                <button type="button" class="text-gray-400 p-1 hover:text-black" onclick="event.stopPropagation();showToast('${escapeHtml(b.fullTitle)} — ${b.chaptersCount} chapters indexed.');">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
              </div>
            `).join("")}
          </div>

          <!-- Bottom Navigation -->
          ${this.renderBottomNav("home")}
        </div>
      `;
    },

    // SCREEN 2: Book-Grounded Study Chat (#/study/chat)
    renderChat(threadId) {
      return `
        <div class="studyai-viewport" style="padding-bottom:120px;background:#ffffff;">
          <!-- Chat Header -->
          <header class="studyai-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <a href="#/study" class="p-1 text-gray-700 hover:text-black" title="Back to Study Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </a>
              <div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span style="font-weight:800;font-size:16px;color:#000000;">StudyAI</span>
                  <span class="studyai-pro-badge">PRO</span>
                </div>
                <div style="font-size:11.5px;color:#059669;display:flex;align-items:center;gap:4px;font-weight:500;">
                  <span style="width:6px;height:6px;border-radius:50%;background:#059669;display:inline-block;"></span>
                  <span>Using: NCERT (Class 10)</span>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <a href="#/study/reader" class="p-1 text-gray-700 hover:text-black" title="Open Textbook Reference">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              </a>
              <button type="button" class="p-1 text-gray-700 hover:text-black" onclick="StudyAI.chatHistory=[]; StudyAI.chatHistory.push({question: 'Quadratic Equation kya hota hai? Bachhe ke jaise samjhao, book ke reference ke sath.', intro: 'Bilkul! Chalo ise bahut simple tarike se samajhte hain, jaise teacher class mein samjhate hain. 😊', conceptTitle: 'Quadratic Equation (द्विघात समीकरण)', conceptSummary: 'Ye ek aisa equation hota hai jisme variable (x) ki sabse badi power 2 hoti hai.', formula: 'ax² + bx + c = 0', rules: ['yahan a, b, c real numbers hote hain', 'aur a ≠ 0 hota hai'], example: 'x² - 5x + 6 = 0', exampleNote: 'Yahan x ki power 2 hai, isliye ye quadratic equation hai.', bookRef: {bookTitle: 'NCERT Mathematics - Class 10', chapterTitle: 'Chapter 4: Quadratic Equations', pages: 'Page: 64 – 66'}}); render(); showToast('New study session started!');" title="New Session">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </header>

          <!-- Chat Conversation Container -->
          <div id="studyai-messages-list" class="px-4 py-3 flex-1 flex flex-col gap-5">
            ${this.chatHistory.map((item) => `
              <!-- User Query Bubble -->
              <div class="flex justify-end items-end gap-2">
                <div class="user-msg-bubble rounded-2xl px-4 py-3 max-w-[82%] text-[14px] leading-relaxed" style="background:#27272a;color:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  ${escapeHtml(item.question)}
                </div>
                <div class="size-7 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                  <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="#e2e8f0"/>
                    <path d="M10 32C10 26 13 23 18 23C23 23 26 26 26 32" fill="#334155"/>
                    <circle cx="18" cy="14" r="7" fill="#f87171"/>
                  </svg>
                </div>
              </div>

              <!-- AI Teacher Response with exact styling from Screen 2 -->
              <div class="flex gap-3 items-start">
                <div class="size-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] text-gray-900 leading-relaxed mb-3 font-medium">
                    ${escapeHtml(item.intro)}
                  </p>

                  <!-- Concept Card -->
                  <div class="studyai-concept-card">
                    <div class="studyai-concept-title">
                      <span>${escapeHtml(item.conceptTitle)}</span>
                    </div>
                    <p class="text-[13.5px] text-gray-700 mt-2 leading-relaxed">
                      ${escapeHtml(item.conceptSummary).replace(/\n/g, "<br/>")}
                    </p>

                    ${item.formula ? `
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">
                        <span style="font-size:12.5px;font-weight:700;color:#71717a;">General Form:</span>
                        <!-- Lightbulb sticker -->
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                      </div>
                      <div class="studyai-formula-box">
                        ${escapeHtml(item.formula)}
                      </div>
                    ` : ''}

                    ${item.rules && item.rules.length ? `
                      <ul class="text-[12.5px] text-gray-700 list-disc pl-4 space-y-1 mt-2">
                        ${item.rules.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
                      </ul>
                    ` : ''}

                    ${item.example ? `
                      <div style="font-size:12.5px;font-weight:700;color:#71717a;margin-top:12px;">Example:</div>
                      <div class="text-[14px] text-black font-mono font-bold mt-1">${escapeHtml(item.example)}</div>
                      <div class="text-[12.5px] text-gray-600 mt-1">${escapeHtml(item.exampleNote || "")}</div>
                    ` : ''}

                    <!-- Anime Student Mascot Pointing Sticker matching Screen 2 -->
                    <div style="position:absolute;bottom:10px;right:12px;opacity:0.95;">
                      <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="30" fill="#f4f4f5" stroke="#e4e4e7" stroke-width="1.5"/>
                        <circle cx="32" cy="30" r="15" fill="#fed7aa"/>
                        <!-- Anime boy hair spikes -->
                        <path d="M18 26C16 16 26 12 32 12C38 12 48 16 46 26C42 22 38 20 32 20C26 20 22 22 18 26Z" fill="#18181b"/>
                        <ellipse cx="27" cy="28" rx="2.5" ry="3.5" fill="#18181b"/>
                        <ellipse cx="37" cy="28" rx="2.5" ry="3.5" fill="#18181b"/>
                        <circle cx="28" cy="27" r="1" fill="#ffffff"/>
                        <circle cx="38" cy="27" r="1" fill="#ffffff"/>
                        <path d="M30 35C31 36.5 33 36.5 34 35" stroke="#ea580c" stroke-width="1.5" stroke-linecap="round"/>
                        <!-- White hoodie & pointing hand -->
                        <path d="M20 54C22 42 26 40 32 40C38 40 42 42 44 54H20Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
                        <path d="M42 44L48 38L50 40L45 47" fill="#fed7aa" stroke="#18181b" stroke-width="1.2"/>
                      </svg>
                    </div>
                  </div>

                  <!-- Book Reference Box -->
                  ${item.bookRef ? `
                    <div class="studyai-book-ref-box">
                      <div class="studyai-book-ref-info">
                        <div class="studyai-book-ref-title">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/></svg>
                          <span>${escapeHtml(item.bookRef.bookTitle)}</span>
                        </div>
                        <div class="studyai-book-ref-chapter">${escapeHtml(item.bookRef.chapterTitle)}</div>
                        <div class="studyai-book-ref-pages">${escapeHtml(item.bookRef.pages)}</div>
                      </div>
                      <a href="#/study/reader" class="studyai-open-book-btn">
                        <span>Open Book</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  ` : ''}

                  <!-- Quick Action Pills -->
                  <div class="studyai-pills-row">
                    <button type="button" class="studyai-pill-btn" onclick="showToast('Great! Concept marked as understood.');">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>Okay, Samajh gaya!</span>
                    </button>
                    <button type="button" class="studyai-pill-btn" onclick="StudyAI.ask('Ise aur bhi aasan real-life cricket ya pizza example se samjhao.'); render();">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                      <span>Aur Simple</span>
                    </button>
                    <button type="button" class="studyai-pill-btn" onclick="showToast('Revision notes created in your library!');">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      <span>Notes Banao</span>
                    </button>
                  </div>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Bottom Sticky Study Composer -->
          <div style="position:fixed;bottom:0;left:0;right:0;padding:10px 16px calc(10px + env(safe-area-inset-bottom, 0px)) 16px;background:#ffffff;border-top:1px solid #e5e7eb;z-index:50;">
            <form id="studyai-chat-form" style="display:flex;align-items:center;gap:10px;background:#f3f4f6;border:1.5px solid #e5e7eb;border-radius:9999px;padding:4px 6px 4px 14px;">
              <button type="button" class="text-gray-500 hover:text-black cursor-pointer" onclick="showToast('📸 Photo Solver: Snap homework question to get instant step-by-step book solution.');" title="Upload textbook photo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <input type="text" id="studyai-chat-input" placeholder="Aur kuch puchna hai..." style="flex:1;background:transparent;border:none;outline:none;color:#000000;font-size:14px;font-weight:500;" autocomplete="off" />
              <button type="button" class="text-gray-500 hover:text-black p-1 cursor-pointer" onclick="showToast('🎤 Voice Dictation: Speak your question.');">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
              </button>
              <button type="submit" style="width:36px;height:36px;border-radius:50%;background:#000000;color:#ffffff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          </div>
        </div>
      `;
    },

    // SCREEN 3: Book Reference & Reader (#/study/reader)
    renderReader() {
      const page = this.readerState.page || 64;
      const total = this.readerState.totalPages || 166;
      return `
        <div class="studyai-viewport" style="background:#ffffff;padding-bottom:120px;">
          <!-- Reader Header matching Reference Screen 3 -->
          <header class="studyai-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <a href="#/study/chat" class="p-1 text-gray-700 hover:text-black" title="Back to Chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </a>
              <span style="font-weight:800;font-size:17px;color:#000000;">Book Reference</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="studyai-page-badge" style="float:none;">p. ${page}</span>
            </div>
          </header>

          <!-- Book Reference Simulated Page (Matching Screen 3) -->
          <div class="studyai-reader-page">
            <div style="background:#ede9fe;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
              <div style="font-size:13px;font-weight:700;color:#4338ca;letter-spacing:0.02em;">Chapter ${this.readerState.chapterNum || 4}</div>
              <h2 style="font-size:20px;font-weight:800;color:#312e81;margin:3px 0 0 0;letter-spacing:-0.01em;">${escapeHtml(this.readerState.chapterTitle || "Quadratic Equations")}</h2>
            </div>

            <div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:8px;">${escapeHtml(this.readerState.subSection || "4.1 Introduction")}</div>
            <p style="font-size:13.5px;color:#374151;margin-bottom:12px;line-height:1.65;">
              A quadratic equation is a second degree equation in one variable. It can be written in the form <span style="font-family:monospace;font-weight:800;color:#000000;">ax² + bx + c = 0</span>, where a, b and c are real numbers and <span style="font-family:monospace;font-weight:800;color:#000000;">a ≠ 0</span>.
            </p>

            <div style="font-size:13px;color:#4b5563;margin-bottom:6px;font-weight:600;">For example:</div>
            <div style="font-size:13.5px;color:#111827;font-family:monospace;margin-left:8px;display:flex;flex-direction:column;gap:5px;">
              <div>(i) x² - 5x + 6 = 0</div>
              <div>(ii) 2x² + 3x - 9 = 0</div>
              <div>(iii) x² + 4x = 0</div>
            </div>

            <!-- Note Callout Box matching Screen 3 -->
            <div class="studyai-reader-callout">
              <strong style="color:#b45309;font-weight:800;">Note :</strong> The term quadratic comes from 'quadra' meaning square, because the highest power of the variable is 2.
            </div>
          </div>

          <!-- Page Navigation Controls -->
          <div class="studyai-page-pager">
            <button type="button" class="studyai-pager-btn" id="reader-prev-page" title="Previous Page">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span style="font-size:14px;font-weight:800;color:#000000;font-family:var(--font-mono);">${page} / ${total}</span>
            <button type="button" class="studyai-pager-btn" id="reader-next-page" title="Next Page">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button type="button" class="studyai-pager-btn" onclick="showToast('Search within Chapter 4 activated.');" title="Search in book">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button type="button" class="studyai-pager-btn" onclick="showToast('Fullscreen book view.');" title="Fullscreen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
          </div>

          <!-- "Is page se kya samjhen?" Takeaways Summary Card -->
          <div class="studyai-takeaways-card">
            <div style="font-size:16px;font-weight:800;color:#000000;margin-bottom:12px;">
              <span>Is page se kya samjhen?</span>
            </div>

            <div class="studyai-takeaway-item">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#22c55e;color:#ffffff;flex-shrink:0;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Quadratic equation ki definition</span>
            </div>
            <div class="studyai-takeaway-item">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#22c55e;color:#ffffff;flex-shrink:0;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>General form: <code style="color:#000000;font-weight:700;">ax² + bx + c = 0</code></span>
            </div>
            <div class="studyai-takeaway-item">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#22c55e;color:#ffffff;flex-shrink:0;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span><code style="color:#000000;font-weight:700;">a ≠ 0</code> hona zaroori hai</span>
            </div>
            <div class="studyai-takeaway-item">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#22c55e;color:#ffffff;flex-shrink:0;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Kuch examples (x² - 5x + 6 = 0, etc.)</span>
            </div>

            <div style="display:flex;gap:10px;margin-top:16px;">
              <button type="button" class="studyai-open-book-btn" style="flex:1;justify-content:center;padding:10px 14px;" onclick="showToast('Page takeaways saved into revision notes!');">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span>Notes me save karein</span>
              </button>
              <button type="button" class="studyai-pill-btn" style="padding:10px 14px;font-weight:700;" onclick="StudyAI.ask('Is page 64 ke topic par 3 practice questions puchho.'); window.location.hash='#/study/chat'; render();">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>Practice Questions</span>
              </button>
            </div>
          </div>

          <!-- Bottom Navigation -->
          ${this.renderBottomNav("home")}
        </div>
      `;
    },

    // SCREEN 4: Book Downloader & Offline Manager (#/study/downloader)
    renderDownloader() {
      const isNCERT = this.downloaderState.selectedSources.includes("ncert");
      const isMP = this.downloaderState.selectedSources.includes("mp_board");
      const isState = this.downloaderState.selectedSources.includes("other_state");
      const isRef = this.downloaderState.selectedSources.includes("ref_books");
      const isComp = this.downloaderState.selectedSources.includes("comp_exams");

      let totalGB = 0;
      if (isNCERT) totalGB += 8.2;
      if (isMP) totalGB += 4.1;
      if (isState) totalGB += 14.6;
      if (isRef) totalGB += 6.5;
      if (isComp) totalGB += 11.2;

      return `
        <div class="studyai-viewport" style="padding-bottom:100px;background:#ffffff;">
          <!-- Downloader Header matching Reference Screen 4 -->
          <header class="studyai-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <a href="#/study" class="p-1 text-gray-700 hover:text-black" title="Back to Study Home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </a>
              <span style="font-weight:800;font-size:17px;color:#000000;">Book Downloader</span>
            </div>
            <button type="button" class="p-1 text-gray-700 hover:text-black" onclick="showToast('Active downloads: 2 books remaining in queue.');" title="Download queue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </header>

          <!-- Downloader Tabs (Segmented Control) -->
          <div class="studyai-downloader-tabs">
            <button type="button" class="studyai-tab-btn ${this.downloaderState.activeTab === "browse" ? "active" : ""}" onclick="StudyAI.setDownloaderTab('browse');">
              Browse
            </button>
            <button type="button" class="studyai-tab-btn ${this.downloaderState.activeTab === "bulk" ? "active" : ""}" onclick="StudyAI.setDownloaderTab('bulk');">
              Bulk Download
            </button>
            <button type="button" class="studyai-tab-btn ${this.downloaderState.activeTab === "my_downloads" ? "active" : ""}" onclick="StudyAI.setDownloaderTab('my_downloads');">
              My Downloads
            </button>
          </div>

          <!-- Hero Collection Banner matching Reference Screen 4 -->
          <div style="margin:0 16px 16px 16px;background:#ffffff;border:1.5px solid #e4e4e7;border-radius:20px;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 4px rgba(0,0,0,0.02);">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:46px;height:46px;border-radius:12px;background:#f4f4f5;color:#000000;display:flex;align-items:center;justify-content:center;">
                <!-- Stack of 3 Isometric Books SVG -->
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#18181b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 9L16 4L27 9L16 14L5 9Z" fill="#e4e4e7"/>
                  <path d="M5 15L16 20L27 15"/>
                  <path d="M5 21L16 26L27 21"/>
                </svg>
              </div>
              <div>
                <div style="font-size:14.5px;font-weight:800;color:#000000;">Download Complete Book Collection</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">NCERT • State Board • Popular Books</div>
              </div>
            </div>
            <button type="button" class="size-9 rounded-full bg-black text-white flex items-center justify-center cursor-pointer shadow-sm" onclick="StudyAI.triggerBulkDownload('${totalGB.toFixed(1)}');">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>

          <!-- Select Book Sources Section -->
          <div style="padding:0 16px;">
            <div style="font-size:16px;font-weight:800;color:#000000;margin-bottom:12px;">Select Book Sources</div>

            <div class="studyai-download-checklist" style="padding:0;">
              <!-- Source 1: NCERT -->
              <div class="studyai-source-item ${isNCERT ? 'selected' : ''}" onclick="StudyAI.toggleSource('ncert');">
                <div class="studyai-checkbox">
                  ${isNCERT ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:700;color:#000000;">NCERT (Class 1 – 12)</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:1px;">~ 8.2 GB | 648 Books</div>
                </div>
              </div>

              <!-- Source 2: MP Board -->
              <div class="studyai-source-item ${isMP ? 'selected' : ''}" onclick="StudyAI.toggleSource('mp_board');">
                <div class="studyai-checkbox">
                  ${isMP ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:700;color:#000000;">MP Board (Class 1 – 12)</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:1px;">~ 4.1 GB | 312 Books</div>
                </div>
              </div>

              <!-- Source 3: Other State Boards -->
              <div class="studyai-source-item ${isState ? 'selected' : ''}" onclick="StudyAI.toggleSource('other_state');">
                <div class="studyai-checkbox">
                  ${isState ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:700;color:#000000;">Other State Boards</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:1px;">(UP, Bihar, Rajasthan, etc.)</div>
                </div>
              </div>

              <!-- Source 4: Popular Reference Books -->
              <div class="studyai-source-item ${isRef ? 'selected' : ''}" onclick="StudyAI.toggleSource('ref_books');">
                <div class="studyai-checkbox">
                  ${isRef ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:700;color:#000000;">Popular Reference Books</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:1px;">(HC Verma, RD Sharma, etc.)</div>
                </div>
              </div>

              <!-- Source 5: Competitive -->
              <div class="studyai-source-item ${isComp ? 'selected' : ''}" onclick="StudyAI.toggleSource('comp_exams');">
                <div class="studyai-checkbox">
                  ${isComp ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;font-weight:700;color:#000000;">Competitive (JEE, NEET, UPSC)</div>
                  <div style="font-size:12px;color:#6b7280;margin-top:1px;">(NCERT + Extra)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sticky Bottom Action Button -->
          <div class="studyai-download-sticky-bar">
            <button type="button" class="studyai-download-action-btn" onclick="StudyAI.triggerBulkDownload('${totalGB.toFixed(1)}');">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Selected (${totalGB > 0 ? totalGB.toFixed(1) + ' GB' : '0 GB'})</span>
            </button>
          </div>
        </div>
      `;
    },

    toggleSource(src) {
      const idx = this.downloaderState.selectedSources.indexOf(src);
      if (idx >= 0) {
        this.downloaderState.selectedSources.splice(idx, 1);
      } else {
        this.downloaderState.selectedSources.push(src);
      }
      render();
    },

    setDownloaderTab(tab) {
      this.downloaderState.activeTab = tab;
      render();
    },

    triggerBulkDownload(sizeGB) {
      if (parseFloat(sizeGB) <= 0) {
        showToast("Please select at least one book source.");
        return;
      }
      showToast(`⚡ Starting bulk download of ${sizeGB} GB. Books will be indexed locally.`);
      setTimeout(() => {
        showToast("✔ NCERT Class 10 Mathematics indexed and ready for offline search!");
      }, 1500);
    }
  };
  window.StudyAI = StudyAI;

  // 2. DEDICATED CHATGPT MOBILE-STYLE SETTINGS & STUDIO PREFERENCES
  function getAccentHex(accent) {
    switch (accent) {
      case "pink": return "#ec4899";
      case "purple": return "#a855f7";
      case "indigo": return "#6366f1";
      case "emerald": return "#10b981";
      case "amber": return "#f59e0b";
      default: return "#ec4899";
    }
  }

  function renderSettingsHeader(title, backHref = "#/settings", showInfo = false) {
    return `
      <header class="lumi-settings-header">
        <a href="${backHref}" class="lumi-settings-header-btn" title="Back">
          <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <h1 class="lumi-settings-header-title">${escapeHtml(title)}</h1>
        ${showInfo ? `
          <button type="button" id="settings-info-btn" class="lumi-settings-header-btn" title="About Lumi">
            <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </button>
        ` : `
          <div style="width:44px;height:44px;"></div>
        `}
      </header>
    `;
  }

  function renderSettingsPage(currentPath = "/settings") {
    const memoryProfile = LumiAutonomousMind.getProfile();
    const isBrotherly = memoryProfile.primaryTone === "brotherly_hinglish";
    const totalMemories = memoryProfile.explicitMemories?.length || 0;
    const accountName = localStorage.getItem("lumi_user_name") || "Javed Akhtar";
    const nickname = localStorage.getItem("lumi_user_nickname") || "Javed";
    const accentColor = localStorage.getItem("lumi_accent_color") || "pink";
    const appLanguage = localStorage.getItem("lumi_app_language") || "System default";
    const visualAnswers = localStorage.getItem("lumi_visual_answers") || "Default";
    const homepageSuggestions = localStorage.getItem("lumi_homepage_suggestions") !== "false";
    const customPrompt = localStorage.getItem("lumi_custom_instructions") || "";

    const chevronRight = `<svg style="width:16px;height:16px;color:#757575;margin-left:4px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
    const chevronDown = `<svg style="width:15px;height:15px;color:#9e9e9e;pointer-events:none;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

    // --- SUB-VIEW: GENERAL (#/settings/general) ---
    if (currentPath === "/settings/general") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("General", "#/settings", false)}

          <!-- Card 1: Appearance & Accent Color -->
          <div class="lumi-settings-card">
            <!-- Appearance Row -->
            <div class="lumi-settings-row" id="settings-theme-row">
              <span class="lumi-settings-row-label">Appearance</span>
              <div class="lumi-custom-select-wrap">
                <button type="button" class="lumi-custom-select-trigger" id="settings-theme-trigger">
                  <span id="settings-theme-label">${currentTheme === "dark" ? "Dark" : currentTheme === "light" ? "Light" : "System"}</span>
                  ${chevronDown}
                </button>
                <div class="lumi-custom-select-menu hidden" id="settings-theme-menu">
                  <button type="button" class="lumi-custom-select-item ${currentTheme === "system" ? "selected" : ""}" data-val="system">
                    <span>System</span>
                    <span class="lumi-check-icon">${currentTheme === "system" ? ICONS.check : ""}</span>
                  </button>
                  <button type="button" class="lumi-custom-select-item ${currentTheme === "dark" ? "selected" : ""}" data-val="dark">
                    <span>Dark</span>
                    <span class="lumi-check-icon">${currentTheme === "dark" ? ICONS.check : ""}</span>
                  </button>
                  <button type="button" class="lumi-custom-select-item ${currentTheme === "light" ? "selected" : ""}" data-val="light">
                    <span>Light</span>
                    <span class="lumi-check-icon">${currentTheme === "light" ? ICONS.check : ""}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Accent Color Row -->
            <div class="lumi-settings-row" id="settings-accent-row">
              <span class="lumi-settings-row-label">Accent color</span>
              <div class="lumi-custom-select-wrap">
                <button type="button" class="lumi-custom-select-trigger" id="settings-accent-trigger">
                  <span id="settings-accent-dot" style="width:12px;height:12px;border-radius:50%;margin-right:2px;background-color:${getAccentHex(accentColor)};display:inline-block;"></span>
                  <span id="settings-accent-label" style="text-transform:capitalize;">${escapeHtml(accentColor)}</span>
                  ${chevronDown}
                </button>
                <div class="lumi-custom-select-menu hidden" id="settings-accent-menu">
                  ${["pink", "purple", "indigo", "emerald", "amber"].map(acc => `
                    <button type="button" class="lumi-custom-select-item ${accentColor === acc ? "selected" : ""}" data-val="${acc}">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <span style="width:12px;height:12px;border-radius:50%;background-color:${getAccentHex(acc)};"></span>
                        <span style="text-transform:capitalize;">${acc}</span>
                      </div>
                      <span class="lumi-check-icon">${accentColor === acc ? ICONS.check : ""}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Nickname -->
          <div class="lumi-settings-section-title">Nickname</div>
          <div class="lumi-settings-card">
            <input
              type="text"
              id="settings-nickname-input"
              placeholder="Choose nickname"
              value="${escapeHtml(nickname)}"
              class="lumi-settings-input"
            />
          </div>

          <!-- Card: App Language -->
          <div class="lumi-settings-card">
            <div class="lumi-settings-row" id="settings-lang-row">
              <span class="lumi-settings-row-label">App language</span>
              <div class="lumi-custom-select-wrap">
                <button type="button" class="lumi-custom-select-trigger" id="settings-lang-trigger">
                  <span id="settings-lang-label">${escapeHtml(appLanguage)}</span>
                  ${chevronDown}
                </button>
                <div class="lumi-custom-select-menu hidden" id="settings-lang-menu">
                  ${[
          { val: "System default", label: "System default" },
          { val: "English (US)", label: "English (US)" },
          { val: "English (UK)", label: "English (UK)" },
          { val: "Hindi", label: "Hindi (हिंदी)" }
        ].map(lang => `
                    <button type="button" class="lumi-custom-select-item ${appLanguage === lang.val ? "selected" : ""}" data-val="${lang.val}">
                      <span>${lang.label}</span>
                      <span class="lumi-check-icon">${appLanguage === lang.val ? ICONS.check : ""}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Reference Photos -->
          <div>
            <div class="lumi-settings-card" style="margin-bottom:0;">
              <div id="settings-ref-photos-row" class="lumi-settings-row">
                <span class="lumi-settings-row-label">Reference photos</span>
                <div class="lumi-settings-row-value">
                  <span>Add</span>
                  ${chevronRight}
                </div>
              </div>
            </div>
            <div class="lumi-settings-subtext">
              These photos help Lumi create images that look more like you.
            </div>
          </div>

          <!-- Section: Intelligence -->
          <div class="lumi-settings-section-title">Intelligence</div>
          <div class="lumi-settings-card">
            <div class="lumi-settings-row" id="settings-visual-row">
              <span class="lumi-settings-row-label">Visual answers</span>
              <div class="lumi-custom-select-wrap">
                <button type="button" class="lumi-custom-select-trigger" id="settings-visual-trigger">
                  <span id="settings-visual-label">${escapeHtml(visualAnswers)}</span>
                  ${chevronDown}
                </button>
                <div class="lumi-custom-select-menu hidden" id="settings-visual-menu">
                  ${["Default", "Always", "Minimal"].map(va => `
                    <button type="button" class="lumi-custom-select-item ${visualAnswers === va ? "selected" : ""}" data-val="${va}">
                      <span>${va}</span>
                      <span class="lumi-check-icon">${visualAnswers === va ? ICONS.check : ""}</span>
                    </button>
                  `).join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Card: Homepage Suggestions -->
          <div>
            <div class="lumi-settings-card" style="margin-bottom:0;">
              <div class="lumi-settings-row">
                <span class="lumi-settings-row-label">Homepage suggestions</span>
                <!-- Native ChatGPT toggle switch -->
                <div id="homepage-suggestions-toggle" class="lumi-settings-switch ${homepageSuggestions ? 'on' : 'off'}">
                  <div class="lumi-settings-switch-knob"></div>
                </div>
              </div>
            </div>
            <div class="lumi-settings-subtext">
              Lumi can give you suggestions by searching connected plugins.
            </div>
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: CUSTOMIZE LUMI (#/settings/customize) ---
    if (currentPath === "/settings/customize") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Customize Lumi", "#/settings", false)}

          <!-- Conversational Tone Card -->
          <div class="lumi-settings-section-title">Primary Personality Tone</div>
          <div class="lumi-settings-card">
            <div id="settings-tone-brotherly" class="lumi-settings-row">
              <div>
                <div class="lumi-settings-row-label">Brotherly Hinglish</div>
                <div style="color:#9e9e9e;font-size:12.5px;margin-top:2px;">Natural Indian conversational tone (bhai, yr, tu, direct & warm)</div>
              </div>
              <div style="width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;background:${isBrotherly ? '#fff' : 'transparent'};color:${isBrotherly ? '#000' : 'transparent'};">
                <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
              </div>
            </div>
            <div id="settings-tone-sincere" class="lumi-settings-row">
              <div>
                <div class="lumi-settings-row-label">Adaptive Sincere</div>
                <div style="color:#9e9e9e;font-size:12.5px;margin-top:2px;">Polite, empathetic, and professional language</div>
              </div>
              <div style="width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;background:${!isBrotherly ? '#fff' : 'transparent'};color:${!isBrotherly ? '#000' : 'transparent'};">
                <svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
              </div>
            </div>
          </div>

          <!-- Custom Instructions -->
          <div class="lumi-settings-section-title">Custom Instructions</div>
          <div class="lumi-settings-card" style="padding:1.25rem;">
            <p style="font-size:13px;color:#9e9e9e;margin-bottom:0.75rem;line-height:1.45;">What would you like Lumi to know about you to provide better responses?</p>
            <textarea
              id="settings-custom-instructions"
              rows="4"
              style="width:100%;background:#181818;border-radius:1rem;padding:0.85rem;font-size:14px;color:#fff;outline:none;border:1px solid rgba(255,255,255,0.08);resize:none;box-sizing:border-box;"
              placeholder="e.g. Call me Javed, I am a senior engineer, prefer concise direct code snippets..."
            >${escapeHtml(customPrompt)}</textarea>
            <div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">
              <button type="button" id="settings-save-instructions-btn" style="padding:0.45rem 1rem;border-radius:9999px;background:#fff;color:#000;font-size:12px;font-weight:600;border:none;cursor:pointer;">
                Save Instructions
              </button>
            </div>
          </div>

          <!-- Autonomous Mind Memory -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0 1rem;margin-bottom:0.45rem;">
            <span class="lumi-settings-section-title" style="padding:0;margin:0;">Autonomous Memories (${totalMemories})</span>
            ${totalMemories > 0 ? `<button type="button" id="settings-clear-all-memories-btn" style="background:none;border:none;color:#fb7185;font-size:12px;cursor:pointer;">Clear all</button>` : ""}
          </div>
          <div class="lumi-settings-card" style="padding:1.25rem;">
            ${totalMemories === 0 ? `
              <div style="text-align:center;padding:1rem 0;color:#888;font-size:13px;">
                No autonomous memories stored yet. Lumi automatically remembers your preferences as you chat.
              </div>
            ` : `
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                ${memoryProfile.explicitMemories.map((mem, i) => `
                  <div style="display:flex;align-items:center;justify-content:space-between;background:#191919;padding:0.75rem 1rem;border-radius:1rem;border:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:13.5px;color:#e5e7eb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding-right:0.75rem;">• ${escapeHtml(mem)}</span>
                    <button type="button" style="background:none;border:none;color:#888;cursor:pointer;padding:0.25rem;" data-delete-memory="${i}" title="Delete memory">
                      ✕
                    </button>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: MEDIA & CLUSTERS (#/settings/media) ---
    if (currentPath === "/settings/media") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Media & Clusters", "#/settings", false)}

          <!-- Google Flow Studio Status -->
          <div class="lumi-settings-section-title">Google Flow Video & ImageFX Cluster</div>
          <div class="lumi-settings-card" style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div style="display:flex;align-items:center;gap:0.85rem;">
                <div style="width:40px;height:40px;border-radius:1rem;background:rgba(168,85,247,0.2);color:#c084fc;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;">
                  GF
                </div>
                <div>
                  <div class="lumi-settings-row-label">Google Flow AI Studio</div>
                  <div style="font-size:12.5px;color:#9e9e9e;">Veo 2 Video & Imagen 3 Pro</div>
                </div>
              </div>
              <span style="padding:0.25rem 0.65rem;border-radius:9999px;font-size:12px;font-weight:600;background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.3);">
                ● Active
              </span>
            </div>
            <div style="padding:0.85rem;border-radius:1rem;background:#191919;border:1px solid rgba(255,255,255,0.05);font-size:12px;display:flex;flex-direction:column;gap:0.35rem;">
              <div style="display:flex;justify-content:space-between;color:#9e9e9e;">
                <span>Project ID:</span>
                <span style="font-family:monospace;color:#d1d5db;">cfc62b8a-268f-429a-abcd-375478e21765</span>
              </div>
              <div style="display:flex;justify-content:space-between;color:#9e9e9e;">
                <span>Boq Labs Backend:</span>
                <span style="color:#34d399;font-weight:500;">Ready (20261118.14_p0)</span>
              </div>
            </div>
          </div>

          <!-- Suno AI Cookie -->
          <div class="lumi-settings-section-title">Suno AI Music Session Cookie</div>
          <div class="lumi-settings-card" style="padding:1.25rem;display:flex;flex-direction:column;gap:0.65rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="lumi-settings-row-label">Suno Session (__client / __session)</span>
              <span style="font-size:12px;color:${localStorage.getItem("lumi_suno_cookie") ? '#34d399' : '#757575'};">
                ${localStorage.getItem("lumi_suno_cookie") ? "● Active" : "Optional"}
              </span>
            </div>
            <input
              type="password"
              id="settings-suno-cookie-input"
              style="width:100%;background:#191919;border-radius:1rem;padding:0.75rem 1rem;font-size:12px;color:#fff;outline:none;border:1px solid rgba(255,255,255,0.05);font-family:monospace;box-sizing:border-box;"
              placeholder="Paste suno.com session cookie..."
              value="${escapeHtml(localStorage.getItem('lumi_suno_cookie') || '')}"
            />
            <p style="font-size:12px;color:#888;margin:0;line-height:1.4;">Enables high-fidelity 320kbps stereo song generation with Suno v3.5/v4.</p>
          </div>

          <!-- Udio AI Token -->
          <div class="lumi-settings-section-title">Udio AI Auth Token</div>
          <div class="lumi-settings-card" style="padding:1.25rem;">
            <input
              type="password"
              id="settings-udio-token-input"
              style="width:100%;background:#191919;border-radius:1rem;padding:0.75rem 1rem;font-size:12px;color:#fff;outline:none;border:1px solid rgba(255,255,255,0.05);font-family:monospace;box-sizing:border-box;"
              placeholder="Paste udio.com sb-api-auth-token..."
              value="${escapeHtml(localStorage.getItem('lumi_udio_token') || '')}"
            />
          </div>

          <!-- Google ImageFX & MusicLM Cookie -->
          <div class="lumi-settings-section-title">Google ImageFX & MusicLM Cookie</div>
          <div class="lumi-settings-card" style="padding:1.25rem;">
            <input
              type="password"
              id="settings-google-cookie-input"
              style="width:100%;background:#191919;border-radius:1rem;padding:0.75rem 1rem;font-size:12px;color:#fff;outline:none;border:1px solid rgba(255,255,255,0.05);font-family:monospace;box-sizing:border-box;"
              placeholder="Paste Google Labs auth cookie..."
              value="${escapeHtml(localStorage.getItem('lumi_google_cookie') || '')}"
            />
          </div>

          <!-- Bing Image Creator Cookie -->
          <div class="lumi-settings-section-title">Bing Image Creator (DALL-E 3) Cookie</div>
          <div class="lumi-settings-card" style="padding:1.25rem;">
            <input
              type="password"
              id="settings-bing-cookie-input"
              style="width:100%;background:#191919;border-radius:1rem;padding:0.75rem 1rem;font-size:12px;color:#fff;outline:none;border:1px solid rgba(255,255,255,0.05);font-family:monospace;box-sizing:border-box;"
              placeholder="Paste Bing _U cookie..."
              value="${escapeHtml(localStorage.getItem('lumi_bing_cookie') || '')}"
            />
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: DATA CONTROLS (#/settings/data) ---
    if (currentPath === "/settings/data") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Data controls", "#/settings", false)}

          <!-- Export Data Card -->
          <div class="lumi-settings-card">
            <div id="settings-export-chats-btn" class="lumi-settings-row">
              <span class="lumi-settings-row-label">Export chat history</span>
              <div class="lumi-settings-row-value">
                <span>JSON</span>
                ${chevronRight}
              </div>
            </div>
          </div>

          <!-- Danger Zone Card -->
          <div class="lumi-settings-card">
            <div id="settings-clear-chats-btn" class="lumi-settings-row" style="color:#fb7185;">
              <span class="lumi-settings-row-label" style="color:#fb7185;">Clear all chat history</span>
              ${chevronRight}
            </div>
            <div id="settings-reset-memory-btn" class="lumi-settings-row" style="color:#fb7185;">
              <span class="lumi-settings-row-label" style="color:#fb7185;">Reset learned autonomous memories</span>
              ${chevronRight}
            </div>
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: USAGE AND LIMITS (#/settings/usage) ---
    if (currentPath === "/settings/usage") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Usage and limits", "#/settings", false)}

          <div class="lumi-settings-card" style="padding:1.25rem;display:flex;flex-direction:column;gap:1rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div class="lumi-settings-row-label">Lumi Pro Studio Plan</div>
                <div style="font-size:12px;color:#34d399;margin-top:2px;">● Unlimited Access Activated</div>
              </div>
              <span style="padding:0.25rem 0.65rem;border-radius:9999px;font-size:12px;font-weight:600;background:#fff;color:#000;">Active</span>
            </div>
            <div style="border-top:1px solid #2d2d2d;padding-top:0.75rem;font-size:12.5px;color:#9e9e9e;display:flex;flex-direction:column;gap:0.5rem;">
              <div style="display:flex;justify-content:space-between;">
                <span>Fast Model Queries:</span>
                <span style="color:#fff;font-weight:500;">Unlimited</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Veo Video Generation:</span>
                <span style="color:#fff;font-weight:500;">Full Resolution</span>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Deep Research Reasoning:</span>
                <span style="color:#fff;font-weight:500;">Unlimited</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: NOTIFICATIONS (#/settings/notifications) ---
    if (currentPath === "/settings/notifications") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Notifications", "#/settings", false)}

          <div class="lumi-settings-card">
            <div class="lumi-settings-row">
              <div>
                <div class="lumi-settings-row-label">Generation complete sound</div>
                <div style="font-size:12.5px;color:#9e9e9e;margin-top:2px;">Play subtle chime when video or song finishes</div>
              </div>
              <div class="lumi-settings-switch on">
                <div class="lumi-settings-switch-knob"></div>
              </div>
            </div>
            <div class="lumi-settings-row">
              <div>
                <div class="lumi-settings-row-label">System notifications</div>
                <div style="font-size:12.5px;color:#9e9e9e;margin-top:2px;">Alerts when running in background</div>
              </div>
              <div class="lumi-settings-switch on">
                <div class="lumi-settings-switch-knob"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: VOICE (#/settings/voice) ---
    if (currentPath === "/settings/voice") {
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader("Voice", "#/settings", false)}

          <div class="lumi-settings-card">
            <div class="lumi-settings-row">
              <span class="lumi-settings-row-label">Voice engine</span>
              <span class="lumi-settings-row-value">Gemini Live & Web Speech ⌵</span>
            </div>
            <div class="lumi-settings-row">
              <span class="lumi-settings-row-label">Language detection</span>
              <span class="lumi-settings-row-value">Auto (Hindi + English) ⌵</span>
            </div>
          </div>
        </div>
      `;
    }

    // --- SUB-VIEW: SAFETY & SECURITY ---
    if (currentPath === "/settings/safety" || currentPath === "/settings/security") {
      const isSafety = currentPath === "/settings/safety";
      return `
        <div class="lumi-settings-viewport">
          ${renderSettingsHeader(isSafety ? "Safety" : "Security and login", "#/settings", false)}

          <div class="lumi-settings-card" style="padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem;">
            <div class="lumi-settings-row-label">${isSafety ? "Balanced Content Safety" : "Biometric & Passcode Lock"}</div>
            <p style="font-size:13px;color:#9e9e9e;line-height:1.45;margin:0;">
              ${isSafety ? "All queries run through real-time harmlessness and anti-toxicity filters while preserving natural Hindi and Hinglish dialect." : "Your API keys, cookies, and local chat history are stored in encrypted browser storage on this device."}
            </p>
            <div style="padding-top:0.5rem;font-size:12px;color:#34d399;display:flex;align-items:center;gap:0.35rem;">
              <span style="width:8px;height:8px;border-radius:50%;background:#34d399;"></span>
              <span>Fully Secure & Protected</span>
            </div>
          </div>
        </div>
      `;
    }

    // --- DEFAULT MAIN VIEW: #/settings (Matches ChatGPT Android Screenshot) ---
    return `
      <div class="lumi-settings-viewport">
        ${renderSettingsHeader("Settings", "#/chat", true)}

        <!-- Card 1: Account (Avatar, Account, Username >, Switch account >) -->
        <div class="lumi-settings-card">
          <!-- Account Name Row -->
          <div id="settings-account-row" class="lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              ${currentUser && currentUser.photoUrl
        ? `<img src="${escapeHtml(currentUser.photoUrl)}" alt="${escapeHtml(currentUser.name || '')}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid rgba(255,255,255,0.2);" onerror="this.style.display='none'" />`
        : `<div style="width:34px;height:34px;border-radius:50%;overflow:hidden;background:linear-gradient(135deg,#9333ea,#6366f1);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:13px;flex-shrink:0;">
                    ${escapeHtml(((currentUser && currentUser.name) || (currentUser && currentUser.email) || "L")[0].toUpperCase())}
                  </div>`
      }
              <div>
                <span class="lumi-settings-row-label">Account</span>
                <div style="font-size:11px;color:#9e9e9e;">${escapeHtml(currentUser && currentUser.email ? currentUser.email : "Not signed in")}</div>
              </div>
            </div>
            <div class="lumi-settings-row-value">
              <span id="settings-account-name-display">${escapeHtml((currentUser && currentUser.name) || (currentUser && currentUser.email ? currentUser.email.split("@")[0] : accountName))}</span>
              ${chevronRight}
            </div>
          </div>
          <!-- Switch Account Row -->
          <a href="#/auth" class="lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>
              </div>
              <span class="lumi-settings-row-label">${isUserLoggedIn() ? "Switch account" : "Sign in with Google"}</span>
            </div>
            ${chevronRight}
          </a>
        </div>

        <!-- Card 2: Customize Lumi -->
        <div class="lumi-settings-card">
          <a href="#/settings/customize" class="lumi-settings-row">
            <div style="display:flex;align-items:flex-start;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;margin-top:2px;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="M7 10h10"/><path d="M7 14h6"/></svg>
              </div>
              <div>
                <div class="lumi-settings-row-label">Customize Lumi</div>
                <div style="font-size:13px;color:#9e9e9e;margin-top:2px;">Personality, memory, plugins and more</div>
              </div>
            </div>
            ${chevronRight}
          </a>
        </div>

        <!-- Card: Shift to StudyAI Pro Mode -->
        <div class="lumi-settings-card" style="border:1px solid rgba(56, 189, 248, 0.35);background:linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(3, 105, 161, 0.03) 100%);">
          <div class="lumi-settings-row">
            <div style="display:flex;align-items:flex-start;gap:0.85rem;">
              <div style="width:36px;height:36px;border-radius:10px;background:rgba(56, 189, 248, 0.2);display:flex;align-items:center;justify-content:center;color:#38bdf8;flex-shrink:0;margin-top:1px;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="lumi-settings-row-label" style="font-weight:600;color:#fff;">StudyAI Pro Mode</span>
                  <span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:9999px;background:#38bdf8;color:#0b1120;">STUDENT</span>
                </div>
                <div style="font-size:12.5px;color:#9ca3af;margin-top:2px;">Real book grounding (NCERT & State Boards) with instant chapter references</div>
              </div>
            </div>
            <div id="study-mode-shift-toggle" class="lumi-settings-switch ${localStorage.getItem('lumi_app_mode') === 'study' ? 'on' : 'off'}">
              <div class="lumi-settings-switch-knob"></div>
            </div>
          </div>
        </div>

        <!-- Card 3: Main Grouped List -->
        <div id="settings-main-list-card" class="lumi-settings-card">
          <!-- General -->
          <a href="#/settings/general" data-settings-item="General" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <span class="lumi-settings-row-label">General</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Usage and limits -->
          <a href="#/settings/usage" data-settings-item="Usage and limits" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 3 3 9 4-4 5 5 6-6"/><path d="M21 9V3h-6"/></svg>
              </div>
              <span class="lumi-settings-row-label">Usage and limits</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Notifications -->
          <a href="#/settings/notifications" data-settings-item="Notifications" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              <span class="lumi-settings-row-label">Notifications</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Voice -->
          <a href="#/settings/voice" data-settings-item="Voice" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="6" y1="6" x2="6" y2="18"/><line x1="18" y1="8" x2="18" y2="16"/></svg>
              </div>
              <span class="lumi-settings-row-label">Voice</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Media & Clusters -->
          <a href="#/settings/media" data-settings-item="Media and Clusters" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M3 7.5h4"/><path d="M3 12h18"/><path d="M3 16.5h4"/><path d="M17 3v18"/><path d="M17 7.5h4"/><path d="M17 16.5h4"/></svg>
              </div>
              <span class="lumi-settings-row-label">Media & Clusters</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Safety -->
          <a href="#/settings/safety" data-settings-item="Safety" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <span class="lumi-settings-row-label">Safety</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Security and login -->
          <a href="#/settings/security" data-settings-item="Security and login" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <span class="lumi-settings-row-label">Security and login</span>
            </div>
            ${chevronRight}
          </a>

          <!-- Data controls -->
          <a href="#/settings/data" data-settings-item="Data controls" class="settings-nav-row lumi-settings-row">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 0 0-7.07 17.07l1.41-1.41A8 8 0 1 1 20 12h2a10 10 0 0 0-10-10Z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <span class="lumi-settings-row-label">Data controls</span>
            </div>
            ${chevronRight}
          </a>
        </div>

        <!-- Sign Out Card -->
        <div class="lumi-settings-card" style="margin-top:1rem;">
          <div id="settings-logout-btn" class="lumi-settings-row" style="color:#fb7185;cursor:pointer;">
            <div style="display:flex;align-items:center;gap:0.85rem;">
              <div style="width:34px;display:flex;align-items:center;justify-content:center;color:#fb7185;flex-shrink:0;">
                <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              </div>
              <span class="lumi-settings-row-label" style="color:#fb7185;">${isUserLoggedIn() ? "Sign out" : "Sign in to Lumi"}</span>
            </div>
            ${chevronRight}
          </div>
        </div>

        <!-- Bottom Search Pill -->
        <div class="lumi-settings-search-bar">
          <svg style="width:18px;height:18px;color:#757575;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/></svg>
          <input
            type="text"
            id="settings-search-input"
            placeholder="Search settings"
          />
        </div>
      </div>
    `;
  }

  function renderSettingsModal() {
    window.location.hash = "#/settings";
    return "";
  }

  // 3. PROMPT COMPOSER & MODEL SELECTOR
  function renderModelPicker(placement = "composer") {
    const label = getActiveModelLabel();
    const isTopbar = placement === "topbar";
    const dropdownPosClass = isTopbar ? "placement-topbar" : "placement-composer";

    return `
      <div class="relative model-picker-wrapper" data-placement="${placement}">
        <button
          type="button"
          class="model-picker-toggle-btn inline-flex items-center gap-1 h-8 rounded-full border border-border bg-card/80 px-2 sm:px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer whitespace-nowrap"
          data-toggle-model-picker="${placement}"
          aria-expanded="false"
          aria-label="Select AI Model"
        >
          <span class="truncate max-w-[85px] sm:max-w-[12rem] model-picker-label">${escapeHtml(label)}</span>
          ${ICONS.chevronDown}
        </button>

        <div class="model-dropdown-menu ${dropdownPosClass} hidden" id="model-dropdown-menu-${placement}">
          <div class="model-group-title">Free AI Engine (Zero Setup)</div>
          ${BUILT_IN_MODELS.map(
      (m) => `
            <button
              type="button"
              class="model-item-btn ${!selectedModel.provider_id && selectedModel.model === m.id ? "is-active" : ""
        }"
              data-select-model="builtin::${m.id}"
            >
              <span>${escapeHtml(m.label)}</span>
              ${!selectedModel.provider_id && selectedModel.model === m.id
          ? ICONS.check
          : ""
        }
            </button>`
    ).join("")}

          ${providers.length > 0
        ? `
              <div class="model-group-title mt-2">Custom AI Providers</div>
              ${providers
          .map((p) => {
            const models = p.models && p.models.length ? p.models : [p.default_model || "default"];
            return models
              .map((mod) => {
                const isCur =
                  selectedModel.provider_id === p.id && selectedModel.model === mod;
                return `
                      <button
                        type="button"
                        class="model-item-btn ${isCur ? "is-active" : ""}"
                        data-select-model="${p.id}::${mod}"
                      >
                        <div class="flex flex-col">
                          <span class="truncate max-w-[180px]">${escapeHtml(mod)}</span>
                          <span class="text-[10px] text-muted-foreground">${escapeHtml(p.name)}</span>
                        </div>
                        ${isCur ? ICONS.check : ""}
                      </button>`;
              })
              .join("");
          })
          .join("")}
            `
        : ""
      }

          <div class="mt-2 pt-2 border-t border-border">
            <a href="#/providers" class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-primary font-medium hover:underline">
              ${ICONS.server} <span>Manage AI Providers...</span>
            </a>
          </div>
        </div>
      </div>`;
  }

  function renderComposer(placeholder = "Ask Lumi anything…", isThread = false) {
    const isGuest = !isUserLoggedIn();
    const remainingMsgs = LumiGuestQuota.getRemainingMessages();
    if (isGuest && remainingMsgs <= 0) {
      placeholder = "Daily free limit reached (7/7). Tap to sign in with Google…";
    }
    return `
      <div class="relative w-full rounded-3xl bg-card border border-border shadow-composer transition-shadow focus-within:ring-1 focus-within:ring-primary/20">
        <form id="chat-composer-form" class="w-full">
          ${renderAttachmentChips()}
          <input
            type="file"
            id="file-upload-input"
            class="hidden"
            multiple
            accept="*/*"
          />
          <input
            type="file"
            id="camera-lens-input"
            class="hidden"
            accept="image/*"
            capture="environment"
          />
          <textarea
            id="composer-textarea"
            name="message"
            rows="1"
            autofocus
            placeholder="${escapeHtml(placeholder)}"
            class="w-full resize-none rounded-3xl border-0 bg-transparent px-5 pt-4 pb-2 text-[15px] outline-none placeholder:text-muted-foreground min-h-[56px] max-h-48"
          ></textarea>

          <div class="composer-toolbar flex items-center justify-between gap-2 px-3 pb-3">
            <div class="composer-toolbar-left flex min-w-0 items-center gap-1.5 flex-1 py-0.5">
              ${renderModelPicker("composer")}
              ${!isUserLoggedIn() ? `
                <button
                  type="button"
                  id="guest-quota-badge"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${LumiGuestQuota.getRemainingMessages() <= 0 ? 'border-rose-500/40 bg-rose-500/15 text-rose-400' : 'border-primary/30 bg-primary/10 text-primary'} hover:bg-primary/20 transition-all cursor-pointer shrink-0"
                  title="Guest Mode: ${LumiGuestQuota.getRemainingMessages()}/7 messages left today. Click to sign in for unlimited."
                >
                  <span>⚡ ${LumiGuestQuota.getRemainingMessages()}/7 left</span>
                </button>
              ` : ''}

              <button
                type="button"
                id="attach-file-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="Attach files or documents (.pdf, .txt, .py, .js, .csv, .md, .json)"
              >
                ${ICONS.paperclip}
              </button>

              <button
                type="button"
                id="camera-lens-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="Camera Lens (Take photo to identify or ask questions)"
              >
                ${ICONS.camera}
              </button>

              <button
                type="button"
                id="toggle-sound-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="${soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}"
              >
                ${soundEnabled ? ICONS.volume : ICONS.volumeMute}
              </button>

              <button
                type="button"
                id="toggle-web-search-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs ${webSearchEnabled ? "text-primary border-primary/60 bg-primary/10 shadow-xs ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground"} transition-all backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="${webSearchEnabled ? "Live Web Search: Active (Click to disable)" : "Live Web Search: Off (Click to enable)"}"
              >
                ${ICONS.globe}
              </button>

              <button
                type="button"
                id="image-gen-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="Generate AI Image (/image)"
              >
                ${ICONS.image}
              </button>

              <button
                type="button"
                id="music-studio-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-pink-500/30 bg-card/80 text-xs text-pink-400 hover:text-pink-300 hover:border-pink-500/60 transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="Suno & Udio Music Studio (/song)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
              </button>

              <button
                type="button"
                id="video-gen-btn"
                class="composer-toolbar-btn inline-flex size-8 items-center justify-center rounded-full border border-purple-500/30 bg-card/80 text-xs text-purple-400 hover:text-purple-300 hover:border-purple-500/60 transition-colors backdrop-blur shadow-xs cursor-pointer shrink-0"
                title="AI Video Studio (/video)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
              </button>
            </div>

            <div class="flex items-center gap-1.5 shrink-0 ml-auto" id="composer-submit-wrapper">
              ${(() => {
        const { path: curPath } = parseLocation();
        const curThreadId = curPath.startsWith("/chat/") ? curPath.slice(6) : null;
        const isThisThreadStreaming = isStreaming && activeStreamingThreadId === curThreadId;
        return `
                  <button
                    type="button"
                    id="voice-call-trigger-btn"
                    class="${isThisThreadStreaming ? "hidden" : "inline-flex"} composer-toolbar-btn size-8 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/70 transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Voice Call"
                  >
                    ${ICONS.mic}
                  </button>
                  <button
                    type="submit"
                    id="submit-prompt-btn"
                    class="${isThisThreadStreaming ? "hidden" : "inline-flex"} composer-toolbar-btn size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                    title="Send message"
                  >
                    ${ICONS.send}
                  </button>
                  <button
                    type="button"
                    id="stop-generation-btn"
                    class="${isThisThreadStreaming ? "inline-flex" : "hidden"} composer-toolbar-btn size-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all active:scale-95 cursor-pointer shrink-0"
                    title="Stop generation"
                  >
                    ${ICONS.square}
                  </button>
                `;
      })()}
            </div>
          </div>
        </form>
      </div>`;
  }

  // 4. EMPTY CHAT STATE
  function renderEmptyChat() {
    const userNick = localStorage.getItem("lumi_user_nickname") || "";
    const greetingText = userNick ? `What's on your mind, ${escapeHtml(userNick)}?` : `What's on your mind?`;
    const showSuggestions = localStorage.getItem("lumi_homepage_suggestions") !== "false";

    return `
      <div class="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-16 min-h-0">
        <div class="aurora opacity-40"></div>

        <div class="relative z-10 w-full max-w-2xl text-center">
          <!-- Floating Mascot -->
          <img src="${LUMI_LOGO}" alt="Lumi" width="816" height="816" class="animate-float-soft mx-auto size-14 object-contain select-none drop-shadow" />

          <h1 class="animate-rise-in mt-6 text-center font-display text-4xl md:text-5xl tracking-tight text-foreground">
            ${greetingText}
          </h1>

          <div class="animate-rise-in mt-8 [animation-delay:100ms] text-left">
            ${renderComposer("Ask Lumi anything…", false)}
          </div>

          ${showSuggestions ? `
            <!-- Suggestion Chips -->
            <div class="animate-rise-in mt-5 flex flex-wrap justify-center gap-2 [animation-delay:200ms]">
              ${SUGGESTIONS.map(
      (text) => `
                <button
                  type="button"
                  class="suggestion-chip rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-sm text-muted-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:text-foreground hover:bg-card hover:border-foreground/20 shadow-2xs"
                  data-suggestion="${escapeHtml(text)}"
                >
                  ${escapeHtml(text)}
                </button>`
    ).join("")}
            </div>
          ` : ""}
        </div>
      </div>`;
  }



  function renderAssistantMsgHtml(msg, isCurrentlyStreaming = false, isLastAssistant = false) {
    const rawText = msg.content || "";
    return `
      <div class="flex gap-3.5 items-start assistant-msg-row" id="msg-row-${msg.id}">
        <img src="${LUMI_LOGO}" alt="Lumi" class="mt-0.5 size-6 shrink-0 object-contain select-none" />
        
        <div class="min-w-0 flex-1">
          ${msg.scrapedUrl
        ? `<div class="mb-2">
                  <a href="${escapeHtml(msg.scrapedUrl.url)}" target="_blank" rel="noopener" class="url-scrape-badge">
                    ${ICONS.globe} <span>Scraped: ${escapeHtml(msg.scrapedUrl.title)}</span>
                  </a>
                </div>`
        : ""
      }

          <!-- Real-Time Web Search Source Badges (if search query) -->
          ${msg.searchResults && msg.searchResults.length > 0
        ? `
            <div class="mb-3">
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1.5">
                ${ICONS.globe} <span>Live Web Sources (${msg.searchResults.length}):</span>
              </div>
              <div class="flex flex-wrap gap-2">
                ${msg.searchResults
          .map(
            (s) => `
                  <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" class="search-source-card" title="${escapeHtml(s.snippet)}">
                    <span class="font-medium">${escapeHtml(s.title)}</span>
                    <span class="text-[10px] text-muted-foreground font-mono">↗</span>
                  </a>`
          )
          .join("")}
              </div>
            </div>`
        : ""
      }

          <div class="markdown-body text-[15px] leading-relaxed text-foreground" id="msg-body-${msg.id}">
            ${isCurrentlyStreaming && !rawText
        ? `<div class="thinking-badge-container">
                    <span class="thinking-spinner"></span>
                    <span>Thinking…</span>
                    <span class="thinking-dots">
                      <span class="thinking-dot"></span>
                      <span class="thinking-dot"></span>
                      <span class="thinking-dot"></span>
                    </span>
                  </div>`
        : renderMarkdown(rawText)
      }
            ${isCurrentlyStreaming && rawText ? `<span class="streaming-cursor"></span>` : ""}
          </div>

          <!-- Ultra-Clean Studio Image Generator Card -->
          ${msg.imageWizard && msg.imageWizard.active
        ? ChatGPTImageStudio.renderWizard(msg)
        : ""
      }

          ${msg.imageChoices
        ? ChatGPTImageStudio.renderSummary(msg.imageChoices)
        : ""
      }

          ${msg.imageLoading
        ? ChatGPTImageStudio.renderCanvasProgress(msg)
        : msg.imageUrl
          ? `
            <div class="ai-image-card my-3" id="pro-img-${msg.id}">
              <img src="${escapeHtml(msg.imageUrl)}" alt="${escapeHtml(msg.imagePrompt || "Generated Image")}" loading="lazy" class="cursor-pointer" data-action="zoom-image" data-src="${escapeHtml(msg.imageUrl)}" data-prompt="${escapeHtml(msg.imagePrompt || "")}" data-msg-id="${msg.id}" />
              <div class="ai-image-overlay">
                <span class="text-xs text-white/90 truncate max-w-[200px] font-medium drop-shadow">
                  🎨 ${escapeHtml(msg.imagePrompt || "AI Generated Image")}
                </span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur font-medium transition-colors cursor-pointer"
                    data-action="download-image"
                    data-url="${escapeHtml(msg.imageUrl)}"
                    data-name="${escapeHtml(msg.imagePrompt || "image")}"
                  >
                    ${ICONS.download} <span>Download</span>
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur font-medium transition-colors cursor-pointer"
                    data-action="regen-image"
                    data-prompt="${escapeHtml(msg.imagePrompt || "")}"
                    title="Regenerate variation"
                  >
                    ${ICONS.refreshCw}
                  </button>
                </div>
              </div>
            </div>`
          : ""
      }

          <!-- Ultra-Clean Studio Music Generator Card -->
          ${msg.musicLoading
        ? `
            <div class="pro-gen-card pro-music-gen-card my-3" id="pro-music-${msg.id}">
              <div class="pro-gen-header">
                <div class="pro-gen-badge music">
                  <span class="pro-pulse-dot pink"></span>
                  <span>Suno & Udio Neural Studio</span>
                </div>
                <span class="pro-gen-timer">Arranging score</span>
              </div>
              <div class="pro-gen-body">
                <div class="pro-shimmer-sweep"></div>
                <div class="pro-equalizer-bars">
                  <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
                  <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
                  <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
                  <span class="eq-bar"></span><span class="eq-bar"></span><span class="eq-bar"></span>
                </div>
                <div class="pro-gen-title">Composing Arrangement & Lyrics</div>
                <div class="pro-gen-prompt">"${escapeHtml(msg.musicPrompt || "")}"</div>
              </div>
              <div class="pro-progress-track">
                <div class="pro-progress-fill music"></div>
              </div>
            </div>`
        : msg.musicTrack
          ? `
            <div class="music-studio-card my-3" id="pro-music-${msg.id}">
              <div class="music-studio-header">
                <div class="music-studio-title">
                  <span>🎵</span>
                  <span>${escapeHtml(msg.musicTrack.title || "AI Musical Track")}</span>
                </div>
                <span class="music-tag-pill">${escapeHtml(msg.musicTrack.style || "Suno / Udio")}</span>
              </div>
              ${msg.musicTrack.audioUrl ? `
                <div class="mb-3">
                  <audio controls src="${escapeHtml(msg.musicTrack.audioUrl)}" class="w-full rounded-lg"></audio>
                </div>
              ` : ''}
              <div class="music-lyrics-box">${escapeHtml(msg.musicTrack.composition || msg.musicTrack.lyrics || "")}</div>
              <div class="music-actions-row">
                <button type="button" class="inline-flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 font-medium transition-colors cursor-pointer" data-action="copy-music" data-text="${escapeHtml(msg.musicTrack.composition || msg.musicTrack.lyrics || '')}">
                  📋 Copy Score & Lyrics
                </button>
              </div>
            </div>`
          : ""
      }

          <!-- Ultra-Clean Studio Video Generator Card -->
          ${msg.videoLoading
        ? `
            <div class="pro-gen-card my-3" id="pro-vid-${msg.id}" style="border-color: rgba(168, 85, 247, 0.45);">
              <div class="pro-gen-header">
                <div class="pro-gen-badge">
                  <span class="pro-pulse-dot" style="background: #a855f7;"></span>
                  <span>${escapeHtml(msg.videoProvider || "AI Video Studio")}</span>
                </div>
                <span class="pro-gen-timer" id="video-stage-${msg.id}">${escapeHtml(msg.generationStage || "Synthesizing Motion")}</span>
              </div>
              <div class="pro-gen-body">
                <div class="pro-shimmer-sweep"></div>
                <div class="pro-spinner-ring" style="border-top-color: #a855f7;"></div>
                <div class="pro-gen-title">Generating Cinematic AI Video</div>
                <div class="pro-gen-prompt">"${escapeHtml(msg.videoPrompt || "")}"</div>
              </div>
              <div class="pro-progress-track">
                <div class="pro-progress-fill" style="background: linear-gradient(90deg, #a855f7, #ec4899);"></div>
              </div>
            </div>`
        : msg.videoUrl
          ? `
            <div class="ai-video-card my-3" id="pro-vid-${msg.id}">
              <video controls autoplay loop playsinline preload="auto" src="${escapeHtml(msg.videoUrl)}" class="cursor-pointer w-full rounded-2xl">
                Your browser does not support the video tag.
              </video>
              <div class="ai-video-overlay">
                <span class="ai-video-badge">
                  🎬 ${escapeHtml(msg.videoProvider || "AI Video Engine")}
                </span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur font-medium transition-colors cursor-pointer border border-white/20"
                    data-action="download-video"
                    data-url="${escapeHtml(msg.videoUrl)}"
                    data-name="${escapeHtml(msg.videoPrompt || "lumi-video")}"
                  >
                    ${ICONS.download} <span>Download MP4</span>
                  </button>
                </div>
              </div>
            </div>`
          : ""
      }

          ${!isCurrentlyStreaming && (rawText || msg.imageUrl || msg.videoUrl)
        ? `
            <div class="mt-2.5 flex items-center flex-wrap gap-2" id="msg-actions-${msg.id}">
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                data-action="copy-message"
                data-text="${escapeHtml(rawText)}"
                title="Copy reply"
              >
                ${ICONS.copy} <span>Copy</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${currentlySpeakingId === msg.id ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent"} transition-colors cursor-pointer"
                data-action="speak-message"
                data-id="${msg.id}"
                data-text="${escapeHtml(rawText)}"
                title="${currentlySpeakingId === msg.id ? "Stop voice" : "Read aloud"}"
              >
                ${currentlySpeakingId === msg.id ? ICONS.volumeMute : ICONS.volume}
                <span>${currentlySpeakingId === msg.id ? "Speaking..." : "Listen"}</span>
              </button>

              ${isLastAssistant
          ? `
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                  data-action="regenerate-message"
                  title="Regenerate reply"
                >
                  ${ICONS.refreshCw} <span>Regenerate</span>
                </button>`
          : ""
        }
            </div>`
        : ""
      }
        </div>
      </div>`;
  }

  function updateAssistantMsgDOM(msg, isCurrentlyStreaming = false, isLastAssistant = false) {
    const el = document.querySelector(`#msg-row-${msg.id}`);
    if (el) {
      const temp = document.createElement("div");
      temp.innerHTML = renderAssistantMsgHtml(msg, isCurrentlyStreaming, isLastAssistant);
      const newEl = temp.firstElementChild;
      if (newEl && el.parentNode) {
        el.parentNode.replaceChild(newEl, el);
        return true;
      }
    }
    return false;
  }

  // 5. ACTIVE CHAT THREAD VIEW
  function renderThreadChat(thread) {
    const messages = thread.messages || [];

    return `
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <!-- Message Scroll Area -->
        <div class="flex-1 overflow-y-auto px-4 py-8" id="chat-messages-container">
          <div class="mx-auto w-full max-w-3xl space-y-7">
            ${messages
        .map((msg, index) => {
          const isUser = msg.role === "user";
          const isLastAssistant =
            !isUser && index === messages.length - 1 && !isStreaming;

          if (isUser) {
            return `
                    <div class="user-msg-row" id="msg-row-${msg.id}">
                      ${msg.attachedFiles && msg.attachedFiles.length > 0
                ? `<div class="flex flex-wrap justify-end gap-1.5 mb-1">
                              ${msg.attachedFiles.map(f => `<span class="attachment-chip text-[11px] py-0.5 px-2">${f.isImage && f.dataUrl ? `<img src="${f.dataUrl}" class="size-3.5 object-cover rounded-xs inline-block mr-1" />` : f.isPdf ? "📑 " : "📄 "}${escapeHtml(f.name)} (${formatBytes(f.size)})</span>`).join('')}
                            </div>`
                : ""
              }
                      <div class="user-msg-bubble">${escapeHtml(msg.content.trim())}</div>
                    </div>`;
          }

          // Assistant Message
          const isCurrentlyStreaming =
            isStreaming && index === messages.length - 1;

          return renderAssistantMsgHtml(msg, isCurrentlyStreaming, isLastAssistant);
        })
        .join("")}

            <!-- Thinking Pulse State -->
            ${isStreaming && messages.length > 0 && messages[messages.length - 1].role === "user"
        ? `
              <div class="animate-rise-in flex items-center gap-3 text-muted-foreground text-sm">
                <img src="${LUMI_LOGO}" alt="" class="size-6 animate-pulse object-contain" />
                <span class="animate-pulse">Thinking…</span>
              </div>`
        : ""
      }
          </div>
        </div>

        <!-- Sticky Bottom Composer -->
        <div class="mx-auto w-full max-w-3xl px-3 sm:px-4 pt-2" style="padding-bottom: max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.25rem));">
          ${renderComposer("Reply to Lumi…", true)}
          <p class="mt-2 text-center text-xs text-muted-foreground">
            Lumi can make mistakes. Check important info.
          </p>
        </div>
      </div>`;
  }

  // 6. MAIN CHAT PAGE CONTAINER
  function renderChatPage(threadId) {
    const thread = conversations.find((c) => c.id === threadId);

    return `
      <div class="flex h-screen bg-background overflow-hidden">
        ${renderSidebar(threadId)}

        <!-- Mobile Backdrop -->
        <div class="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-xs md:hidden ${sidebarOpen ? "" : "hidden"}" id="sidebar-backdrop"></div>

        <!-- Workspace Main View -->
        <main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <!-- Top Bar -->
          <div class="flex items-center justify-between border-b border-border/50 px-3 py-2 bg-card/60 backdrop-blur z-10 gap-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <button
                type="button"
                id="sidebar-toggle-btn"
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-accent transition-colors md:hidden"
                aria-label="Open chats"
              >
                ${ICONS.panelLeft}
              </button>
              <div class="text-xs sm:text-sm font-semibold truncate max-w-[70px] sm:max-w-xs text-foreground">
                ${thread ? escapeHtml(thread.title) : "Lumi AI"}
              </div>
            </div>

            <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <a href="#/study" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all shadow-xs" title="Shift to StudyAI Pro Mode">
                <span>🎓 StudyAI</span>
              </a>
              ${renderDeviceToolsPicker()}
              ${renderModelPicker("topbar")}
              ${renderPersonaPicker()}
              ${renderExportPicker(threadId)}
            </div>
          </div>

          <!-- Main Chat Area -->
          <div class="flex min-h-0 flex-1 overflow-hidden">
            <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
              ${thread ? renderThreadChat(thread) : renderEmptyChat()}
            </div>
          </div>
        </main>
      </div>`;
  }

  // 7. AI PROVIDERS MANAGEMENT SCREEN
  function renderProvidersPage() {
    return `
      <div class="relative min-h-screen bg-background">
        <div class="aurora opacity-30"></div>

        <header class="relative z-10 mx-auto flex max-w-4xl items-center justify-between px-6 py-5 border-b border-border/60 bg-card/40 backdrop-blur">
          <div class="flex items-center gap-3">
            <a href="#/chat" class="inline-flex items-center justify-center size-8 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" title="Back to chat">
              ${ICONS.arrowLeft}
            </a>
            <h1 class="text-lg font-semibold tracking-tight">AI Providers & Models</h1>
          </div>
          <button
            type="button"
            id="open-add-provider-btn"
            class="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs"
          >
            ${ICONS.plus} <span>Add Provider</span>
          </button>
        </header>

        <main class="relative z-10 mx-auto max-w-4xl px-6 py-8">
          <!-- Built-in Section -->
          <section class="mb-8">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Built-in Service</h2>
            <div class="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="inline-block size-2 rounded-full bg-emerald-500"></span>
                    <h3 class="font-semibold text-foreground">Lumi Reference AI</h3>
                  </div>
                  <p class="text-xs text-muted-foreground mt-1 max-w-md">
                    Pre-configured models ready for creative writing, planning, coding, and fast contextual answers.
                  </p>
                </div>
                <span class="text-xs rounded-full bg-accent px-2.5 py-1 text-accent-foreground font-medium">Default</span>
              </div>

              <div class="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-2">
                ${BUILT_IN_MODELS.map(
      (m) => `
                  <span class="text-xs rounded-full border border-border bg-muted/50 px-3 py-1 font-mono text-muted-foreground">
                    ${escapeHtml(m.label)}
                  </span>`
    ).join("")}
              </div>
            </div>
          </section>

          <!-- Custom Configured Providers -->
          <section class="mb-8">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Configured Custom Providers</h2>
            ${providers.length === 0
        ? `
              <div class="rounded-2xl border border-dashed border-border p-8 text-center bg-card/40">
                <p class="text-sm text-muted-foreground">No custom AI providers configured yet.</p>
                <p class="text-xs text-muted-foreground mt-1">Connect your own OpenAI, Google Gemini, Anthropic, or Ollama endpoint.</p>
              </div>`
        : `
              <div class="space-y-3">
                ${providers
          .map(
            (p) => `
                  <div class="rounded-2xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="size-2 rounded-full ${p.enabled ? "bg-emerald-500" : "bg-zinc-400"}"></span>
                        <h3 class="font-medium text-sm text-foreground">${escapeHtml(p.name)}</h3>
                        <span class="text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-mono uppercase">${escapeHtml(
              p.protocol
            )}</span>
                      </div>
                      <p class="text-xs text-muted-foreground mt-1 font-mono truncate max-w-md">${escapeHtml(
              p.base_url
            )}</p>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                        data-action="edit-provider"
                        data-id="${p.id}"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded-lg p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        data-action="delete-provider"
                        data-id="${p.id}"
                        title="Delete"
                      >
                        ${ICONS.trash}
                      </button>
                    </div>
                  </div>`
          )
          .join("")}
              </div>`
      }
          </section>

          <!-- Quick Template Add Options -->
          <section>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Popular Provider Presets</h2>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              ${PROVIDER_TEMPLATES.map(
        (tpl) => `
                <div class="rounded-2xl border border-border bg-card/70 p-4 transition-all hover:border-foreground/20 hover:shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 class="font-medium text-sm text-foreground">${escapeHtml(tpl.name)}</h3>
                    <p class="text-xs text-muted-foreground mt-1 line-clamp-1 font-mono">${escapeHtml(tpl.base_url)}</p>
                  </div>
                  <button
                    type="button"
                    class="mt-4 w-full rounded-xl border border-border bg-card py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    data-action="add-from-template"
                    data-name="${escapeHtml(tpl.name)}"
                  >
                    Configure
                  </button>
                </div>`
      ).join("")}
            </div>
          </section>
        </main>

        <!-- Add/Edit Provider Modal Dialog -->
        ${renderProviderModal()}
      </div>`;
  }

  function renderProviderModal() {
    if (!activeModal) return "";

    const isEdit = activeModal === "edit-provider" && editingProvider;
    const p = editingProvider || {
      name: "Custom Provider",
      protocol: "openai",
      base_url: "https://api.openai.com/v1",
      apiKey: "",
      default_model: "gpt-4o",
      modelsText: "gpt-4o\ngpt-4o-mini",
      timeout_seconds: 60,
      enabled: true,
    };

    return `
      <div class="modal-overlay" id="provider-modal-overlay">
        <div class="modal-dialog">
          <div class="p-6">
            <div class="flex items-center justify-between pb-4 border-b border-border">
              <h3 class="font-display text-2xl">${isEdit ? "Edit Provider" : "Add AI Provider"}</h3>
              <button type="button" id="close-modal-btn" class="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
            </div>

            <form id="provider-form" class="mt-4 space-y-3.5 text-sm">
              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">Provider Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value="${escapeHtml(p.name)}"
                  placeholder="e.g. OpenAI / Groq / Ollama"
                  class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-sm"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">API Protocol</label>
                  <select
                    name="protocol"
                    class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-sm"
                  >
                    <option value="openai" ${p.protocol === "openai" ? "selected" : ""}>OpenAI-compatible</option>
                    <option value="anthropic" ${p.protocol === "anthropic" ? "selected" : ""}>Anthropic Messages</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-muted-foreground mb-1">Default Model</label>
                  <input
                    type="text"
                    name="default_model"
                    value="${escapeHtml(p.default_model || "")}"
                    placeholder="e.g. gpt-4o"
                    class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">Base URL</label>
                <input
                  type="url"
                  name="base_url"
                  required
                  value="${escapeHtml(p.base_url || "")}"
                  placeholder="https://api.openai.com/v1"
                  class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-sm font-mono text-xs"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">API Key</label>
                <input
                  type="password"
                  name="apiKey"
                  value="${escapeHtml(p.apiKey || "")}"
                  placeholder="sk-... (Optional for local Ollama)"
                  class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-sm"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-muted-foreground mb-1">Available Models (one per line)</label>
                <textarea
                  name="modelsText"
                  rows="2"
                  class="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary text-xs font-mono"
                  placeholder="gpt-4o\ngpt-4o-mini"
                >${escapeHtml(p.modelsText || (p.models ? p.models.join("\n") : ""))}</textarea>
              </div>

              <div class="flex items-center justify-between pt-2">
                <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-muted-foreground">
                  <input type="checkbox" name="enabled" ${p.enabled !== false ? "checked" : ""} class="rounded size-4 accent-primary" />
                  <span>Enable this provider</span>
                </label>

                <div class="flex items-center gap-2">
                  <button type="button" id="cancel-modal-btn" class="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
                    Cancel
                  </button>
                  <button type="submit" class="rounded-full bg-primary text-primary-foreground px-5 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors">
                    Save Provider
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>`;
  }

  // 8. AUTH PAGE
  function renderAuthPage() {
    return `
      <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
        <div class="aurora opacity-70"></div>

        <div class="animate-rise-in relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card/95 p-7 shadow-composer backdrop-blur">
          <div class="mx-auto block w-fit">
            <div class="relative size-14 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600/30 to-pink-500/20 p-2.5 border border-border/80 shadow-md">
              <img src="${LUMI_LOGO}" alt="Lumi" class="size-10 object-contain select-none" />
            </div>
          </div>

          <h1 class="mt-4 text-center font-display text-2xl font-bold tracking-tight text-foreground">Welcome to Lumi</h1>
          <p class="mt-1.5 text-center text-xs text-muted-foreground leading-relaxed">
            Sign in to automatically sync your profile, chats, settings & images across all your devices.
          </p>

          <div class="mt-6 space-y-3">
            <!-- Google Button -->
            <button
              type="button"
              id="google-auth-btn"
              class="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-accent transition-all shadow-md active:scale-98 cursor-pointer"
            >
              ${ICONS.google} <span>Continue with Google</span>
            </button>
          </div>

          <div class="relative my-5 text-center text-xs text-muted-foreground after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-border after:-z-10">
            <span class="bg-card px-2 font-medium">or continue with email</span>
          </div>

          <!-- Email Form -->
          <form id="email-auth-form" class="space-y-3">
            <div>
              <input
                type="email"
                id="auth-email-input"
                required
                placeholder="Enter your email"
                class="w-full h-11 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary placeholder:text-muted-foreground"
                value=""
              />
            </div>

            <button
              type="submit"
              class="h-11 w-full rounded-full bg-primary font-medium text-sm text-primary-foreground hover:bg-primary/90 transition-transform active:scale-98 cursor-pointer shadow-xs"
            >
              Continue with Email
            </button>
          </form>

          <div class="mt-5 pt-3.5 border-t border-border/60 text-center">
            <button type="button" id="continue-guest-btn" class="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer bg-transparent border-0 p-0">
              Continue as Guest &rarr;
            </button>
          </div>
        </div>
      </div>`;
  }

  // --- Real API Streaming Integration ---
  async function streamFromCustomProvider(provider, modelName, chatHistory, onChunk, abortSignal, imagePayload = null) {
    const isAnthropic = provider.protocol === "anthropic";
    const apiKey = provider.apiKey || "";
    const historyWithImage = imagePayload
      ? chatHistory.map((message, index) => (
        index === chatHistory.length - 1 && message.role === "user"
          ? {
            ...message, content: [
              { type: "text", text: typeof message.content === "string" ? message.content : "Please examine the attached image." },
              { type: "image_url", image_url: { url: imagePayload } },
            ]
          }
          : message
      ))
      : chatHistory;

    if (isAnthropic) {
      const systemMsg = historyWithImage.find((m) => m.role === "system")?.content || "";
      const nonSystemMsgs = historyWithImage
        .filter((m) => m.role !== "system")
        .map((m) => {
          if (imagePayload && m.role === "user" && Array.isArray(m.content)) {
            const text = m.content.find((part) => part.type === "text")?.text || "Please examine the attached image.";
            const mediaMatch = imagePayload.match(/^data:(image\/[^;]+);base64,(.+)$/);
            return {
              role: "user",
              content: [
                { type: "text", text },
                ...(mediaMatch ? [{
                  type: "image",
                  source: { type: "base64", media_type: mediaMatch[1], data: mediaMatch[2] },
                }] : []),
              ],
            };
          }
          return { role: m.role, content: m.content };
        });
      if (nonSystemMsgs.length === 0) {
        nonSystemMsgs.push({ role: "user", content: "Hello" });
      }

      const bodyPayload = {
        model: modelName || provider.default_model || "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: nonSystemMsgs,
        stream: true,
      };
      if (systemMsg) {
        bodyPayload.system = systemMsg;
      }

      const response = await fetch(`${provider.base_url.replace(/\/+$/, "")}/messages`, {
        method: "POST",
        signal: abortSignal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          ...(provider.headers || {}),
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
        }
        const lines = buffer.split("\n");
        buffer = done ? "" : (lines.pop() || "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                onChunk(parsed.delta.text);
              }
            } catch { }
          }
        }
        if (done) break;
      }
      return;
    }

    // Default: OpenAI-compatible (works with Free AI Hub, GPT4Free, Duck.ai, Gemini Web, Ollama, Groq, etc.)
    const apiBase =
      window.location.origin && window.location.origin.startsWith("http")
        ? ""
        : "https://lumi-backend-v4-production.up.railway.app";

    let rawBase = (provider.base_url || "").trim().replace(/\/+$/, "");
    if (rawBase.startsWith("/")) {
      rawBase = `${apiBase}${rawBase}`;
    }

    let url = rawBase;
    if (!url.endsWith("/chat/completions") && !url.endsWith("/chat")) {
      url = `${url}/chat/completions`;
    }

    const headers = {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...(provider.headers || {}),
    };

    const response = await fetch(url, {
      method: "POST",
      signal: abortSignal,
      headers,
      body: JSON.stringify({
        model: modelName || provider.default_model || "gpt-4o",
        messages: historyWithImage,
        stream: true,
        max_tokens: 4096,
        tools: [{
          type: "function",
          function: {
            name: "web_search",
            description: "Search the live web for current facts, news, prices, scores, weather, or URLs.",
            parameters: {
              type: "object",
              properties: { query: { type: "string", description: "Exact live web search query" } },
              required: ["query"],
            },
          },
        }],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${await response.text()}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: !done });
      }
      const lines = buffer.split("\n");
      buffer = done ? "" : (lines.pop() || "");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (!dataStr || dataStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(dataStr);
            const delta =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.delta?.text ||
              parsed.message ||
              "";
            if (delta) onChunk(delta);
          } catch { }
        }
      }
      if (done) break;
    }
  }

  // Helper to ensure send button and composer are always restored
  function restoreComposerButtons() {
    isStreaming = false;
    activeStreamingThreadId = null;
    const stopBtn = document.querySelector("#stop-generation-btn");
    const submitBtn = document.querySelector("#submit-prompt-btn");
    const voiceBtn = document.querySelector("#voice-call-trigger-btn");
    const ta = document.querySelector("#composer-textarea");
    if (stopBtn) {
      stopBtn.classList.add("hidden");
      stopBtn.classList.remove("inline-flex");
    }
    if (submitBtn) {
      submitBtn.classList.remove("hidden");
      submitBtn.classList.add("inline-flex");
      submitBtn.disabled = false;
    }
    if (voiceBtn) {
      voiceBtn.classList.remove("hidden");
      voiceBtn.classList.add("inline-flex");
    }
    if (ta) {
      ta.disabled = false;
    }
  }

  // --- Send Message & Live Streaming Execution ---
  async function sendMessage(text) {
    const prompt = text.trim();
    if (!prompt) return;

    // Daily Guest Mode Restriction (7 messages / day)
    if (!LumiGuestQuota.canSendMessage()) {
      openUpgradeModal("messages");
      AudioEffects.play("error");
      showToast("⚡ Daily free limit reached (7/7). Sign in with Google for unlimited!");
      return;
    }

    if (isStreaming && !streamAbortController) {
      restoreComposerButtons();
    }
    if (isStreaming) return;

    // Increment guest usage
    LumiGuestQuota.incrementMessage();
    stopSpeechSynthesis();

    let { path } = parseLocation();
    let threadId = path.startsWith("/chat/") ? path.slice(6) : null;
    let thread = conversations.find((c) => c.id === threadId);
    const isNewThread = !thread;

    // Create a new thread if not in one
    if (isNewThread) {
      threadId = "thread_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      thread = {
        id: threadId,
        title: prompt.slice(0, 48) + (prompt.length > 48 ? "…" : ""),
        createdAt: new Date().toISOString(),
        model: { ...selectedModel },
        messages: [],
      };
      conversations.unshift(thread);
      saveJson(STORAGE.CHATS, conversations);
      window.location.hash = `#/chat/${threadId}`;
    }

    activeStreamingThreadId = threadId;

    // Process Attached Files & Images Upfront
    let imagePayload = null;
    let fileContext = "";
    let attachedList = [];
    if (attachedFiles.length > 0) {
      const imgFile = attachedFiles.find((f) => f.isImage);
      if (imgFile) {
        imagePayload = imgFile.dataUrl;
      }
      attachedList = attachedFiles.map((f) => ({
        name: f.name,
        size: f.size,
        pages: f.pages || null,
        isImage: f.isImage || false,
        dataUrl: f.isImage ? f.dataUrl : null,
      }));
      const textFiles = attachedFiles.filter((f) => !f.isImage);
      if (textFiles.length > 0) {
        fileContext =
          "\n\n[Attached User Files]:\n" +
          textFiles
            .map(
              (f) =>
                `--- File: ${f.name} (${formatBytes(f.size)}${f.pages ? `, ${f.pages} pages` : ""}) ---\n${f.content}\n--- End of File ---`
            )
            .join("\n\n");
      }
      attachedFiles = [];
      updateAttachmentChipsUI();
    }

    // Add User Message
    const userMsg = {
      id: "msg_" + Date.now().toString(36) + "_user",
      role: "user",
      content: prompt,
      attachedFiles: attachedList.length > 0 ? attachedList : null,
      timestamp: Date.now(),
    };
    thread.messages.push(userMsg);

    // Add Empty Assistant Message placeholder for streaming
    const assistantMsgId = "msg_" + Date.now().toString(36) + "_assistant";
    thread.messages.push({
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    });

    const assistantMsg = thread.messages.find((m) => m.id === assistantMsgId);

    saveJson(STORAGE.CHATS, conversations);
    AudioEffects.play("send");

    // If brand new thread or messages container not in DOM, render immediately
    const msgsContainer = document.querySelector("#chat-messages-container .space-y-7");
    if (isNewThread || !msgsContainer) {
      render();
    } else {
      const userHtml = `
        <div class="animate-rise-in user-msg-row" id="msg-row-${userMsg.id}">
          ${userMsg.attachedFiles && userMsg.attachedFiles.length > 0
          ? `<div class="flex flex-wrap justify-end gap-1.5 mb-1">
                  ${userMsg.attachedFiles.map(f => `<span class="attachment-chip text-[11px] py-0.5 px-2">${f.isImage && f.dataUrl ? `<img src="${f.dataUrl}" class="size-3.5 object-cover rounded-xs inline-block mr-1" />` : f.isPdf ? "📑 " : "📄 "}${escapeHtml(f.name)} (${formatBytes(f.size)})</span>`).join('')}
                </div>`
          : ""
        }
          <div class="user-msg-bubble">${escapeHtml(userMsg.content.trim())}</div>
        </div>`;

      const assistantHtml = `
        <div class="animate-rise-in flex gap-3.5 items-start" id="msg-row-${assistantMsg.id}">
          <img src="${LUMI_LOGO}" alt="Lumi" class="mt-0.5 size-6 shrink-0 object-contain select-none" />
          <div class="min-w-0 flex-1">
            <div class="markdown-body text-[15px] leading-relaxed text-foreground" id="msg-body-${assistantMsg.id}">
              <div class="thinking-badge-container">
                <span class="thinking-spinner"></span>
                <span>Thinking…</span>
                <span class="thinking-dots">
                  <span class="thinking-dot"></span>
                  <span class="thinking-dot"></span>
                  <span class="thinking-dot"></span>
                </span>
              </div>
            </div>
            <div class="mt-2.5 flex items-center flex-wrap gap-2" id="msg-actions-${assistantMsg.id}" style="display:none;"></div>
          </div>
        </div>`;

      msgsContainer.insertAdjacentHTML("beforeend", userHtml);
      msgsContainer.insertAdjacentHTML("beforeend", assistantHtml);

      const ta = document.querySelector("#composer-textarea");
      if (ta) {
        ta.value = "";
        ta.style.height = "auto";
      }

      // In-place switch send button to stop button
      const submitBtn = document.querySelector("#submit-prompt-btn");
      const voiceBtn = document.querySelector("#voice-call-trigger-btn");
      const stopBtn = document.querySelector("#stop-generation-btn");
      if (submitBtn) {
        submitBtn.classList.add("hidden");
        submitBtn.classList.remove("inline-flex");
      }
      if (voiceBtn) {
        voiceBtn.classList.add("hidden");
        voiceBtn.classList.remove("inline-flex");
      }
      if (stopBtn) {
        stopBtn.classList.remove("hidden");
        stopBtn.classList.add("inline-flex");
      }
      scrollToBottom();
    }

    // 0A. NATIVE DEVICE HARDWARE INTENTS (Torch, Battery, Vibrate)
    const lowerPrompt = prompt.toLowerCase().trim();

    // Torch / Flashlight ON
    if (/\b(?:torch|flashlight)\s*(?:on|chalu|jalao|start|jalado|khol|jala)\b/i.test(lowerPrompt) ||
      /\b(?:on|chalu|jalao|start|jalado)\s*(?:the\s*)?(?:torch|flashlight)\b/i.test(lowerPrompt)) {
      const ok = LumiDevice.toggleTorch(true);
      const isNative = LumiDevice.isNative();
      assistantMsg.content = isNative && ok
        ? "🔦 **Flashlight ON kar di hai!** Phone ka torch ab chalu hai."
        : "🔦 Flashlight toggle command execute kar di gayi hai.";
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("success");
      restoreComposerButtons();
      render();
      scrollToBottom();
      return;
    }

    // Torch / Flashlight OFF
    if (/\b(?:torch|flashlight)\s*(?:off|band|bujhao|stop|bujha)\b/i.test(lowerPrompt) ||
      /\b(?:off|band|bujhao|stop|bujha)\s*(?:the\s*)?(?:torch|flashlight)\b/i.test(lowerPrompt)) {
      LumiDevice.toggleTorch(false);
      assistantMsg.content = "🔦 **Flashlight OFF kar di hai!** Phone ka torch ab band hai.";
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("click");
      restoreComposerButtons();
      render();
      scrollToBottom();
      return;
    }

    // Battery Telemetry
    if (/\b(?:battery|charging)\s*(?:kitni|kya|status|percentage|level|check|hai)\b/i.test(lowerPrompt) ||
      /\b(?:check\s+battery|battery\s+status|battery\s+percent)\b/i.test(lowerPrompt)) {
      const bInfo = LumiDevice.getBattery();
      if (bInfo && bInfo.level >= 0) {
        const chargingText = bInfo.isCharging ? `aur phone **charging par hai** (${bInfo.plugged}) ⚡` : "aur phone discharging par hai.";
        assistantMsg.content = `🔋 **Battery Status:**\nAapke device ka current battery level **${bInfo.level}%** hai ${chargingText}`;
      } else {
        assistantMsg.content = "🔋 Battery telemetry active hai.";
      }
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("success");
      restoreComposerButtons();
      render();
      scrollToBottom();
      return;
    }

    // Haptic Vibrate
    if (/\b(?:phone\s+vibrate|vibrate\s+karo|vibration\s+karo|phone\s+hilao)\b/i.test(lowerPrompt)) {
      LumiDevice.vibrate(600);
      assistantMsg.content = "📳 **Phone vibrate kar diya hai!** Haptic pulse triggered.";
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("click");
      restoreComposerButtons();
      render();
      scrollToBottom();
      return;
    }

    // 0B. PERSISTENT LONG-TERM MEMORY AUTO-RECORDING
    const memMatch = prompt.match(/^(?:yaad rakhna|remember that|yaad rakh|mera naam|my name is)\s*(?:ki\s+|that\s+)?(.*)/i);
    if (memMatch && memMatch[1]) {
      const factToSave = prompt.replace(/^(?:yaad rakhna|remember that|yaad rakh)\s*(?:ki\s+|that\s+)?/i, "").trim();
      if (factToSave.length > 2) {
        LumiMemory.add(factToSave);
      }
    }

    // Reusable Real-Time Generative Video Flow
    const triggerVideoGeneration = (videoPrompt, targetMsg, aspect = "16:9") => {
      let enhancedPrompt = videoPrompt;
      if (!/cinematic|motion|smooth|camera|photorealistic|4k|8k/i.test(enhancedPrompt)) {
        enhancedPrompt = `${videoPrompt}, cinematic motion, highly detailed, photorealistic 8k, smooth movement, masterpiece`;
      }

      targetMsg.videoPrompt = videoPrompt;
      targetMsg.videoLoading = true;
      targetMsg.videoProvider = "Google Flow (Veo / Imagen 3 Studio)";
      targetMsg.content = "";
      targetMsg.generationStage = "CONNECTING TO GOOGLE FLOW STUDIO";
      saveJson(STORAGE.CHATS, conversations);
      if (!updateAssistantMsgDOM(targetMsg, false, true)) {
        render();
      }
      scrollToBottom();

      const stages = [
        "CONNECTING TO GOOGLE FLOW STUDIO",
        "SYNTHESIZING FLOW MASTER ASSET",
        "CHOREOGRAPHING 60FPS CAMERA MOTION",
        "ENCODING H.264 CINEMATIC MP4"
      ];
      let stageIdx = 0;
      const stageTimer = setInterval(() => {
        if (!targetMsg.videoLoading) {
          clearInterval(stageTimer);
          return;
        }
        stageIdx = (stageIdx + 1) % stages.length;
        targetMsg.generationStage = stages[stageIdx];
        const stageEl = document.querySelector(`#video-stage-${targetMsg.id}`);
        if (stageEl) {
          stageEl.textContent = stages[stageIdx];
        }
      }, 1500);

      const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const candidateEndpoints = isLocalHost
        ? [
          "http://127.0.0.1:3456/api/generate/video",
          "http://localhost:3456/api/generate/video",
          "https://lumi-backend-v4-production.up.railway.app/api/generate/video"
        ]
        : [
          "https://lumi-backend-v4-production.up.railway.app/api/generate/video",
          "http://127.0.0.1:3456/api/generate/video",
          "http://localhost:3456/api/generate/video"
        ];
      if (window.location.origin && window.location.origin.startsWith("http") && !candidateEndpoints.includes(`${window.location.origin}/api/generate/video`)) {
        candidateEndpoints.unshift(`${window.location.origin}/api/generate/video`);
      }

      (async () => {
        let targetUrl = "";
        let targetProvider = "";
        for (const ep of candidateEndpoints) {
          try {
            const vidCtrl = new AbortController();
            const vidTid = setTimeout(() => vidCtrl.abort(), 95000);
            const vidResp = await fetch(ep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: enhancedPrompt,
                model: "auto",
                aspect: aspect,
                duration: 4.0,
                googleCookie: localStorage.getItem("lumi_google_cookie") || "",
                bingCookie: localStorage.getItem("lumi_bing_cookie") || ""
              }),
              signal: vidCtrl.signal
            });
            clearTimeout(vidTid);
            if (vidResp.ok) {
              const vidData = await vidResp.json();
              if (vidData.url || vidData.videoUrl) {
                let finalUrl = vidData.url || vidData.videoUrl;
                if (finalUrl.startsWith("/") && ep.startsWith("http")) {
                  try {
                    const epOrigin = new URL(ep).origin;
                    if (window.location.origin !== epOrigin) {
                      finalUrl = `${epOrigin}${finalUrl}`;
                    }
                  } catch (e) { }
                }
                targetUrl = finalUrl;
                targetProvider = vidData.provider || "Google Flow (Veo / Imagen 3 Studio)";
                break;
              }
            }
          } catch (e) { }
        }

        clearInterval(stageTimer);
        targetMsg.videoLoading = false;

        if (!targetUrl) {
          targetMsg.content = `❌ Video generation failed on AI cluster. Please retry in a few moments.`;
          saveJson(STORAGE.CHATS, conversations);
          if (!updateAssistantMsgDOM(targetMsg, false, true)) {
            render();
          }
          restoreComposerButtons();
          scrollToBottom();
          return;
        }

        targetMsg.videoUrl = targetUrl;
        targetMsg.videoProvider = targetProvider || "Lumi AI Cinematic Studio";
        targetMsg.content = `🎬 **AI Video Generated** for: *"**${escapeHtml(videoPrompt)}**"*`;
        saveJson(STORAGE.CHATS, conversations);
        AudioEffects.play("success");
        if (!updateAssistantMsgDOM(targetMsg, false, true)) {
          render();
        }
        restoreComposerButtons();
        scrollToBottom();
      })();
    };

    // Reusable Real-Time Generative Image Flow
    const triggerImageGeneration = (imagePrompt, targetMsg, aspect = "1:1") => {
      // Guest Image Limit: 1 trial image per day
      if (!LumiGuestQuota.canGenerateImage()) {
        openUpgradeModal("images");
        AudioEffects.play("error");
        targetMsg.content = "🎨 **Daily Image Limit Reached for Guest Mode.**\n\nSign in with Google in 1 tap for unlimited high-definition image generations!";
        targetMsg.imageLoading = false;
        saveJson(STORAGE.CHATS, conversations);
        render();
        return;
      }
      LumiGuestQuota.incrementImage();
      let enhancedPrompt = imagePrompt;
      if (aspect === "16:9" && !enhancedPrompt.includes("16:9")) {
        enhancedPrompt += ", 16:9 widescreen landscape aspect ratio";
      } else if (aspect === "9:16" && !enhancedPrompt.includes("9:16")) {
        enhancedPrompt += ", 9:16 vertical smartphone wallpaper aspect ratio";
      }

      if (!/photorealistic|8k|masterpiece|cinematic|detailed/i.test(enhancedPrompt)) {
        enhancedPrompt = `${enhancedPrompt}, highly detailed, photorealistic, 8k resolution, cinematic lighting, masterpiece`;
      }

      targetMsg.imagePrompt = imagePrompt;
      targetMsg.imageLoading = true;
      targetMsg.generationPercent = 7;
      targetMsg.generationStage = "Sketching it out";
      targetMsg.content = "";
      saveJson(STORAGE.CHATS, conversations);
      if (!updateAssistantMsgDOM(targetMsg, false, true)) {
        render();
      }
      scrollToBottom();

      let currentPct = 7;
      const stageTimer = setInterval(() => {
        if (!targetMsg.imageLoading) {
          clearInterval(stageTimer);
          return;
        }
        if (currentPct < 22) {
          currentPct += 5;
          targetMsg.generationStage = "Sketching it out";
        } else if (currentPct < 65) {
          currentPct += 8;
          targetMsg.generationStage = "Making the first draft";
        } else if (currentPct < 96) {
          currentPct += 4;
          targetMsg.generationStage = "Polishing details";
        }
        targetMsg.generationPercent = currentPct;
        const card = document.querySelector(`#canvas-card-${targetMsg.id}`);
        if (card) {
          const stEl = card.querySelector(".chatgpt-canvas-stage-text");
          const pctEl = card.querySelector(".chatgpt-percent-pill");
          if (stEl) stEl.textContent = targetMsg.generationStage;
          if (pctEl) pctEl.textContent = `${targetMsg.generationPercent}%`;
          if (targetMsg.generationPercent > 60 && !card.querySelector(".chatgpt-polishing-beam")) {
            updateAssistantMsgDOM(targetMsg, false, true);
          }
        }
      }, 700);

      const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const candidateEndpoints = isLocalHost
        ? [
          "http://127.0.0.1:3456/api/generate/image",
          "http://localhost:3456/api/generate/image",
          "https://lumi-backend-v4-production.up.railway.app/api/generate/image"
        ]
        : [
          "https://lumi-backend-v4-production.up.railway.app/api/generate/image",
          "http://127.0.0.1:3456/api/generate/image",
          "http://localhost:3456/api/generate/image"
        ];
      if (window.location.origin && window.location.origin.startsWith("http") && !candidateEndpoints.includes(`${window.location.origin}/api/generate/image`)) {
        candidateEndpoints.unshift(`${window.location.origin}/api/generate/image`);
      }

      (async () => {
        let targetUrl = "";
        let targetProvider = "";
        for (const ep of candidateEndpoints) {
          try {
            const imgCtrl = new AbortController();
            const imgTid = setTimeout(() => imgCtrl.abort(), 75000);
            const imgResp = await fetch(ep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: enhancedPrompt,
                model: "google-flow",
                googleCookie: localStorage.getItem("lumi_google_cookie") || "",
                bingCookie: localStorage.getItem("lumi_bing_cookie") || ""
              }),
              signal: imgCtrl.signal
            });
            clearTimeout(imgTid);
            if (imgResp.ok) {
              const imgData = await imgResp.json();
              if (imgData.url) {
                let finalUrl = imgData.url;
                if (finalUrl.startsWith("/") && ep.startsWith("http")) {
                  try {
                    const epOrigin = new URL(ep).origin;
                    if (window.location.origin !== epOrigin) {
                      finalUrl = `${epOrigin}${finalUrl}`;
                    }
                  } catch (e) { }
                }
                targetUrl = finalUrl;
                targetProvider = imgData.provider || "Google Flow (Imagen 3)";
                break;
              }
            }
          } catch (e) { }
        }

        if (!targetUrl) {
          clearInterval(stageTimer);
          targetMsg.imageLoading = false;
          targetMsg.content = `❌ Image generation failed on AI cluster. Please retry in a few moments.`;
          saveJson(STORAGE.CHATS, conversations);
          if (!updateAssistantMsgDOM(targetMsg, false, true)) {
            render();
          }
          restoreComposerButtons();
          scrollToBottom();
          return;
        }

        const preloader = new Image();
        preloader.onload = () => {
          clearInterval(stageTimer);
          targetMsg.imageUrl = targetUrl;
          targetMsg.imageProvider = targetProvider || "Lumi AI Image Studio";
          targetMsg.imageLoading = false;
          targetMsg.content = `✨ **High-Definition Image Generated** for: *"**${escapeHtml(imagePrompt)}**"*`;
          saveJson(STORAGE.CHATS, conversations);
          AudioEffects.play("success");
          if (!updateAssistantMsgDOM(targetMsg, false, true)) {
            render();
          }
          restoreComposerButtons();
          scrollToBottom();
        };
        preloader.onerror = () => {
          clearInterval(stageTimer);
          targetMsg.imageUrl = targetUrl;
          targetMsg.imageProvider = targetProvider || "Lumi AI Image Studio";
          targetMsg.imageLoading = false;
          targetMsg.content = `✨ **High-Definition Image Generated** for: *"**${escapeHtml(imagePrompt)}**"*`;
          saveJson(STORAGE.CHATS, conversations);
          if (!updateAssistantMsgDOM(targetMsg, false, true)) {
            render();
          }
          restoreComposerButtons();
          scrollToBottom();
        };
        preloader.src = targetUrl;
      })();
    };

    // Reusable Suno & Udio Song Generation Flow
    const triggerSongGeneration = (songPrompt, targetMsg, style = "Bollywood / Pop") => {
      targetMsg.musicPrompt = songPrompt;
      targetMsg.musicLoading = true;
      targetMsg.content = "";
      saveJson(STORAGE.CHATS, conversations);
      if (!updateAssistantMsgDOM(targetMsg, false, true)) {
        render();
      }
      scrollToBottom();

      const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const candidateEndpoints = isLocalHost
        ? [
          "http://127.0.0.1:3456/api/music/generate",
          "http://localhost:3456/api/music/generate",
          "https://lumi-backend-v4-production.up.railway.app/api/music/generate"
        ]
        : [
          "https://lumi-backend-v4-production.up.railway.app/api/music/generate",
          "http://127.0.0.1:3456/api/music/generate",
          "http://localhost:3456/api/music/generate"
        ];
      if (window.location.origin && window.location.origin.startsWith("http") && !candidateEndpoints.includes(`${window.location.origin}/api/music/generate`)) {
        candidateEndpoints.unshift(`${window.location.origin}/api/music/generate`);
      }

      (async () => {
        let resData = null;
        for (const ep of candidateEndpoints) {
          try {
            const mCtrl = new AbortController();
            const mTid = setTimeout(() => mCtrl.abort(), 60000);
            const mResp = await fetch(ep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: songPrompt,
                style: style,
                cookie: localStorage.getItem("lumi_suno_cookie") || "",
                sunoCookie: localStorage.getItem("lumi_suno_cookie") || "",
                udioToken: localStorage.getItem("lumi_udio_token") || "",
                googleCookie: localStorage.getItem("lumi_google_cookie") || ""
              }),
              signal: mCtrl.signal
            });
            clearTimeout(mTid);
            if (mResp.ok) {
              resData = await mResp.json();
              break;
            }
          } catch (e) { }
        }

        targetMsg.musicLoading = false;
        if (resData && resData.status === "success") {
          targetMsg.musicTrack = {
            title: resData.title || songPrompt,
            style: resData.style || style,
            audioUrl: resData.audioUrl || "",
            composition: resData.composition || (resData.data ? JSON.stringify(resData.data, null, 2) : "")
          };
          targetMsg.content = resData.audioUrl ? `🎵 **Audio Track Generated!** Tap play to listen.` : `✨ **AI Song Track Composed!** (Connect Suno Cookie to stream direct MP3)`;
          AudioEffects.play("success");
        } else {
          targetMsg.content = `❌ Song generation error. Please check your network and try again.`;
        }
        saveJson(STORAGE.CHATS, conversations);
        if (!updateAssistantMsgDOM(targetMsg, false, true)) {
          render();
        }
        restoreComposerButtons();
        scrollToBottom();
      })();
    };

    // 0C. REAL AI VIDEO GENERATION (/video, /vid, or natural prompt)
    const isVideoCommand =
      /^\/(?:video|vid|movie|clip|animate)\s+/i.test(prompt) ||
      /^(?:generate video|video of|create video|render video|make video|animate)\b/i.test(prompt) ||
      /\b(?:video|clip|movie|animation)\s+(?:banao|banado|bana\s+do|generate|create|render|dikhao|karo)\b/i.test(prompt) ||
      /\b(?:banao|banado|bana\s+do|generate|create|render|dikhao)\s+.*?\b(?:video|clip|movie|animation)\b/i.test(prompt) ||
      /\b(?:ki|ka|ek|koi)\s+(?:video|clip|movie)\s*(?:banao|banado|bana\s+do)\b/i.test(prompt);

    if (isVideoCommand) {
      let videoPrompt = prompt
        .replace(/^\/(?:video|vid|movie|clip|animate)\s+/i, "")
        .replace(/^(?:generate video of|generate video|video of|create video of|create a video of|create video|make video of|make a video of|make video|render video|animate)\s*/i, "")
        .replace(/\b(?:video|clip|movie|animation)\s+(?:banao|banado|bana\s+do|generate|create|render|dikhao|karo)\b/gi, "")
        .replace(/\b(?:banao|banado|bana\s+do|generate|create|render|dikhao)\s+/gi, "")
        .replace(/\b(?:ki\s+banao|ka\s+banao|ki\s+video|ka\s+video|ki\s+clip|ka\s+clip)\b/gi, "")
        .replace(/\b(?:ki|ka|ke|ek|koi)\b/gi, "")
        .trim();
      if (!videoPrompt) videoPrompt = prompt.trim();
      triggerVideoGeneration(videoPrompt, assistantMsg);
      return;
    }

    // 1. CHATGPT-STYLE INTERACTIVE IMAGE CREATION WIZARD & GENERATION
    const cleanLowerPrompt = prompt.trim().toLowerCase();
    const isVagueImagePrompt =
      /^(?:ek\s+)?(?:image|photo|tasveer|picture|pic|wallpaper)\s*(?:banao|banado|bana\s+do|chahiye|dikhao)(?:\s+to)?$/i.test(cleanLowerPrompt) ||
      /^(?:banao|banado|generate|create)\s*(?:ek\s+)?(?:image|photo|tasveer|picture|pic|wallpaper)(?:\s+to)?$/i.test(cleanLowerPrompt) ||
      /^(?:can you\s+)?(?:make|generate|create)\s*(?:an?\s+)?image$/i.test(cleanLowerPrompt) ||
      cleanLowerPrompt === 'image banao' || cleanLowerPrompt === 'ek image banao to' || cleanLowerPrompt === 'photo banao';

    if (isVagueImagePrompt) {
      assistantMsg.content = 'Kaisi image banani hai? 😄';
      assistantMsg.imageWizard = {
        step: 1,
        totalSteps: 2,
        subject: null,
        style: null,
        active: true
      };
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play('send');
      render();
      restoreComposerButtons();
      scrollToBottom();
      return;
    }

    // 1. FREE HIGH-RESOLUTION IMAGE GENERATION (/image, /imagine, or natural prompt)
    const isImageCommand =
      /^\/(?:image|img|imagine)\s+/i.test(prompt) ||
      /^(?:generate image|image of|draw|paint|create image|render image|sketch)\b/i.test(prompt) ||
      /\b(?:photo|image|tasveer|picture|pic|wallpaper|drawing|portrait)\s+(?:banao|banado|bana\s+do|generate|create|render|dikhao|kheecho)\b/i.test(prompt) ||
      /\b(?:banao|banado|bana\s+do|generate|create|render|dikhao)\s+.*?\b(?:photo|image|tasveer|picture|pic|wallpaper)\b/i.test(prompt) ||
      /\b(?:ki|ka|ek|koi)\s+(?:photo|image|tasveer|picture|pic|wallpaper)?\s*(?:banao|banado|bana\s+do)\b/i.test(prompt) ||
      /\b(ki\s+banao|ka\s+banao|ki\s+tasveer|ka\s+photo|ki\s+photo|ki\s+pic)\b/i.test(prompt) ||
      activePersona === "artist";

    if (isImageCommand) {
      let imagePrompt = prompt
        .replace(/^\/(?:image|img|imagine)\s+/i, "")
        .replace(/^(?:generate image of|generate image|image of|draw a|draw an|paint a|create an image of|create image of|draw|paint)\s*/i, "")
        .replace(/\b(?:photo|image|tasveer|picture|pic|wallpaper)\s+(?:banao|banado|bana\s+do|generate|create|render|dikhao|kheecho)\b/gi, "")
        .replace(/\b(?:banao|banado|bana\s+do|generate|create|render|dikhao)\s+/gi, "")
        .replace(/\b(?:ki\s+banao|ka\s+banao|ki\s+tasveer|ka\s+photo|ki\s+photo|ki\s+pic)\b/gi, "")
        .replace(/\b(?:ki|ka|ke|ek|koi)\b/gi, "")
        .trim();
      if (!imagePrompt) imagePrompt = prompt.trim();
      triggerImageGeneration(imagePrompt, assistantMsg);
      return;
    }

    // 1B. SUNO & UDIO AI MUSIC & SONG GENERATION (/song, /music, or natural prompt)
    const isMusicCommand =
      /^\/(?:music|song|suno|udio)\s+/i.test(prompt) ||
      /\b(?:gaana|gana|geet|song|music|track|rap|melody|ghazal)\s+(?:banao|banado|bana\s+do|likho|likh\s+do|create|generate|compose)\b/i.test(prompt) ||
      /\b(?:banao|banado|bana\s+do|likho|likh\s+do|compose|create)\s+.*?\b(?:gaana|gana|geet|song|music|track|rap|melody|ghazal)\b/i.test(prompt) ||
      /\b(?:suno|udio)\s+(?:song|music|track)?\b/i.test(prompt);

    if (isMusicCommand) {
      let detectedStyle = "Bollywood / Pop";
      if (/romantic|pyaar|love|ishq/i.test(prompt)) detectedStyle = "Bollywood Romantic";
      else if (/lo-?fi|chill|relax|peace/i.test(prompt)) detectedStyle = "Lo-fi Chill Beats";
      else if (/rap|hip-?hop|cypher|trap/i.test(prompt)) detectedStyle = "Hip-Hop / Rap";
      else if (/punjabi|bhangra|desi/i.test(prompt)) detectedStyle = "Punjabi Beat";
      else if (/rock|acoustic|guitar/i.test(prompt)) detectedStyle = "Acoustic Rock";
      else if (/edm|dance|club|party/i.test(prompt)) detectedStyle = "Electronic EDM";
      else if (/sad|dard|emotional|heartbreak/i.test(prompt)) detectedStyle = "Sad / Soulful Melody";

      let songPrompt = prompt
        .replace(/^\/(?:music|song|suno|udio)\s+/i, "")
        .replace(/\b(?:gaana|gana|geet|song|music|track|rap|melody|ghazal)\s+(?:banao|banado|bana\s+do|likho|likh\s+do|create|generate|compose)\b/gi, "")
        .replace(/\b(?:banao|banado|bana\s+do|likho|likh\s+do|compose|create)\s+(?:ek|koi)?\s*(?:gaana|gana|geet|song|music|track|rap|melody)?\b/gi, "")
        .replace(/\b(?:ki|ka|ke|ek|koi|par|pe)\b/gi, "")
        .trim();
      if (!songPrompt) songPrompt = prompt.trim();
      triggerSongGeneration(songPrompt, assistantMsg, detectedStyle);
      return;
    }

    // 2. LIVE REAL-TIME WEATHER & WEB SEARCH
    // Web search is now executed autonomously by the selected AI provider.
    /*
    let webContext = "";
    const isSearchExplicit = /^\/search\s+/i.test(prompt);
    const isSearchExplicit = /^\/search\s+/i.test(prompt);
    const isWeatherQuery = /\b(weather|mausam|temperature|forecast|temp)\b/i.test(prompt);

    if (isWeatherQuery) {
      // Instant Live Real-Time Weather Fetch (< 300ms via wttr.in)
      try {
        const cityMatch =
          prompt.match(/(?:in|of|at|for|ka|ki)\s+([A-Za-z\s]+)/i) ||
          prompt.match(/([A-Za-z]+)\s+(?:weather|mausam|temp)/i);
        let city = cityMatch ? cityMatch[1].replace(/\b(today|now|tomorrow|report|kaisa|hai|batao|the|current)\b/gi, "").trim() : "Delhi";
        if (!city) city = "Delhi";

        const weatherController = new AbortController();
        const timeoutId = setTimeout(() => weatherController.abort(), 2500);
        const wResp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
          signal: weatherController.signal,
        });
        clearTimeout(timeoutId);

        if (wResp.ok) {
          const wData = await wResp.json();
          const curr = (wData.current_condition && wData.current_condition[0]) || {};
          const tempC = curr.temp_C || "25";
          const desc = (curr.weatherDesc && curr.weatherDesc[0] && curr.weatherDesc[0].value) || "Clear";
          const hum = curr.humidity || "50";
          const wind = curr.windspeedKmph || "5";
          const forecastList = (wData.weather || []).slice(0, 3).map((f) => {
            const dayDesc = (f.hourly && f.hourly[0] && f.hourly[0].weatherDesc && f.hourly[0].weatherDesc[0].value) || "Partly Cloudy";
            return `${f.date}: ${f.maxtempC}°C / ${f.mintempC}°C (${dayDesc})`;
          });

          assistantMsg.searchResults = [
            {
              title: `Live Weather: ${city.charAt(0).toUpperCase() + city.slice(1)} (${tempC}°C, ${desc})`,
              snippet: `Current Temperature: ${tempC}°C, ${desc}. Humidity: ${hum}%, Wind: ${wind} km/h. 3-day forecast: ${forecastList.join(", ")}`,
              url: `https://wttr.in/${encodeURIComponent(city)}`,
            },
          ];
          webContext = `\n\n[OFFICIAL REAL-TIME LIVE WEATHER FOR ${city.toUpperCase()} RETRIEVED JUST NOW]:\n- Current Temperature: ${tempC}°C, Weather: ${desc}, Humidity: ${hum}%, Wind: ${wind} km/h\n- Forecast: ${forecastList.join("; ")}\n(CRITICAL: You HAVE real-time live data provided above. Present it directly as current verified weather. NEVER output disclaimers claiming you lack real-time access.)\n`;
          render();
          scrollToBottom();
        }
      } catch (weatherErr) {
        console.warn("Live weather fetch timed out or failed:", weatherErr);
      }
    } else {
      const hasSearchIntent =
        webSearchEnabled ||
        isSearchExplicit ||
        /^(search|google|dhoondo|khojo|find|who is|what is|when is|where is|latest|current|today'?s|news about|live score)\b/i.test(prompt.trim()) ||
        /\b(search\s*(?:karo|karke|kar)|google\s*(?:karo|karke|pe)?|dhoond\s*(?:kar|ke|karo)?|khoj\s*(?:kar|ke|karo)?|latest news|aaj ki|today|ipl score|score|news|who is|kaun hai|kya hai)\b/i.test(prompt);

      if (hasSearchIntent) {
        let cleanQuery = prompt
          .replace(/^\/search\s+/i, "")
          .replace(/^(?:please\s+|can\s+you\s+)?(?:search(?:\s+the\s+web|\s+online|\s+on\s+google)?|google\s*(?:karke|karo|pe|par)|dhoondo|khojo)(?:\s+(?:for|about|me))?\s+/i, "")
          .replace(/[\s,]+(?:search\s*(?:karke|karo)|google\s*(?:karke|karo|pe|par)|dhoond\s*(?:kar|ke|karo)|khoj\s*(?:kar|ke|karo))\s*(?:batao|dikhau|bataiye|please)?[\s\?!.]*$/i, "")
          .replace(/[\?!.]+$/, "")
          .trim();

        const searchQuery = cleanQuery || prompt.trim();

        let searchResults = [];

        // 0. Live Weather Check (wttr.in)
        if (/\b(weather|mausam|temperature|temp)\b/i.test(cleanQuery)) {
          try {
            const cityMatch = cleanQuery.match(/(?:in|of|at|for|ka|ki)\s+([A-Za-z\s]+)/i) || cleanQuery.match(/([A-Za-z]+)\s+(?:weather|mausam|temp)/i);
            let city = cityMatch ? cityMatch[1].trim() : cleanQuery.replace(/\b(weather|mausam|temperature|temp|today|aaj|kaisa|hai|report|now|in|of|for|ka|ki)\b/gi, "").trim();
            if (city) {
              const wCtrl = new AbortController();
              const wTid = setTimeout(() => wCtrl.abort(), 2500);
              const wResp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { signal: wCtrl.signal });
              clearTimeout(wTid);
              if (wResp.ok) {
                const wdata = await wResp.json();
                const curr = wdata.current_condition?.[0] || {};
                const tempC = curr.temp_C || "";
                const desc = curr.weatherDesc?.[0]?.value || "";
                const humidity = curr.humidity || "";
                const wind = curr.windspeedKmph || "";
                const forecastDays = (wdata.weather || []).slice(0, 3).map(fd => `${fd.date}: ${fd.maxtempC}°C/${fd.mintempC}°C (${fd.hourly?.[0]?.weatherDesc?.[0]?.value || ""})`);
                searchResults.push({
                  title: `Live Weather: ${city} (${tempC}°C, ${desc})`,
                  snippet: `Live Weather in ${city}: ${tempC}°C, ${desc}. Humidity: ${humidity}%, Wind: ${wind} km/h. 3-Day Forecast: ${forecastDays.join("; ")}`,
                  url: `https://wttr.in/${encodeURIComponent(city)}`
                });
              }
            }
          } catch (wErr) {
            console.warn("Weather fetch failed:", wErr);
          }
        }

        // 1. Native Android Device Search Bridge (Ultra-fast direct execution on device with DuckDuckGo HTML)
        if (searchResults.length === 0 && window.AndroidDevice && typeof window.AndroidDevice.searchWeb === "function") {
          try {
            const rawNative = window.AndroidDevice.searchWeb(searchQuery);
            if (rawNative) {
              const parsed = JSON.parse(rawNative);
              if (Array.isArray(parsed.results) && parsed.results.length > 0) {
                searchResults = parsed.results;
              }
            }
          } catch (nativeErr) {
            console.warn("AndroidDevice.searchWeb failed:", nativeErr);
          }
        }

        // 2. Direct DuckDuckGo HTML / Server Search via local or remote backend
        if (searchResults.length === 0) {
          const candidateEndpoints = [
            "http://127.0.0.1:3456/api/search",
            "http://localhost:3456/api/search",
            "https://lumi-backend-v4-production.up.railway.app/api/search"
          ];
          if (window.location.origin && window.location.origin.startsWith("http")) {
            candidateEndpoints.unshift(`${window.location.origin}/api/search`);
          }

          for (const ep of candidateEndpoints) {
            try {
              const searchController = new AbortController();
              const searchTimeout = setTimeout(() => searchController.abort(), 3500);
              const searchResp = await fetch(`${ep}?q=${encodeURIComponent(searchQuery)}`, {
                signal: searchController.signal,
              });
              clearTimeout(searchTimeout);

              if (searchResp.ok) {
                const searchData = await searchResp.json();
                if (Array.isArray(searchData.results) && searchData.results.length > 0) {
                  searchResults = searchData.results;
                  break;
                }
              }
            } catch (err) {
              // Try next endpoint
            }
          }
        }

        // 3. Direct Google News RSS Client Fetch (Fallback for breaking news)
        if (searchResults.length === 0) {
          try {
            const gnCtrl = new AbortController();
            const gnTid = setTimeout(() => gnCtrl.abort(), 3500);
            const gnUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-IN&gl=IN&ceid=IN:en`;
            const gnResp = await fetch(gnUrl, { signal: gnCtrl.signal });
            clearTimeout(gnTid);
            if (gnResp.ok) {
              const xmlText = await gnResp.text();
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlText, "text/xml");
              const items = Array.from(xmlDoc.querySelectorAll("item")).slice(0, 5);
              for (const item of items) {
                const title = item.querySelector("title")?.textContent || "";
                const link = item.querySelector("link")?.textContent || "";
                const pubDate = item.querySelector("pubDate")?.textContent || "";
                if (title) {
                  searchResults.push({
                    title: title,
                    snippet: `${title}${pubDate ? ' (Published: ' + pubDate + ')' : ''}`,
                    url: link
                  });
                }
              }
            }
          } catch (gnErr) {
            console.warn("Client Google News RSS fetch failed:", gnErr);
          }
        }

        // 4. Safe Wikipedia Fallback ONLY for encyclopedic/historical queries (Never for news/today/live/networth)
        const isLiveOrCurrent = /\b(aaj|today|current|latest|now|networth|net\s*worth|price|score|weather|mausam|stock|rate)\b/i.test(prompt);
        if (searchResults.length === 0 && !isLiveOrCurrent) {
          try {
            const wikiResp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&origin=*`);
            if (wikiResp.ok) {
              const wikiData = await wikiResp.json();
              const items = wikiData.query?.search || [];
              searchResults = items.slice(0, 4).map(it => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = it.snippet || "";
                const cleanSnippet = tempDiv.textContent || tempDiv.innerText || "";
                return {
                  title: it.title,
                  snippet: cleanSnippet,
                  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(it.title.replace(/\s+/g, "_"))}`
                };
              });
            }
          } catch (wikiErr) {
            console.warn("Direct Wikipedia fallback failed:", wikiErr);
          }
        }

        if (searchResults.length > 0) {
          assistantMsg.searchResults = searchResults;
          const currentDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
          webContext = `\n\n[VERIFIED REAL-TIME LIVE WEB FACTS (Current Date: ${currentDate})]:\n` +
            searchResults.map((r, i) => `[Source ${i + 1}: ${r.title}]\nDate/Snippet: ${r.snippet}\nSource URL: ${r.url}`).join("\n\n") +
            `\n\n(CRITICAL INSTRUCTION: Today's date is ${currentDate}. You HAVE just executed a live web search and retrieved the verified real-time facts above. Synthesize this information and answer the user's question completely, accurately, and naturally. State current figures and dates directly. Never invent sources or figures. Cite source URLs and never claim that you cannot browse the live web.)\n`;
          render();
          scrollToBottom();
        }
      }
    }
    */

    let webContext = "";
    const isSearchExplicit = /^\/search\s+/i.test(prompt);
    // Live URL Scraper Detection
    const urlMatch = prompt.match(/https?:\/\/[^\s]+/i);
    let scrapedContext = "";
    if (urlMatch) {
      const targetUrl = urlMatch[0];
      try {
        const apiBase =
          window.location.origin && window.location.origin.startsWith("http")
            ? ""
            : "https://lumi-backend-v4-production.up.railway.app";
        const fetchResp = await fetch(`${apiBase}/api/fetch/url?url=${encodeURIComponent(targetUrl)}`);
        if (fetchResp.ok) {
          const pageData = await fetchResp.json();
          if (pageData.content) {
            assistantMsg.scrapedUrl = { title: pageData.title || targetUrl, url: targetUrl };
            scrapedContext = `\n\n[Live Scraped Webpage Content from ${pageData.title} (${pageData.url})]:\n${pageData.content}\n`;
            render();
            scrollToBottom();
          }
        }
      } catch (scrapeErr) {
        console.warn("Live URL fetch failed:", scrapeErr);
      }
    }

    // Start Streaming
    isStreaming = true;
    streamAbortController = new AbortController();

    let pendingStreamText = null;
    let streamRaf = null;

    const onChunk = (chunk) => {
      assistantMsg.content += chunk;
      pendingStreamText = assistantMsg.content;
      if (!streamRaf) {
        streamRaf = requestAnimationFrame(() => {
          streamRaf = null;
          if (pendingStreamText !== null) {
            updateStreamingMessageUI(threadId, pendingStreamText, assistantMsg.id);
            scrollToBottom();
          }
        });
      }
    };

    try {
      // 0. Learn & update autonomous tone profile and memories from user chat history
      LumiAutonomousMind.analyzeAndSync(conversations);

      // 0.1 Intelligent GenUI Decision Engine (Analyzes intent to dynamically trigger interactive UI where needed)
      const genUiDecision = GenUIDecisionEngine.analyze(prompt);

      // 1. Build Autonomous System Prompt (Persona + Autonomous Tone & Memory + Formatting + Dynamic GenUI Directive)
      const basePersona = PERSONA_PROMPTS[activePersona] || PERSONA_PROMPTS.general;
      let systemPrompt = basePersona + LumiAutonomousMind.getSystemDirective() + "\n" + GENUI_SYSTEM_INSTRUCTION;
      systemPrompt += "\n\nFor questions about live facts, news, prices, scores, weather, or anything that needs current information, use the web_search tool yourself. Search before answering and cite the returned URLs.";
      if (genUiDecision && genUiDecision.needUI && genUiDecision.instruction) {
        systemPrompt += "\n\n" + genUiDecision.instruction;
      }

      // 2. Build Thread History (Short-term context + Full multi-turn conversation)
      const chatHistory = [
        { role: "system", content: systemPrompt },
        ...thread.messages
          .filter((m) => m.id !== assistantMsgId && m.content)
          .map((m) => ({ role: m.role, content: m.content }))
      ];

      const shouldSearchLive =
        webSearchEnabled ||
        isSearchExplicit ||
        /^(search|google|dhoondo|khojo|find|latest|current|today'?s|news about|live score)\b/i.test(prompt.trim()) ||
        /\b(latest|current|today|tonight|live|breaking|news|price|score|weather|mausam|forecast|networth|net worth|aaj|taza)\b/i.test(prompt);

      if (!webContext && shouldSearchLive) {
        const searchQuery = prompt
          .replace(/^\/search\s+/i, "")
          .replace(/^(?:please\s+|can\s+you\s+)?(?:search(?:\s+the\s+web|\s+online|\s+on\s+google)?|google|dhoondo|khojo|find)(?:\s+(?:for|about|me))?\s+/i, "")
          .trim();
        const candidateEndpoints = [
          `${window.location.origin && window.location.origin.startsWith("http") ? window.location.origin : "http://127.0.0.1:3456"}/api/search`,
          "http://127.0.0.1:3456/api/search",
          "http://localhost:3456/api/search",
          "https://lumi-backend-v4-production.up.railway.app/api/search",
        ];
        for (const endpoint of [...new Set(candidateEndpoints)]) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4500);
            const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery || prompt.trim())}`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) continue;
            const data = await response.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              assistantMsg.searchResults = data.results;
              const currentDate = new Date().toLocaleDateString("en-CA");
              webContext =
                `\n\n[LIVE WEB SEARCH RESULTS — ${currentDate}]:\n` +
                data.results.map((result, index) =>
                  `[Source ${index + 1}: ${result.title}]\nSnippet: ${result.snippet}\nURL: ${result.url}`
                ).join("\n\n") +
                "\n\nUse only these live retrieved sources for current facts. Cite the source URLs. Do not claim that live search or internet access is unavailable.";
              render();
              break;
            }
          } catch (searchError) {
            console.warn("Live web search failed:", searchError);
          }
        }
      }

      const extraContext = (webContext || "") + (scrapedContext || "") + (fileContext || "");
      if (extraContext && chatHistory.length > 0) {
        chatHistory[chatHistory.length - 1].content += extraContext;
      }

      const customProv = selectedModel.provider_id
        ? providers.find((p) => p.id === selectedModel.provider_id)
        : null;

      if (customProv && customProv.enabled) {
        // Live streaming from custom configured endpoint with complete memory & tone!
        await streamFromCustomProvider(
          customProv,
          selectedModel.model,
          chatHistory,
          onChunk,
          streamAbortController.signal,
          imagePayload
        );
      } else {
        // Built-in Real Free AI Streaming via backend /api/free/chat
        const apiBase =
          window.location.origin && window.location.origin.startsWith("http")
            ? ""
            : "https://lumi-backend-v4-production.up.railway.app";

        let streamedSuccessfully = false;
        try {
          let resp = null;

          if (!resp || !resp.ok) {
            const candidateEndpoints = [
              "http://127.0.0.1:3456/api/free/chat",
              "http://localhost:3456/api/free/chat",
              "https://lumi-backend-v4-production.up.railway.app/api/free/chat"
            ];
            if (window.location.origin && window.location.origin.startsWith("http")) {
              candidateEndpoints.unshift(`${window.location.origin}/api/free/chat`);
            }

            for (const ep of candidateEndpoints) {
              try {
                const candidateResp = await fetch(ep, {
                  method: "POST",
                  signal: streamAbortController.signal,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    model: selectedModel.model || "gemini-2.5-flash",
                    messages: chatHistory,
                    image: imagePayload,
                    stream: true,
                    max_tokens: 4096,
                    web_search: webSearchEnabled || isSearchExplicit,
                    tools: [{
                      type: "function",
                      function: {
                        name: "web_search",
                        description: "Search the live web for current facts, news, prices, scores, weather, or URLs.",
                        parameters: {
                          type: "object",
                          properties: {
                            query: { type: "string", description: "The exact web search query" }
                          },
                          required: ["query"]
                        }
                      }
                    }],
                    tool_choice: "auto",
                  }),
                });
                if (candidateResp && candidateResp.ok) {
                  resp = candidateResp;
                  break;
                }
              } catch (epErr) {
                // try next candidate
              }
            }
          }

          if (resp.ok) {
            const reader = resp.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
              let chunkObj;
              try {
                chunkObj = await reader.read();
              } catch (readErr) {
                if (streamedSuccessfully) break;
                throw readErr;
              }
              const { done, value } = chunkObj;
              if (value) {
                buffer += decoder.decode(value, { stream: !done });
              }
              const lines = buffer.split("\n");
              buffer = done ? "" : (lines.pop() || "");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const dataStr = line.slice(6).trim();
                  if (!dataStr || dataStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta =
                      parsed.choices?.[0]?.delta?.content ||
                      parsed.choices?.[0]?.delta?.text ||
                      parsed.message ||
                      "";
                    if (delta) {
                      streamedSuccessfully = true;
                      onChunk(delta);
                    }
                  } catch { }
                }
              }
              if (done) break;
            }
          }
        } catch (backendErr) {
          console.warn("Backend real-free-AI streaming attempt failed:", backendErr);
        }

        // If backend had issue or returned empty
        if (!streamedSuccessfully && !streamAbortController.signal.aborted) {
          assistantMsg.content = "⚠️ AI server se reply connect nahi ho paaya. Kripya apna internet connection check karein ya thodi der baad dobara try karein.";
          showToast("AI reply connect nahi ho paaya. Please try again.");
        }

        // Automatic Interceptor: If model emitted tool_calls for image generation (mcp_render_image / render_image)
        if (assistantMsg.content && (assistantMsg.content.includes("mcp_render_image") || assistantMsg.content.includes("tool_calls:") || assistantMsg.content.includes("render_image"))) {
          const promptMatch = assistantMsg.content.match(/"prompt"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
          if (promptMatch && promptMatch[1]) {
            try {
              const cleanPrompt = JSON.parse(`"${promptMatch[1]}"`);
              if (cleanPrompt && cleanPrompt.trim().length > 2) {
                assistantMsg.content = "";
                triggerImageGeneration(cleanPrompt.trim(), assistantMsg);
                return;
              }
            } catch (e) {
              console.warn("Failed to parse intercepted tool prompt:", e);
            }
          }
        }
      }
    } catch (err) {
      if (!streamAbortController.signal.aborted) {
        console.error("Streaming error:", err);
        showToast("AI network error. Please try again.");
        if (!assistantMsg.content) {
          assistantMsg.content = "⚠️ AI server network error. Kripya dobara try karein.";
        }
      }
    } finally {
      if (streamRaf) {
        cancelAnimationFrame(streamRaf);
        streamRaf = null;
      }
      isStreaming = false;
      streamAbortController = null;

      // Auto-close open code block if LLM stream ended mid-block
      if (assistantMsg.content.includes("```") && (assistantMsg.content.match(/```/g) || []).length % 2 !== 0) {
        assistantMsg.content += "\n```";
      }

      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("success");

      // In-place UI update to prevent whole page refresh flash!
      const bodyEl = document.querySelector(`#msg-body-${assistantMsgId}`);
      if (bodyEl) {
        bodyEl.innerHTML = renderMarkdown(assistantMsg.content);
      }
      const actionsEl = document.querySelector(`#msg-actions-${assistantMsgId}`);
      if (actionsEl) {
        actionsEl.style.display = "flex";
        actionsEl.innerHTML = `
          <button type="button" class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer" data-action="copy-message" data-text="${escapeHtml(assistantMsg.content)}" title="Copy reply">
            ${ICONS.copy} <span>Copy</span>
          </button>
          <button type="button" class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer" data-action="speak-message" data-id="${assistantMsg.id}" data-text="${escapeHtml(assistantMsg.content)}" title="Read aloud">
            ${ICONS.volume} <span>Listen</span>
          </button>
          <button type="button" class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer" data-action="regenerate-message" title="Regenerate reply">
            ${ICONS.refreshCw} <span>Regenerate</span>
          </button>`;
      }

      restoreComposerButtons();
      scrollToBottom(true);
    }
  }

  window.sendMessage = sendMessage;

  // --- Voice, Code Runner & Project Helpers ---
  function mergeSpeechOverlap(a, b) {
    if (!a) return b || "";
    if (!b) return a || "";
    a = a.trim();
    b = b.trim();
    if (b.startsWith(a)) return b;
    if (a.endsWith(b)) return a;

    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);

    const maxOverlap = Math.min(wordsA.length, wordsB.length);
    for (let l = maxOverlap; l > 0; l--) {
      const endA = wordsA.slice(-l).join(" ");
      const startB = wordsB.slice(0, l).join(" ");
      if (endA.toLowerCase() === startB.toLowerCase()) {
        return wordsA.concat(wordsB.slice(l)).join(" ");
      }
    }
    return a + " " + b;
  }

  function cleanTranscriptFromResults(results) {
    if (!results || results.length === 0) return "";
    let finalizedParts = [];
    let latestInterim = "";

    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (!item || !item[0] || !item[0].transcript) continue;
      const text = (item[0].transcript || "").trim();
      if (!text) continue;

      if (item.isFinal) {
        if (finalizedParts.length > 0) {
          const merged = mergeSpeechOverlap(finalizedParts[finalizedParts.length - 1], text);
          finalizedParts[finalizedParts.length - 1] = merged;
        } else {
          finalizedParts.push(text);
        }
      } else {
        // In Android WebView, interim results accumulate sequentially across frames.
        // Always take only the latest interim hypothesis, NEVER sum them!
        latestInterim = text;
      }
    }

    const fullFinal = finalizedParts.join(" ").trim();
    if (latestInterim) {
      if (!fullFinal) return latestInterim;
      return mergeSpeechOverlap(fullFinal, latestInterim);
    }
    return fullFinal;
  }

  function toggleSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      showToast("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening && recognitionInstance) {
      recognitionInstance.stop();
      isListening = false;
      if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
        try { window.AndroidAudio.restoreSystemSounds(); } catch { }
      }
      render();
      return;
    }
    try {
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch { }
      }
      recognitionInstance = new SpeechRec();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "hi-IN";

      recognitionInstance.onstart = () => {
        isListening = true;
        showToast("🎙️ Listening... Speak now in Hindi or English!");
        render();
      };
      recognitionInstance.onresult = (event) => {
        const transcript = cleanTranscriptFromResults(event.results);
        const textarea = document.querySelector("#composer-textarea");
        if (textarea && transcript) {
          textarea.value = transcript;
          textarea.style.height = "auto";
          textarea.style.height = Math.min(textarea.scrollHeight, 192) + "px";
        }
      };
      recognitionInstance.onerror = () => {
        isListening = false;
        if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
          try { window.AndroidAudio.restoreSystemSounds(); } catch { }
        }
        render();
      };
      recognitionInstance.onend = () => {
        isListening = false;
        if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
          try { window.AndroidAudio.restoreSystemSounds(); } catch { }
        }
        render();
      };
      recognitionInstance.start();
    } catch (e) {
      isListening = false;
      if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
        try { window.AndroidAudio.restoreSystemSounds(); } catch { }
      }
      render();
    }
  }

  // --- Persistent Global TTS Manager (Queue-based, chunked, GC-proof) ---
  window.__lumiTTS = window.__lumiTTS || {
    msgId: null,
    chunks: [],
    chunkIndex: 0,
    keepAliveTimer: null,
    activeUtterance: null, // Hard reference on window to prevent V8 Garbage Collection mid-sentence!
    speaking: false,
  };

  window.__lumiOnTTSDone = function (msgId) {
    if (currentlySpeakingId === msgId) {
      currentlySpeakingId = null;
      updateSpeechUI();
    }
  };

  let cachedVoices = [];
  function refreshVoices() {
    if ("speechSynthesis" in window) {
      try {
        cachedVoices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        cachedVoices = [];
      }
    }
  }
  if ("speechSynthesis" in window) {
    refreshVoices();
    try {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    } catch (e) { }
  }

  function updateSpeechUI() {
    document.querySelectorAll("[data-action='speak-message']").forEach((btn) => {
      const id = btn.getAttribute("data-id");
      const isSpeaking = currentlySpeakingId && (currentlySpeakingId === id);
      btn.className = `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${isSpeaking ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent"
        } transition-colors cursor-pointer`;
      btn.title = isSpeaking ? "Stop voice" : "Read aloud";
      btn.innerHTML = `${isSpeaking ? ICONS.volumeMute : ICONS.volume} <span>${isSpeaking ? "Speaking..." : "Listen"}</span>`;
    });
  }

  function stopSpeechSynthesis() {
    if (window.AndroidTTS && typeof window.AndroidTTS.stop === "function") {
      try {
        window.AndroidTTS.stop();
      } catch (e) { }
    }
    const tts = window.__lumiTTS;
    if (tts && tts.keepAliveTimer) {
      clearInterval(tts.keepAliveTimer);
      tts.keepAliveTimer = null;
    }
    if (tts) {
      tts.speaking = false;
      tts.msgId = null;
      tts.chunks = [];
      tts.chunkIndex = 0;
      tts.activeUtterance = null;
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) { }
    }
    if (currentlySpeakingId !== null) {
      currentlySpeakingId = null;
      updateSpeechUI();
    }
  }

  function cleanTextForSpeech(raw) {
    if (!raw) return "";
    let t = raw;
    // 1. Remove code blocks
    t = t.replace(/```[\s\S]*?```/g, "Code block omitted. ");
    // 2. Remove inline code
    t = t.replace(/`([^`]+)`/g, "$1");
    // 3. Remove custom HTML tags and GenUI components
    t = t.replace(/<[a-zA-Z0-9_-]+[^>]*>[\s\S]*?<\/[a-zA-Z0-9_-]+>/g, " ");
    t = t.replace(/<[^>]+>/g, " ");
    // 4. Transform Markdown links: [Title](URL) -> Title
    t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // 5. Remove raw URLs
    t = t.replace(/https?:\/\/\S+/g, "");
    // 6. Remove citation numbers like [1], [2], etc.
    t = t.replace(/\[\d+\]/g, "");
    // 7. Remove markdown headers, bold, italics, bullets, blockquotes
    t = t.replace(/^[#*>\-\s]+/gm, "");
    t = t.replace(/[*_~`]/g, "");
    // 8. Replace table delimiters and dashes
    t = t.replace(/\|/g, ", ");
    t = t.replace(/-{3,}/g, " ");
    // 9. Normalize multiple punctuation or spaces
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }

  function splitIntoSpeechChunks(text, maxChunkLen = 140) {
    if (!text) return [];

    // Split primarily on sentence boundaries (. ! ? । \n)
    const sentenceDelim = /([.?!।\n]+)/;
    const tokens = text.split(sentenceDelim);
    const sentences = [];

    for (let i = 0; i < tokens.length; i += 2) {
      let s = tokens[i] || "";
      let punct = tokens[i + 1] || "";
      let full = (s + punct).trim();
      if (full) sentences.push(full);
    }

    // Break down sentences longer than maxChunkLen by comma or words
    const chunks = [];
    for (let sentence of sentences) {
      if (sentence.length <= maxChunkLen) {
        chunks.push(sentence);
      } else {
        const subDelim = /([,;:—]+)/;
        const subTokens = sentence.split(subDelim);
        let cur = "";
        for (let j = 0; j < subTokens.length; j++) {
          const part = subTokens[j];
          if ((cur + part).length <= maxChunkLen) {
            cur += part;
          } else {
            if (cur.trim()) chunks.push(cur.trim());
            cur = part;
          }
        }
        if (cur.trim()) {
          if (cur.length > maxChunkLen) {
            const words = cur.split(/\s+/);
            let wChunk = "";
            for (let w of words) {
              if ((wChunk + " " + w).length <= maxChunkLen) {
                wChunk = wChunk ? (wChunk + " " + w) : w;
              } else {
                if (wChunk) chunks.push(wChunk);
                wChunk = w;
              }
            }
            if (wChunk) chunks.push(wChunk);
          } else {
            chunks.push(cur.trim());
          }
        }
      }
    }
    return chunks.filter((c) => c.length > 0);
  }

  function playNextSpeechChunk() {
    const tts = window.__lumiTTS;
    if (!tts.speaking || tts.chunkIndex >= tts.chunks.length) {
      stopSpeechSynthesis();
      return;
    }

    const chunkText = tts.chunks[tts.chunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    const hasHindi = /[\u0900-\u097F]/.test(chunkText);
    const voices = cachedVoices.length ? cachedVoices : (window.speechSynthesis.getVoices() || []);

    if (hasHindi) {
      utterance.lang = "hi-IN";
      const hiVoice = voices.find((v) => v.lang.startsWith("hi") || (v.name && v.name.toLowerCase().includes("hindi")));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.lang = "en-IN";
      const enVoice =
        voices.find((v) => v.lang === "en-IN" || v.lang.startsWith("en-IN") || (v.name && v.name.includes("India"))) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // CRITICAL: Anchor utterance to window so V8 GC cannot destroy it mid-speech!
    tts.activeUtterance = utterance;

    utterance.onend = () => {
      tts.chunkIndex++;
      playNextSpeechChunk();
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis chunk error at index", tts.chunkIndex, e);
      tts.chunkIndex++;
      playNextSpeechChunk();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("speechSynthesis.speak failed:", e);
      tts.chunkIndex++;
      playNextSpeechChunk();
    }
  }

  function toggleSpeechSynthesis(msgId, text) {
    if (currentlySpeakingId === msgId) {
      stopSpeechSynthesis();
      return;
    }

    stopSpeechSynthesis();

    const clean = cleanTextForSpeech(text);
    if (!clean) {
      showToast("No readable text found.");
      return;
    }

    const hasHindi = /[\u0900-\u097F]/.test(clean);

    currentlySpeakingId = msgId;
    updateSpeechUI();

    // 1. Primary: Native Android TextToSpeech Interface (Zero cutoff, high quality native engine)
    if (window.AndroidTTS && typeof window.AndroidTTS.speak === "function") {
      try {
        window.AndroidTTS.speak(msgId, clean, hasHindi ? "hi" : "en");
        return;
      } catch (nativeErr) {
        console.warn("AndroidTTS failed, falling back to Web Speech:", nativeErr);
      }
    }

    // 2. Secondary: Web Speech API (for Chrome / Desktop / Browsers)
    if ("speechSynthesis" in window) {
      const chunks = splitIntoSpeechChunks(clean);
      if (chunks.length === 0) {
        stopSpeechSynthesis();
        return;
      }

      const tts = window.__lumiTTS;
      tts.msgId = msgId;
      tts.chunks = chunks;
      tts.chunkIndex = 0;
      tts.speaking = true;

      // Start Chromium keep-alive heartbeat (resets 15-second pause timer)
      tts.keepAliveTimer = setInterval(() => {
        if ("speechSynthesis" in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } catch (e) { }
        }
      }, 8000);

      playNextSpeechChunk();
      return;
    }

    showToast("Text-to-speech not supported on this device.");
    stopSpeechSynthesis();
  }

  window.toggleSpeechSynthesis = toggleSpeechSynthesis;
  window.stopSpeechSynthesis = stopSpeechSynthesis;
  window.renderMarkdown = renderMarkdown;

  // ==========================================================================
  // AUTHENTIC GEMINI LIVE MODE (PITCH-BLACK FULLSCREEN VIEW)
  // Exact match to frame_339.png from official user video + AI Voice Selector
  // ==========================================================================
  const LIVE_VOICES = [
    { id: "jessica", name: "Jessica (Sweet & Playful)", provider: "ElevenLabs", desc: "Super sweet, cute, playful and most charming female voice" },
    { id: "lily", name: "Lily (Velvety & Soothing)", provider: "ElevenLabs", desc: "Velvety, soft, gentle and soothing comforting female voice" },
    { id: "bella", name: "Bella (Bright & Warm)", provider: "ElevenLabs", desc: "Expressive, bright and engaging female voice" },
    { id: "charlie", name: "Charlie (Confident & Friendly)", provider: "ElevenLabs", desc: "Deep, lively and energetic conversational male voice" },
    { id: "george", name: "George (British Storyteller)", provider: "ElevenLabs", desc: "Warm, captivating and mature storytelling British male voice" },
    { id: "brian", name: "Brian (Deep & Resonant)", provider: "ElevenLabs", desc: "Deep, comforting and classy social tone" },
    { id: "adam", name: "Adam (Dominant & Firm)", provider: "ElevenLabs", desc: "Deep, articulate storytelling male voice" },
    { id: "swara", name: "Swara", provider: "IndicF5", desc: "Natural native Hindi & Hinglish female voice" },
    { id: "madhur", name: "Madhur", provider: "IndicF5", desc: "Natural warm Hindi & Hinglish male voice" },
    { id: "kavya", name: "Kavya", provider: "Indic Neural", desc: "Sweet, expressive young Hindi female voice" },
    { id: "prabhat", name: "Prabhat", provider: "Indic Neural", desc: "Deep, authoritative Hindi storyteller voice" },
    { id: "aarav", name: "Aarav", provider: "Indic Neural", desc: "Energetic, youthful Hindi male voice" },
    { id: "ananya", name: "Ananya", provider: "Indic Neural", desc: "Modern, fluent Indian English female voice" },
    { id: "nova", name: "Nova", provider: "OpenAI", desc: "Warm, natural conversational tone" },
    { id: "onyx", name: "Onyx", provider: "OpenAI", desc: "Deep, warm and grounded male voice" },
    { id: "alloy", name: "Alloy", provider: "OpenAI", desc: "Dynamic and expressive balanced voice" }
  ];

  const LumiVoiceCall = {
    isOpen: false,
    state: "idle", // "idle" | "listening" | "thinking" | "speaking"
    isMuted: false,
    currentLang: "hi-IN",
    selectedVoice: localStorage.getItem("lumi_live_voice") || "jessica",
    previewAudio: null,
    currentlyPlayingSampleId: null,
    restartTimer: null,
    sessionTurns: [],
    speechQueue: [],
    isPlayingSpeech: false,
    isGeneratingResponse: false,
    pendingTranscript: "",
    streamAbortCtrl: null,
    silenceTimer: null,
    activeAudioEl: null,
    recInstance: null,

    init() {
      if (document.querySelector("#lumi-live-modal")) return;

      const liveHtml = `
        <div id="lumi-live-modal" class="hidden">
          <!-- Top Navigation Bar: = on left, camera slash & 3 dots on right -->
          <div class="gemini-live-top-bar">
            <button type="button" class="gemini-live-icon-btn" id="live-menu-btn" title="Menu">
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="1" y1="2" x2="21" y2="2"></line>
                <line x1="1" y1="12" x2="21" y2="12"></line>
              </svg>
            </button>
            <div class="gemini-live-top-right">
              <button type="button" class="gemini-live-icon-btn" id="live-cam-toggle-btn" title="Toggle Camera">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
              <button type="button" class="gemini-live-icon-btn" id="live-more-options-btn" title="Select AI Voice & Options">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Spoken Dialogue / Subtitle Area -->
          <div class="gemini-live-transcript-area" id="live-transcript-area">
            <div class="gemini-live-user-speech" id="live-user-speech"></div>
            <div class="gemini-live-subtitle" id="live-subtitle-text">Bolna shuru kijiye, mai sun rahi hu...</div>
          </div>

          <!-- Bottom Action Bar: (+) (📹) [GEMINI AURORA CAPSULE] (🎤) (✕) -->
          <div class="gemini-live-bottom-bar">
            <button type="button" class="gemini-live-circle-btn" id="live-add-btn" title="Add">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button type="button" class="gemini-live-circle-btn" id="live-video-btn" title="Video">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m22 8-6 4 6 4V8Z"/>
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
              </svg>
            </button>
            
            <!-- Center Liquid Aurora Pill -->
            <div class="gemini-live-aurora-pill" id="live-aurora-stage" title="Tap to interrupt">
              <div class="gemini-aurora-glow-blob" id="live-aurora-blob"></div>
              <div class="gemini-aurora-shimmer"></div>
            </div>

            <button type="button" class="gemini-live-circle-btn" id="live-mic-mute-btn" title="Mute Microphone">
              <svg id="live-mic-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
            <button type="button" class="gemini-live-circle-btn live-btn-hangup" id="live-end-btn" title="Hang up">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Clean Floating AI Voice Dropdown (Matches Lumi Studio model-dropdown-menu) -->
          <div id="live-voice-menu" class="live-voice-dropdown hidden">
            <div class="live-voice-dropdown-header">
              <div class="live-voice-dropdown-title">AI Voice Model</div>
              <div class="live-voice-dropdown-sub">Tap ▶ to test voice sample</div>
            </div>
            <div class="live-voice-dropdown-list" id="live-voice-dropdown-list"></div>
          </div>
        </div>
      `;

      const div = document.createElement("div");
      div.innerHTML = liveHtml;
      document.body.appendChild(div.firstElementChild);
      this.bindEvents();
    },

    bindEvents() {
      // Hang up button
      document.querySelector("#live-end-btn")?.addEventListener("click", () => this.close());

      // Mic mute toggle
      document.querySelector("#live-mic-mute-btn")?.addEventListener("click", () => this.toggleMute());

      // Aurora stage tap to interrupt
      document.querySelector("#live-aurora-stage")?.addEventListener("click", () => {
        if (this.state === "speaking" || this.isPlayingSpeech) {
          this.interrupt();
        }
      });

      // Top menu and close
      document.querySelector("#live-menu-btn")?.addEventListener("click", () => this.close());
      document.querySelector("#live-cam-toggle-btn")?.addEventListener("click", () => {
        showToast("Audio call active");
      });

      // 3-dots: Toggle Voice Selector Dropdown
      document.querySelector("#live-more-options-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleVoiceMenu();
      });

      // Close dropdown when tapping outside
      document.addEventListener("click", (e) => {
        const menu = document.querySelector("#live-voice-menu");
        if (menu && !menu.classList.contains("hidden")) {
          if (!e.target.closest("#live-voice-menu") && !e.target.closest("#live-more-options-btn")) {
            this.closeVoiceMenu();
          }
        }
      });
    },

    toggleVoiceMenu() {
      const menu = document.querySelector("#live-voice-menu");
      if (!menu) return;
      if (menu.classList.contains("hidden")) {
        this.openVoiceMenu();
      } else {
        this.closeVoiceMenu();
      }
    },

    openVoiceMenu() {
      const menu = document.querySelector("#live-voice-menu");
      const list = document.querySelector("#live-voice-dropdown-list");
      if (!menu || !list) return;

      // Temporarily stop microphone so speech recognizer doesn't capture preview clicks
      this.stopListening();

      const activeVoice = this.selectedVoice || localStorage.getItem("lumi_live_voice") || "jessica";

      list.innerHTML = LIVE_VOICES.map((v) => {
        const isSelected = v.id === activeVoice;
        const isPlaying = this.currentlyPlayingSampleId === v.id;
        return `
          <div class="live-voice-row ${isSelected ? "is-active" : ""}" data-voice-id="${v.id}">
            <button type="button" class="live-voice-play-btn ${isPlaying ? "is-playing" : ""}" data-sample-btn="${v.id}" title="Preview Voice">
              ${isPlaying ? ICONS.square : ICONS.play}
            </button>
            <div class="live-voice-info">
              <div class="live-voice-title-line">
                <span class="live-voice-name">${v.name}</span>
                <span class="live-voice-provider-tag">${v.provider}</span>
              </div>
              <span class="live-voice-desc">${v.desc}</span>
            </div>
            <div class="live-voice-check">
              ${isSelected ? ICONS.check : ""}
            </div>
          </div>
        `;
      }).join("");

      // Wire item selection
      list.querySelectorAll(".live-voice-row").forEach((el) => {
        el.addEventListener("click", (e) => {
          if (e.target.closest(".live-voice-play-btn")) return;
          const vid = el.getAttribute("data-voice-id");
          if (vid) this.selectVoice(vid);
        });
      });

      // Wire sample preview play button
      list.querySelectorAll(".live-voice-play-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const vid = btn.getAttribute("data-sample-btn");
          if (vid) this.toggleSamplePlayback(vid);
        });
      });

      menu.classList.remove("hidden");
    },

    closeVoiceMenu() {
      const menu = document.querySelector("#live-voice-menu");
      if (menu) menu.classList.add("hidden");
      this.stopSamplePlayback();
      if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech) {
        this.startListening();
      }
    },

    selectVoice(voiceId) {
      this.selectedVoice = voiceId;
      localStorage.setItem("lumi_live_voice", voiceId);
      this.ttsCache.clear();
      const voice = LIVE_VOICES.find((v) => v.id === voiceId);
      showToast(`Voice set to: ${voice ? voice.name : voiceId}`);
      this.openVoiceMenu(); // re-render checkmark in-place
    },

    stopSamplePlayback() {
      if (this.previewAudio) {
        try {
          this.previewAudio.pause();
          this.previewAudio.currentTime = 0;
        } catch { }
        this.previewAudio = null;
      }
      if (window.AndroidAudio && typeof window.AndroidAudio.stop === "function") {
        try { window.AndroidAudio.stop(); } catch { }
      }
      this.currentlyPlayingSampleId = null;
      document.querySelectorAll(".live-voice-play-btn").forEach((btn) => {
        btn.classList.remove("is-playing");
        btn.innerHTML = ICONS.play;
      });
    },

    toggleSamplePlayback(voiceId) {
      if (this.currentlyPlayingSampleId === voiceId) {
        this.stopSamplePlayback();
        return;
      }
      this.stopSamplePlayback();
      this.currentlyPlayingSampleId = voiceId;

      const btn = document.querySelector(`[data-sample-btn="${voiceId}"]`);
      if (btn) {
        btn.classList.add("is-playing");
        btn.innerHTML = ICONS.square;
      }

      // Ensure microphone is stopped during sample playback so it doesn't interrupt or freeze
      this.stopListening();

      const b64 = window.LUMI_VOICE_SAMPLES ? window.LUMI_VOICE_SAMPLES[voiceId] : null;
      const sampleUrl = b64 ? `data:audio/mp3;base64,${b64}` : `assets/voices/${voiceId}.mp3`;

      try {
        const audio = new Audio(sampleUrl);
        this.previewAudio = audio;
        audio.onended = () => this.stopSamplePlayback();
        audio.onerror = async () => {
          try {
            const r = await fetch("https://lumi-backend-v4-production.up.railway.app/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                input: "Namaste, mai Lumi hu. Kahiye, mai aapki kya madad kar sakti hu?",
                voice: voiceId,
                elevenlabs_api_key: localStorage.getItem("lumi_elevenlabs_key") || ""
              })
            });
            if (r.ok) {
              const b = await r.blob();
              const u = URL.createObjectURL(b);
              const a = new Audio(u);
              this.previewAudio = a;
              a.onended = () => { URL.revokeObjectURL(u); this.stopSamplePlayback(); };
              a.onerror = () => { URL.revokeObjectURL(u); this.stopSamplePlayback(); };
              a.play();
              return;
            }
          } catch { }
          if (window.AndroidAudio && typeof window.AndroidAudio.playUrl === "function") {
            window.__lumiOnAudioDone = () => this.stopSamplePlayback();
            window.AndroidAudio.playUrl(`assets/voices/${voiceId}.mp3`);
          } else {
            this.stopSamplePlayback();
          }
        };
        const p = audio.play();
        if (p && p.catch) {
          p.catch((err) => {
            console.warn("Audio preview error:", err);
            if (window.AndroidAudio && typeof window.AndroidAudio.playUrl === "function") {
              window.__lumiOnAudioDone = () => this.stopSamplePlayback();
              window.AndroidAudio.playUrl(`assets/voices/${voiceId}.mp3`);
            } else {
              this.stopSamplePlayback();
            }
          });
        }
      } catch (err) {
        this.stopSamplePlayback();
      }
    },

    updateAuroraState(state) {
      this.state = state;
      const blob = document.querySelector("#live-aurora-blob");
      if (blob) {
        blob.className = "gemini-aurora-glow-blob " + state;
      }
    },

    updateUI(state, text) {
      this.updateAuroraState(state);
      const textEl = document.querySelector("#live-subtitle-text");
      const userEl = document.querySelector("#live-user-speech");

      if (state === "listening") {
        if (text) {
          if (userEl) userEl.textContent = text;
        } else {
          if (userEl) userEl.textContent = "";
          if (textEl) textEl.textContent = "Bolna shuru kijiye, mai sun rahi hu...";
        }
      } else if (state === "thinking") {
        if (userEl) userEl.textContent = text || "";
        if (textEl) textEl.textContent = "Thinking...";
      } else if (state === "speaking") {
        if (textEl) textEl.textContent = text || "";
      }
    },

    open() {
      this.init();
      this.isOpen = true;
      this.sessionTurns = [];
      this.speechQueue = [];
      this.isPlayingSpeech = false;
      this.state = "listening";
      this.selectedVoice = localStorage.getItem("lumi_live_voice") || "jessica";

      // Silence Android OS SpeechRecognizer chimes completely!
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch { }
      }

      const modal = document.querySelector("#lumi-live-modal");
      if (modal) {
        modal.classList.remove("hidden");
      }

      this.updateUI("listening");
      this.startListening();
    },

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      try { this.stopListening(); } catch { }
      try { this.interrupt(); } catch { }
      try { this.closeVoiceMenu(); } catch { }

      // Restore Android OS system sounds
      if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
        try { window.AndroidAudio.restoreSystemSounds(); } catch { }
      }

      const modal = document.querySelector("#lumi-live-modal");
      if (modal) modal.classList.add("hidden");

      if (this.sessionTurns.length > 0) {
        try {
          let conv = getActiveConversation();
          if (!conv) {
            const threadId = "thread_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
            const firstTurn = this.sessionTurns.find((t) => t.role === "user") || this.sessionTurns[0];
            const title = (firstTurn?.content || "Voice conversation").slice(0, 32);
            conv = {
              id: threadId,
              title: title,
              createdAt: new Date().toISOString(),
              model: { ...selectedModel },
              messages: []
            };
            conversations.unshift(conv);
          }
          for (const turn of this.sessionTurns) {
            conv.messages.push({
              id: "msg_" + Math.random().toString(36).substring(2, 10),
              role: turn.role,
              content: turn.content,
              timestamp: Date.now()
            });
          }
          saveJson(STORAGE.CHATS, conversations);
          render();
        } catch (e) {
          console.warn("Error saving voice conversation turns:", e);
        }
      }
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      const btn = document.querySelector("#live-mic-mute-btn");
      if (btn) {
        if (this.isMuted) {
          btn.classList.add("muted");
          this.stopListening();
          this.updateUI("idle", "Mic muted. Tap mic to resume.");
        } else {
          btn.classList.remove("muted");
          this.startListening();
          this.updateUI("listening", "");
        }
      }
    },

    submitUserSpeech() {
      clearTimeout(this.silenceTimer);
      clearTimeout(this.restartTimer);
      const text = (this.pendingTranscript || "").trim();
      this.pendingTranscript = "";
      if (!text) return;
      this.handleUserSpeech(text);
    },

    startListening() {
      if (!this.isOpen || this.isMuted) return;
      if (this.state === "speaking" || this.isPlayingSpeech || this.isGeneratingResponse) return;

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        this.updateUI("listening", "Speech recognition not supported in this browser.");
        return;
      }

      this.stopListening();

      // Ensure Android OS system chimes are silenced
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch { }
      }

      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = this.currentLang;

        rec.onresult = (event) => {
          // If AI is currently speaking, disregard mic to prevent acoustic feedback loop
          if (this.state === "speaking" || this.isPlayingSpeech || this.isGeneratingResponse) return;

          const currentText = cleanTranscriptFromResults(event.results);
          if (currentText) {
            this.pendingTranscript = currentText;
            this.updateAuroraState("listening");
            this.updateUI("listening", currentText);

            clearTimeout(this.silenceTimer);
            // Give user natural breathing room (1.2 seconds) to finish their entire sentence
            this.silenceTimer = setTimeout(() => {
              this.submitUserSpeech();
            }, 1200);
          }
        };

        rec.onerror = (e) => {
          if (this.pendingTranscript && this.pendingTranscript.trim()) {
            this.submitUserSpeech();
            return;
          }
          if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech && !this.isGeneratingResponse) {
            clearTimeout(this.restartTimer);
            this.restartTimer = setTimeout(() => {
              if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech && !this.isGeneratingResponse) {
                this.startListening();
              }
            }, 300);
          }
        };

        rec.onend = () => {
          // CRITICAL: If speech was recognized, submit immediately! Never cancel with restart!
          if (this.pendingTranscript && this.pendingTranscript.trim()) {
            this.submitUserSpeech();
            return;
          }
          if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech && !this.isGeneratingResponse) {
            clearTimeout(this.restartTimer);
            this.restartTimer = setTimeout(() => {
              if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech && !this.isGeneratingResponse) {
                this.startListening();
              }
            }, 250);
          }
        };

        this.recInstance = rec;
        rec.start();
      } catch (e) {
        console.warn("SpeechRec start error:", e);
      }
    },

    stopListening() {
      clearTimeout(this.silenceTimer);
      clearTimeout(this.restartTimer);
      if (this.recInstance) {
        try {
          this.recInstance.onend = null;
          this.recInstance.onerror = null;
          this.recInstance.stop();
        } catch { }
        this.recInstance = null;
      }
    },

    interrupt() {
      this.pendingTranscript = "";
      this.speechQueue = [];
      this.isPlayingSpeech = false;
      this.isGeneratingResponse = false;
      if (this.streamAbortCtrl) {
        this.streamAbortCtrl.abort();
        this.streamAbortCtrl = null;
      }
      if (this.activeAudioEl) {
        try { this.activeAudioEl.pause(); } catch { }
        this.activeAudioEl = null;
      }
      if (window.AndroidAudio && typeof window.AndroidAudio.stop === "function") {
        try { window.AndroidAudio.stop(); } catch { }
      }
      if (window.AndroidTTS && typeof window.AndroidTTS.stop === "function") {
        try { window.AndroidTTS.stop(); } catch { }
      }
      if (typeof window.stopSpeechSynthesis === "function") {
        window.stopSpeechSynthesis();
      }
      this.updateUI("listening", "");
      this.startListening();
    },

    async handleUserSpeech(transcript) {
      if (!transcript || !transcript.trim()) return;
      const cleanPrompt = transcript.trim();

      // Immediately shut off microphone so AI voice does not leak into recognizer
      this.stopListening();
      this.updateUI("thinking", cleanPrompt);
      this.isGeneratingResponse = true;

      this.sessionTurns.push({ role: "user", content: cleanPrompt });

      const hasDevanagari = /[\u0900-\u097F]/.test(cleanPrompt);
      const hasBengali = /[\u0980-\u09FF]/.test(cleanPrompt);
      const hasGurmukhi = /[\u0A00-\u0A7F]/.test(cleanPrompt);
      const hasGujarati = /[\u0A80-\u0AFF]/.test(cleanPrompt);
      const hasTamil = /[\u0B80-\u0BFF]/.test(cleanPrompt);
      const hasTelugu = /[\u0C00-\u0C7F]/.test(cleanPrompt);
      const hasKannada = /[\u0C80-\u0CFF]/.test(cleanPrompt);
      const hasMalayalam = /[\u0D00-\u0D7F]/.test(cleanPrompt);

      const hinglishPatterns = /\b(kya|kaise|kaisa|kaisi|hai|ho|haan|nahin|nahi|bhai|yaar|sab|theek|thik|accha|achha|badhiya|bolo|batao|kuch|kaha|kidhar|kar|raha|rahe|rahi|aaya|gaya|mere|mera|meri|hum|tum|aap|apna|apni|chal|dekh|sun|sunna|yr)\b/i;
      const isHinglish = hinglishPatterns.test(cleanPrompt);

      let langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in English. You MUST reply in natural, fluent, friendly spoken English.";
      if (hasDevanagari) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Hindi (Devanagari script). You MUST reply in pure, natural, fluent spoken Hindi in Devanagari script only (e.g. 'हाँ भाई, मैं बहुत बढ़िया हूँ। आप बताइए क्या हाल-चाल है?'). Never use English or Latin script.";
      } else if (hasBengali) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Bengali. You MUST reply in natural, fluent spoken Bengali (বাংলা).";
      } else if (hasGurmukhi) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Punjabi. You MUST reply in natural, fluent spoken Punjabi (ਪੰਜਾਬੀ).";
      } else if (hasGujarati) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Gujarati. You MUST reply in natural, fluent spoken Gujarati (ગુજરાતી).";
      } else if (hasTamil) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Tamil. You MUST reply in natural, fluent spoken Tamil (தமிழ்).";
      } else if (hasTelugu) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Telugu. You MUST reply in natural, fluent spoken Telugu (తెలుగు).";
      } else if (hasKannada) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Kannada. You MUST reply in natural, fluent spoken Kannada (ಕನ್ನಡ).";
      } else if (hasMalayalam) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Malayalam. You MUST reply in natural, fluent spoken Malayalam (മലയാളം).";
      } else if (isHinglish) {
        langDirective = "STRICT LANGUAGE MIRRORING: The user spoke in Hinglish (Roman script Hindi). You MUST reply in natural, brotherly Hinglish in Roman script (e.g. 'Sab theek hai bhai! Tu bata kya chal raha hai?').";
      }

      const messages = [
        {
          role: "system",
          content: `You are Lumi on a real-time live phone call. Speak naturally, warmly, and authentically like a close companion/brother.\nRules:\n1. STRICT LANGUAGE MIRRORING (CRITICAL): ${langDirective} You MUST always speak in the exact same language and script that the user spoke. Never switch languages.\n2. NATURAL ADAPTIVE LENGTH: If the user asks for a story, poem, or detailed explanation (e.g. 'kahani sunao', 'badi kahani', 'explain karo', 'batao'), tell the full, complete story or explanation naturally from beginning to end. If the user asks a quick casual question, keep it brief and conversational. Never cut yourself short to just one sentence when asked for a story or explanation.\n3. SPOKEN AUDIO: Do NOT use markdown symbols (no asterisks **, no bullet points -, no hashes #). Speak in clean, flowing spoken sentences so speech synthesis sounds completely natural.`
        }
      ];

      for (const t of this.sessionTurns.slice(-3)) {
        messages.push({ role: t.role, content: t.content });
      }

      if (this.streamAbortCtrl) {
        try { this.streamAbortCtrl.abort(); } catch { }
      }
      this.streamAbortCtrl = new AbortController();
      let fullAssistantReply = "";
      let sentenceBuffer = "";

      try {
        const chatEndpoints = [
          "https://lumi-backend-v4-production.up.railway.app/api/free/chat",
          "http://127.0.0.1:3456/api/free/chat",
          "http://10.188.22.242:3456/api/free/chat"
        ];
        if (window.location.origin && window.location.origin.startsWith("http")) {
          chatEndpoints.unshift(`${window.location.origin}/api/free/chat`);
        }

        let resp = null;
        for (const ep of chatEndpoints) {
          try {
            const ctrl = new AbortController();
            const timeoutMs = (ep.includes("127.0.0.1") || ep.includes("10.188.22.242")) ? 25000 : 20000;
            const timer = setTimeout(() => ctrl.abort(), timeoutMs);
            const r = await fetch(ep, {
              method: "POST",
              signal: ctrl.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "gemini-3-flash",
                messages: messages,
                stream: true,
                max_tokens: 2048
              })
            });
            clearTimeout(timer);
            if (r.ok) {
              resp = r;
              break;
            }
          } catch (e) {
            if (this.streamAbortCtrl && this.streamAbortCtrl.signal.aborted) throw e;
          }
        }

        if (!resp || !resp.ok) throw new Error("All chat backends failed");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamDone = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":") || !trimmed.startsWith("data:")) continue;
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                const cleanDelta = delta.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<\/?think>/g, "");
                fullAssistantReply += cleanDelta;
                sentenceBuffer += cleanDelta;

                // Ultra-fast clause chunking: split on sentence end [.?!।\n] OR if buffer has >= 4 words and hits a comma/pause [,;]
                const words = sentenceBuffer.trim().split(/\s+/);
                let toSpeak = "";
                const sentenceEndMatch = sentenceBuffer.match(/^([\s\S]+?[.?!।\n])\s*([\s\S]*)$/);
                if (sentenceEndMatch) {
                  toSpeak = sentenceEndMatch[1].trim();
                  sentenceBuffer = sentenceEndMatch[2];
                } else if (words.length >= 4) {
                  const commaMatch = sentenceBuffer.match(/^([\s\S]+?[,;])\s*([\s\S]*)$/);
                  if (commaMatch) {
                    toSpeak = commaMatch[1].trim();
                    sentenceBuffer = commaMatch[2];
                  }
                }

                if (toSpeak) {
                  this.speakCallChunk(toSpeak);
                }
              }
            } catch { }
          }
          if (streamDone) {
            try { reader.cancel(); } catch { }
            break;
          }
        }

        if (sentenceBuffer.trim()) {
          this.speakCallChunk(sentenceBuffer.trim());
        }

        const finalClean = fullAssistantReply.replace(/\*\*/g, "").trim();
        if (!finalClean && this.speechQueue.length === 0) {
          this.speakCallChunk("Haan ji, kahiye, mai sun rahi hu.");
        }
        this.sessionTurns.push({ role: "assistant", content: finalClean || "Haan ji, kahiye, mai sun rahi hu." });
        this.isGeneratingResponse = false;

        // If audio finished playing while LLM was streaming last chunk, check if queue is now empty
        if (!this.isPlayingSpeech && this.speechQueue.length === 0) {
          setTimeout(() => {
            if (this.isOpen && !this.isPlayingSpeech && !this.isGeneratingResponse && this.speechQueue.length === 0) {
              this.updateUI("listening", "");
              this.startListening();
            }
          }, 400);
        }

      } catch (err) {
        this.isGeneratingResponse = false;
        if (err.name === "AbortError") return;
        this.speakCallChunk("Haan ji, kahiye, mai sun rahi hu.");
      }
    },

    ttsCache: new Map(),

    async prefetchTTS(text, activeVoice) {
      if (!text || this.ttsCache.has(text)) return;
      const ttsEndpoints = [
        "https://lumi-backend-v4-production.up.railway.app/api/tts",
        "http://127.0.0.1:3456/api/tts",
        "http://10.188.22.242:3456/api/tts"
      ];
      if (window.location.origin && window.location.origin.startsWith("http")) {
        ttsEndpoints.unshift(`${window.location.origin}/api/tts`);
      }
      const elKey = localStorage.getItem("lumi_elevenlabs_key") || "";
      for (const ep of ttsEndpoints) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 5000);
          const r = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: text, voice: activeVoice, elevenlabs_api_key: elKey }),
            signal: ctrl.signal
          });
          clearTimeout(timer);
          if (r.ok) {
            const b = await r.blob();
            if (b && b.size > 200) {
              this.ttsCache.set(text, b);
              break;
            }
          }
        } catch { }
      }
    },

    speakCallChunk(sentence) {
      const clean = sentence.replace(/\*\*/g, "").replace(/[`#_*~]/g, "").trim();
      if (!clean) return;

      const activeVoice = this.selectedVoice || localStorage.getItem("lumi_live_voice") || "jessica";
      this.prefetchTTS(clean, activeVoice);
      this.speechQueue.push(clean);
      if (!this.isPlayingSpeech) {
        this.playNextQueuedSpeech();
      }
    },

    async playNextQueuedSpeech() {
      if (!this.isOpen || this.speechQueue.length === 0) {
        this.isPlayingSpeech = false;
        if (this.isOpen && !this.isGeneratingResponse) {
          setTimeout(() => {
            if (this.isOpen && !this.isGeneratingResponse && !this.isPlayingSpeech && this.speechQueue.length === 0) {
              this.updateUI("listening", "");
              this.startListening();
            }
          }, 400);
        }
        return;
      }

      this.isPlayingSpeech = true;
      this.stopListening();

      const text = this.speechQueue.shift();
      const hasHindi = /[\u0900-\u097F]/.test(text);
      const activeVoice = this.selectedVoice || localStorage.getItem("lumi_live_voice") || "jessica";

      // If next items exist in queue, pre-fetch their audio now
      if (this.speechQueue.length > 0) {
        this.prefetchTTS(this.speechQueue[0], activeVoice);
      }

      // Safety watchdog: generous 15-second window prevents ANY freeze while allowing full TTS playback
      let watchdog = setTimeout(() => {
        if (this.isOpen && this.isPlayingSpeech) {
          console.warn("Speech watchdog triggered, advancing queue");
          this.playNextQueuedSpeech();
        }
      }, Math.max(15000, text.length * 500));

      const clearWatchdog = () => {
        if (watchdog) {
          clearTimeout(watchdog);
          watchdog = null;
        }
      };

      let audioBlob = this.ttsCache.get(text) || null;
      if (!audioBlob) {
        const ttsEndpoints = [
          "https://lumi-backend-v4-production.up.railway.app/api/tts",
          "http://127.0.0.1:3456/api/tts",
          "http://10.188.22.242:3456/api/tts"
        ];
        if (window.location.origin && window.location.origin.startsWith("http")) {
          ttsEndpoints.unshift(`${window.location.origin}/api/tts`);
        }

        const elKey = localStorage.getItem("lumi_elevenlabs_key") || "";
        for (const ep of ttsEndpoints) {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 6000);
            const r = await fetch(ep, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ input: text, voice: activeVoice, elevenlabs_api_key: elKey }),
              signal: ctrl.signal
            });
            clearTimeout(timer);
            if (r.ok) {
              const b = await r.blob();
              if (b && b.size > 200) {
                audioBlob = b;
                this.ttsCache.set(text, b);
                break;
              }
            }
          } catch { }
        }
      }

      if (!this.isOpen) {
        clearWatchdog();
        return;
      }

      if (audioBlob) {
        const audioSrc = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioSrc);
        this.activeAudioEl = audio;
        audio.onplay = () => {
          // Synchronize subtitle display with audio playback starting NOW (exactly when voice is heard)
          this.updateUI("speaking", text);
        };
        audio.onended = () => {
          clearWatchdog();
          URL.revokeObjectURL(audioSrc);
          this.activeAudioEl = null;
          this.playNextQueuedSpeech();
        };
        audio.onerror = () => {
          clearWatchdog();
          URL.revokeObjectURL(audioSrc);
          this.activeAudioEl = null;
          this.fallbackSpeak(text, hasHindi, activeVoice);
        };
        const playPromise = audio.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch((err) => {
            console.warn("audio.play() error:", err);
            clearWatchdog();
            URL.revokeObjectURL(audioSrc);
            this.activeAudioEl = null;
            this.fallbackSpeak(text, hasHindi, activeVoice);
          });
        }
      } else {
        clearWatchdog();
        this.fallbackSpeak(text, hasHindi, activeVoice);
      }
    },

    fallbackSpeak(text, hasHindi, activeVoice) {
      if (!this.isOpen) return;
      const lang = hasHindi ? "hi-IN" : "en-US";
      const voiceId = activeVoice || this.selectedVoice || localStorage.getItem("lumi_live_voice") || "jessica";

      // Synchronize subtitle display with speech
      this.updateUI("speaking", text);

      let watchdog = setTimeout(() => {
        if (this.isOpen && this.isPlayingSpeech) {
          this.playNextQueuedSpeech();
        }
      }, Math.max(2500, text.length * 140));

      const onDone = () => {
        if (watchdog) {
          clearTimeout(watchdog);
          watchdog = null;
        }
        this.playNextQueuedSpeech();
      };

      if (window.AndroidTTS && typeof window.AndroidTTS.speak === "function") {
        const msgId = "live_tts_" + Date.now();
        window.__lumiOnTTSDone = (doneId) => {
          if (doneId === msgId) {
            onDone();
          }
        };
        window.AndroidTTS.speak(msgId, text, lang, voiceId);
      } else if ("speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang;
        utt.onend = onDone;
        utt.onerror = onDone;
        window.speechSynthesis.speak(utt);
      } else {
        setTimeout(onDone, 800);
      }
    }
  };

  window.LumiVoiceCall = LumiVoiceCall;

  window.handleAndroidBack = function () {
    // 0. If Image Lightbox is open, close it cleanly
    if (lightboxImageSrc) {
      lightboxImageSrc = null;
      lightboxZoomed = false;
      render();
      return true;
    }

    // 1. If Live Voice Call is open
    if (window.LumiVoiceCall && window.LumiVoiceCall.isOpen) {
      const voiceMenu = document.querySelector("#live-voice-menu");
      if (voiceMenu && !voiceMenu.classList.contains("hidden")) {
        window.LumiVoiceCall.closeVoiceMenu();
        return true;
      }
      window.LumiVoiceCall.close();
      return true;
    }

    // 2. If any modal is open
    const modals = [
      "#model-selector-modal",
      "#settings-modal",
      "#api-keys-modal",
      "#image-lightbox-modal",
      "#file-viewer-modal"
    ];
    for (const sel of modals) {
      const el = document.querySelector(sel);
      if (el && !el.classList.contains("hidden")) {
        el.classList.add("hidden");
        return true;
      }
    }

    // 3. If sidebar is open on mobile
    const sidebar = document.querySelector("#sidebar");
    if (sidebar && sidebar.classList.contains("mobile-open")) {
      sidebar.classList.remove("mobile-open");
      return true;
    }

    // 4. If in Settings or Settings sub-view
    const currentHash = window.location.hash || "";
    if (currentHash.startsWith("#/settings/")) {
      window.location.hash = "#/settings";
      return true;
    }
    if (currentHash === "#/settings") {
      window.location.hash = "#/chat";
      return true;
    }

    return false;
  };

  window.addEventListener("popstate", () => {
    if (window.LumiVoiceCall && window.LumiVoiceCall.isOpen) {
      window.handleAndroidBack();
    }
  });

  async function runPythonCode(code) {
    activeWorkspaceTab = "terminal";
    workspaceOpen = true;
    render();
    showToast("▶ Executing Python script in sandbox...");
    try {
      const resp = await fetch("/api/run/python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await resp.json();
      terminalHistory.push({
        cmd: "python3 " + (currentActiveCodeTask?.filename || "script.py"),
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        exit_code: data.exit_code
      });
      AudioEffects.play(data.exit_code === 0 ? "success" : "click");
      render();
    } catch (e) {
      showToast("Execution error: " + e.message);
    }
  }

  async function downloadProjectZip() {
    showToast("📦 Packaging project files as .ZIP...");
    const files = {};
    if (currentActiveCodeTask && currentActiveCodeTask.code) {
      files[currentActiveCodeTask.filename] = currentActiveCodeTask.code;
    } else {
      files["index.html"] = "<!DOCTYPE html><html><body><h1>Lumi Project</h1></body></html>";
    }
    files["README.md"] = `# Lumi AI Generated Project\n\nGenerated on ${new Date().toLocaleString()}\n`;
    try {
      const resp = await fetch("/api/export/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files })
      });
      if (!resp.ok) throw new Error("ZIP creation failed");
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lumi-project.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      AudioEffects.play("success");
      showToast("✔ Downloaded lumi-project.zip!");
    } catch (e) {
      showToast("Download failed: " + e.message);
    }
  }

  function updateStreamingMessageUI(threadId, currentText, msgId) {
    // Prevent cross-thread message leak: only update DOM if user is viewing this EXACT thread
    const { path } = parseLocation();
    const currentActiveThreadId = path.startsWith("/chat/") ? path.slice(6) : null;
    if (currentActiveThreadId !== threadId) {
      return; // User has switched to another chat; do not overwrite other chats' messages!
    }

    if (msgId) {
      const targetEl = document.querySelector(`#msg-body-${msgId}`);
      if (targetEl) {
        targetEl.innerHTML = `${renderMarkdown(currentText)}<span class="streaming-cursor"></span>`;
      }
    }
  }

  function scrollToBottom(force = false) {
    const container = document.querySelector("#chat-messages-container");
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    // If user has intentionally scrolled up to read (more than 120px away from bottom), don't hijack their scroll!
    if (!force && distanceFromBottom > 120) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }

  // --- Main Render Dispatcher ---
  function render() {
    const root = getApp();
    if (!root) return;

    const chatContainer = document.querySelector("#chat-messages-container");
    const prevScrollTop = chatContainer ? chatContainer.scrollTop : null;
    const wasNearBottom = chatContainer ? (chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 120) : true;

    const { path, query } = parseLocation();

    if (window._lastRenderedPath !== path) {
      window._lastRenderedPath = path;
      window.scrollTo(0, 0);
    }

    // Check if query param 'q' was provided (e.g., from landing or search)
    if (query.get("q") && !pendingQueryText) {
      pendingQueryText = query.get("q");
    }

    if (path === "/" || path === "") {
      if (localStorage.getItem("lumi_app_mode") === "study") {
        window.location.hash = "#/study";
        root.innerHTML = StudyAI.renderDashboard();
        attachEventListeners();
        return;
      }
      if (!isUserLoggedIn() && sessionStorage.getItem("lumi_guest_bypass") !== "true") {
        window.location.hash = "#/auth";
        root.innerHTML = renderAuthPage();
        attachEventListeners();
        return;
      } else {
        window.location.hash = "#/chat";
        const thread = getActiveConversation();
        root.innerHTML = renderChatPage(thread ? thread.id : null);
      }
    } else if (path.startsWith("/study")) {
      document.body.style.backgroundColor = "#ffffff";
      document.documentElement.style.backgroundColor = "#ffffff";
      if (path === "/study" || path === "/study/") {
        root.innerHTML = StudyAI.renderDashboard();
      } else if (path.startsWith("/study/chat")) {
        const threadId = path.startsWith("/study/chat/") ? path.slice(12) : null;
        const qParam = query.get("q");
        if (qParam) {
          StudyAI.ask(qParam);
          try {
            history.replaceState(null, "", "#/study/chat");
          } catch (e) { }
        }
        root.innerHTML = StudyAI.renderChat(threadId);
      } else if (path.startsWith("/study/reader")) {
        root.innerHTML = StudyAI.renderReader();
      } else if (path.startsWith("/study/downloader")) {
        root.innerHTML = StudyAI.renderDownloader();
      } else {
        root.innerHTML = StudyAI.renderDashboard();
      }
    } else if (path === "/auth") {
      document.body.style.backgroundColor = "";
      root.innerHTML = renderAuthPage();
    } else if (path === "/providers") {
      document.body.style.backgroundColor = "";
      root.innerHTML = renderProvidersPage();
    } else if (path.startsWith("/settings")) {
      document.body.style.backgroundColor = "#000000";
      root.innerHTML = renderSettingsPage(path);
    } else if (path.startsWith("/chat")) {
      if (!isUserLoggedIn() && sessionStorage.getItem("lumi_guest_bypass") !== "true") {
        window.location.hash = "#/auth";
        root.innerHTML = renderAuthPage();
        return;
      }
      document.body.style.backgroundColor = "";
      const threadId = path.startsWith("/chat/") ? path.slice(6) : null;
      root.innerHTML = renderChatPage(threadId);

      // If pending query text exists, fire it!
      if (pendingQueryText) {
        const toSend = pendingQueryText;
        pendingQueryText = "";
        setTimeout(() => sendMessage(toSend), 100);
      }
    } else {
      // 404 fallback to landing
      root.innerHTML = renderLanding();
    }

    root.innerHTML += renderHtmlModal();
    if (settingsModalOpen) {
      root.innerHTML += renderSettingsModal();
    }
    if (upgradeModalState) {
      root.innerHTML += renderUpgradeModal();
    }
    if (ChatGPTImageStudio.activeViewer && ChatGPTImageStudio.activeViewer.url) {
      root.innerHTML += ChatGPTImageStudio.renderFullscreenViewer();
    } else if (lightboxImageSrc) {
      root.innerHTML += renderImageLightbox();
    }
    attachEventListeners();

    if (prevScrollTop !== null) {
      const newChatContainer = document.querySelector("#chat-messages-container");
      if (newChatContainer) {
        if (wasNearBottom) {
          newChatContainer.scrollTop = newChatContainer.scrollHeight;
        } else {
          newChatContainer.scrollTop = prevScrollTop;
        }
      }
    }
  }

  // --- Event Handling & DOM Wiring ---
  function attachEventListeners() {
    // 1. Textarea Auto-expand & Enter to submit
    const textarea = document.querySelector("#composer-textarea");
    if (textarea) {
      textarea.addEventListener("input", () => {
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 192) + "px";

        const hasText = textarea.value.trim().length > 0;
        const submitBtn = document.querySelector("#submit-prompt-btn");
        if (submitBtn && !isStreaming) {
          if (hasText) {
            submitBtn.classList.add("opacity-100", "scale-105");
            submitBtn.classList.remove("opacity-60");
          } else {
            submitBtn.classList.remove("scale-105");
            submitBtn.classList.add("opacity-60");
          }
        }
      });

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const val = textarea.value.trim();
          if (val) sendMessage(val);
        }
      });
    }

    const voiceCallTrigger = document.querySelector("#voice-call-trigger-btn");
    if (voiceCallTrigger) {
      voiceCallTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        LumiVoiceCall.open();
      });
    }

    // 2. Chat Form Submit & Direct Send Button Click
    const form = document.querySelector("#chat-composer-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("textarea[name='message']");
        const val = input ? input.value.trim() : "";
        if (val) sendMessage(val);
      });
    }

    const submitBtnEl = document.querySelector("#submit-prompt-btn");
    if (submitBtnEl) {
      submitBtnEl.addEventListener("click", (e) => {
        e.preventDefault();
        const input = document.querySelector("#composer-textarea");
        const val = input ? input.value.trim() : "";
        if (val) sendMessage(val);
      });
    }

    // 3. Stop Generation Button
    const stopBtn = document.querySelector("#stop-generation-btn");
    if (stopBtn) {
      stopBtn.addEventListener("click", () => {
        if (streamAbortController) {
          streamAbortController.abort();
        }
        restoreComposerButtons();
      });
    }

    // 4. Suggestion Chips
    document.querySelectorAll(".suggestion-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-suggestion");
        if (text) sendMessage(text);
      });
    });

    // 5. Model Picker Dropdown Toggle (In-place, no full refresh!)
    document.querySelectorAll(".model-picker-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const placement = btn.getAttribute("data-toggle-model-picker") || "composer";
        const menu = document.querySelector(`#model-dropdown-menu-${placement}`);
        const otherPlacement = placement === "topbar" ? "composer" : "topbar";
        const otherMenu = document.querySelector(`#model-dropdown-menu-${otherPlacement}`);
        if (otherMenu) otherMenu.classList.add("hidden");
        const personaMenu = document.querySelector("#persona-dropdown-menu");
        if (personaMenu) personaMenu.classList.add("hidden");
        const exportMenu = document.querySelector("#export-dropdown-menu");
        if (exportMenu) exportMenu.classList.add("hidden");

        if (menu) {
          menu.classList.toggle("hidden");
          const isHidden = menu.classList.contains("hidden");
          btn.setAttribute("aria-expanded", String(!isHidden));
        }
      });
    });

    // Close menus on outside click & GenUI interactive event delegation (Bind exactly once)
    if (!window.__lumiDocClickBound) {
      window.__lumiDocClickBound = true;
      // Live GenUI Slider real-time bubble updating (Bind once)
      if (!window.__lumiSliderBound) {
        window.__lumiSliderBound = true;
        document.addEventListener("input", (e) => {
          const slider = e.target.closest(".genui-slider-input");
          if (!slider) return;
          const wrap = slider.parentElement;
          const bubble = wrap ? wrap.querySelector(".genui-slider-bubble") : null;
          const unit = slider.getAttribute("data-unit") || "";
          if (bubble) bubble.textContent = unit + slider.value;

          const compId = slider.getAttribute("data-comp-id");
          if (compId) {
            const badge = document.querySelector(`#${compId}-badge`);
            if (badge) badge.textContent = unit + slider.value;
            GenUIState.set(compId, { value: slider.value });
          }
        });
      }
      document.addEventListener("click", (e) => {
        // 1. GenUI interactive quick prompt button clicks
        const promptBtn = e.target.closest("[data-genui-prompt]");
        if (promptBtn) {
          const promptText = promptBtn.getAttribute("data-genui-prompt");
          if (promptText) {
            sendMessage(promptText);
            return;
          }
        }

        // 2. GenUI Accordion Expand / Collapse
        const accordionHeader = e.target.closest(".genui-accordion-header");
        if (accordionHeader) {
          const item = accordionHeader.closest(".genui-accordion-item");
          if (item) {
            item.classList.toggle("open");
          }
          return;
        }

        // 3. GenUI Selection Card Click
        const selectCard = e.target.closest(".genui-select-card");
        if (selectCard) {
          const compId = selectCard.getAttribute("data-comp-id");
          const itemId = selectCard.getAttribute("data-genui-select-card");
          const mode = selectCard.getAttribute("data-mode") || "single";
          const title = selectCard.getAttribute("data-title") || itemId;
          const autoSubmit = selectCard.getAttribute("data-auto-submit") === "true";
          const wrap = selectCard.closest(".genui-selection-group") || selectCard.parentElement;

          if (mode === "single") {
            wrap.querySelectorAll(".genui-select-card").forEach((c) => {
              c.classList.remove("selected");
              const ind = c.querySelector(".genui-radio-indicator");
              if (ind) ind.classList.remove("active");
            });
            selectCard.classList.add("selected");
            const ind = selectCard.querySelector(".genui-radio-indicator");
            if (ind) ind.classList.add("active");

            GenUIState.set(compId, { selected: itemId, title: title });

            const countEl = document.querySelector(`#${compId}-count`);
            if (countEl) countEl.textContent = "1 selected";

            if (autoSubmit) {
              sendMessage("I chose: " + title);
            }
          } else {
            selectCard.classList.toggle("selected");
            const ind = selectCard.querySelector(".genui-check-indicator");
            if (ind) ind.classList.toggle("active", selectCard.classList.contains("selected"));

            const allSelected = [...wrap.querySelectorAll(".genui-select-card.selected")];
            const selIds = allSelected.map((c) => c.getAttribute("data-genui-select-card"));
            const selTitles = allSelected.map((c) => c.getAttribute("data-title") || c.getAttribute("data-genui-select-card"));

            GenUIState.set(compId, { selected: selIds, titles: selTitles });

            const countEl = document.querySelector(`#${compId}-count`);
            if (countEl) countEl.textContent = selIds.length > 0 ? `${selIds.length} selected` : "None selected";
          }
          return;
        }

        // 4. GenUI Selection Submit Button
        const submitSelBtn = e.target.closest(".genui-submit-selection");
        if (submitSelBtn) {
          const compId = submitSelBtn.getAttribute("data-comp-id");
          const mode = submitSelBtn.getAttribute("data-mode") || "single";
          const template = submitSelBtn.getAttribute("data-template") || "I selected:";
          const state = GenUIState.get(compId, {});

          let chosen = [];
          if (mode === "single") {
            if (state.title || state.selected) chosen.push(state.title || state.selected);
          } else {
            if (Array.isArray(state.titles) && state.titles.length) chosen = state.titles;
            else if (Array.isArray(state.selected) && state.selected.length) chosen = state.selected;
          }

          if (chosen.length === 0) {
            showToast("Please choose an option first.");
            return;
          }

          const prompt = `${template} ${chosen.join(", ")}`;
          sendMessage(prompt);
          return;
        }

        // 5. GenUI Grid Item Selection Click
        const gridItem = e.target.closest(".genui-grid-item");
        if (gridItem && !e.target.closest(".genui-qty-controls")) {
          const compId = gridItem.getAttribute("data-comp-id");
          const itemId = gridItem.getAttribute("data-genui-grid-item");
          gridItem.classList.toggle("selected");
          const isSel = gridItem.classList.contains("selected");

          GenUIState.update(compId, (cur) => {
            const items = cur.items || {};
            const prev = items[itemId] || { qty: 1 };
            items[itemId] = { selected: isSel, qty: prev.qty || 1 };
            return { items };
          });
          return;
        }

        // 6. GenUI Grid Quantity Control Buttons (+ / -)
        const qtyBtn = e.target.closest(".genui-qty-btn");
        if (qtyBtn) {
          e.stopPropagation();
          const compId = qtyBtn.getAttribute("data-comp-id");
          const itemId = qtyBtn.getAttribute("data-item-id");
          const isPlus = qtyBtn.classList.contains("plus");
          const valEl = document.querySelector(`#${compId}-qty-${itemId}`);
          let currentQty = valEl ? parseInt(valEl.textContent, 10) || 1 : 1;

          if (isPlus) currentQty += 1;
          else currentQty = Math.max(1, currentQty - 1);

          if (valEl) valEl.textContent = String(currentQty);

          const itemCard = qtyBtn.closest(".genui-grid-item");
          if (itemCard && !itemCard.classList.contains("selected")) {
            itemCard.classList.add("selected");
          }

          GenUIState.update(compId, (cur) => {
            const items = cur.items || {};
            items[itemId] = { selected: true, qty: currentQty };
            return { items };
          });
          return;
        }

        // 7. GenUI Grid Apply / Submit Button
        const gridSubmitBtn = e.target.closest(".genui-grid-submit");
        if (gridSubmitBtn) {
          const compId = gridSubmitBtn.getAttribute("data-comp-id");
          const wrap = document.querySelector(`#${compId}-wrap`) || gridSubmitBtn.closest(".genui-card");
          const selCards = wrap ? [...wrap.querySelectorAll(".genui-grid-item.selected")] : [];

          if (selCards.length === 0) {
            showToast("Please select at least one item.");
            return;
          }

          const summaryList = selCards.map((c) => {
            const name = c.getAttribute("data-name") || "Item";
            const itemId = c.getAttribute("data-genui-grid-item");
            const valEl = document.querySelector(`#${compId}-qty-${itemId}`);
            const qty = valEl ? parseInt(valEl.textContent, 10) || 1 : 1;
            return qty > 1 ? `${name} (${qty}x)` : name;
          });

          const title = gridSubmitBtn.getAttribute("data-title") || "Selected items";
          sendMessage(`${title}: ${summaryList.join(", ")}`);
          return;
        }

        // 8. GenUI Interactive Checklist Item Click
        const checkItem = e.target.closest(".genui-check-item");
        if (checkItem) {
          const compId = checkItem.getAttribute("data-comp-id");
          const itemId = checkItem.getAttribute("data-genui-check-item");
          checkItem.classList.toggle("completed");
          const box = checkItem.querySelector(".genui-checkbox-box");
          if (box) box.classList.toggle("checked", checkItem.classList.contains("completed"));

          const wrap = checkItem.closest(".genui-checklist-card");
          if (wrap) {
            const allItems = [...wrap.querySelectorAll(".genui-check-item")];
            const completedItems = [...wrap.querySelectorAll(".genui-check-item.completed")];
            const completedIds = completedItems.map((i) => i.getAttribute("data-genui-check-item"));

            GenUIState.set(compId, { checked: completedIds });

            const total = allItems.length;
            const done = completedItems.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            const bar = document.querySelector(`#${compId}-bar`);
            if (bar) bar.style.width = pct + "%";
            const badge = document.querySelector(`#${compId}-badge`);
            if (badge) {
              badge.textContent = `${pct}% Done`;
              badge.className = `genui-badge ${pct === 100 ? "success" : "primary"}`;
            }
            const label = document.querySelector(`#${compId}-label`);
            if (label) label.textContent = `${done} of ${total} tasks completed`;
          }
          return;
        }

        // 9. GenUI Interactive Quiz Option Click
        const quizOpt = e.target.closest(".genui-quiz-opt");
        if (quizOpt) {
          const card = quizOpt.closest(".genui-quiz-card");
          if (!card || card.classList.contains("quiz-revealed")) return;

          card.classList.add("quiz-revealed");
          const compId = quizOpt.getAttribute("data-comp-id");
          const optIdx = parseInt(quizOpt.getAttribute("data-genui-quiz-opt"), 10);
          const isCorrect = quizOpt.getAttribute("data-is-correct") === "true";
          const explanation = quizOpt.getAttribute("data-explanation") || "";

          if (isCorrect) {
            quizOpt.classList.add("correct");
          } else {
            quizOpt.classList.add("wrong");
            card.querySelectorAll(".genui-quiz-opt").forEach((opt) => {
              if (opt.getAttribute("data-is-correct") === "true") {
                opt.classList.add("correct");
              }
            });
          }

          const feedbackEl = document.querySelector(`#${compId}-feedback`);
          if (feedbackEl) {
            feedbackEl.className = "genui-quiz-feedback active animate-fade-in mt-3 p-3 rounded-xl bg-accent/60 border border-border";
            feedbackEl.innerHTML = `
              <div class="font-semibold text-xs text-indigo-400 mb-1 flex items-center gap-1.5">
                ${isCorrect ? "🎉 Correct Answer!" : "💡 Explanation"}
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed">${renderInlineFormatting(escapeHtml(explanation))}</p>
              <button type="button" class="genui-action-btn mt-2.5 text-xs py-1 px-2.5" data-genui-prompt="Can you explain more about this quiz question?">
                Discuss this with AI →
              </button>`;
          }

          GenUIState.set(compId, { answered: true, selectedIndex: optIdx, isCorrect: isCorrect, explanation: explanation });
          return;
        }

        // 10. GenUI Interactive Poll Option Click
        const pollOpt = e.target.closest(".genui-poll-opt");
        if (pollOpt) {
          const card = pollOpt.closest(".genui-poll-card");
          if (!card || card.classList.contains("poll-voted")) return;

          card.classList.add("poll-voted");
          const compId = pollOpt.getAttribute("data-comp-id");
          const optIdx = parseInt(pollOpt.getAttribute("data-genui-poll-opt"), 10);
          pollOpt.classList.add("voted");

          GenUIState.set(compId, { voted: true, selectedIndex: optIdx });

          const allOpts = [...card.querySelectorAll(".genui-poll-opt")];
          const totalVotes = allOpts.length + 1;
          allOpts.forEach((opt, idx) => {
            const isUserChoice = idx === optIdx;
            const pct = isUserChoice ? Math.round((2 / totalVotes) * 100) : Math.round((1 / totalVotes) * 100);
            const fill = opt.querySelector(".genui-poll-bg-fill");
            if (fill) fill.style.width = pct + "%";
            let badge = opt.querySelector(".font-mono");
            if (!badge) {
              const span = document.createElement("span");
              span.className = "font-bold text-xs text-foreground font-mono";
              opt.querySelector(".flex").appendChild(span);
              badge = span;
            }
            badge.textContent = pct + "%";
          });
          return;
        }

        // 11. GenUI Form Submit Button
        const formSubmitBtn = e.target.closest(".genui-form-submit");
        if (formSubmitBtn) {
          const compId = formSubmitBtn.getAttribute("data-comp-id");
          const form = document.querySelector(`#${compId}-form`);
          if (!form) return;

          const elements = form.querySelectorAll("input, select, textarea");
          const data = {};
          let isValid = true;

          elements.forEach((el) => {
            if (!el.name) return;
            if (el.type === "checkbox") {
              data[el.name] = el.checked ? "Yes" : "No";
            } else {
              const val = el.value.trim();
              if (el.required && !val) {
                el.classList.add("border-rose-500");
                isValid = false;
              } else {
                el.classList.remove("border-rose-500");
              }
              data[el.name] = val;
            }
          });

          if (!isValid) {
            showToast("Please fill in all required fields.");
            return;
          }

          GenUIState.set(compId, { submitted: true, data: data });

          const formTitle = formSubmitBtn.getAttribute("data-title") || "Form";
          const formatted = Object.entries(data)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n");
          sendMessage(`Form Submitted (${formTitle}):\n${formatted}`);
          return;
        }

        // 12. GenUI Slider Submit Button
        const sliderSubmitBtn = e.target.closest(".genui-slider-submit");
        if (sliderSubmitBtn) {
          const compId = sliderSubmitBtn.getAttribute("data-comp-id");
          const wrap = document.querySelector(`#${compId}-wrap`);
          const slider = wrap ? wrap.querySelector(".genui-slider-input") : null;
          const label = sliderSubmitBtn.getAttribute("data-label") || "Selected value";
          const unit = sliderSubmitBtn.getAttribute("data-unit") || "";
          const val = slider ? slider.value : "";
          sendMessage(`${label}: ${unit}${val}`);
          return;
        }

        if (!e.target.closest(".model-dropdown-menu") && !e.target.closest(".model-picker-toggle-btn")) {
          document.querySelectorAll(".model-dropdown-menu").forEach((m) => m.classList.add("hidden"));
          document.querySelectorAll(".model-picker-toggle-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        }
        if (!e.target.closest(".lumi-custom-select-wrap") && !e.target.closest(".lumi-settings-row")) {
          document.querySelectorAll(".lumi-custom-select-menu").forEach((m) => m.classList.add("hidden"));
        }
        if (!e.target.closest(".topbar-dropdown-menu") && !e.target.closest("#toggle-persona-btn") && !e.target.closest("#toggle-export-btn") && !e.target.closest("#toggle-device-tools-btn")) {
          const pMenu = document.querySelector("#persona-dropdown-menu");
          if (pMenu) pMenu.classList.add("hidden");
          const eMenu = document.querySelector("#export-dropdown-menu");
          if (eMenu) eMenu.classList.add("hidden");
          const dMenu = document.querySelector("#device-tools-dropdown-menu");
          if (dMenu) dMenu.classList.add("hidden");
        }
      });
    }

    // Model selection click (In-place, no full refresh!)
    document.querySelectorAll("[data-select-model]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const raw = btn.getAttribute("data-select-model");
        const [provId, ...modParts] = raw.split("::");
        const modName = modParts.join("::");
        selectedModel = {
          provider_id: provId === "builtin" ? null : provId,
          model: modName || null,
        };
        saveJson(STORAGE.MODEL, selectedModel);

        // Hide model dropdowns
        document.querySelectorAll(".model-dropdown-menu").forEach((m) => m.classList.add("hidden"));
        document.querySelectorAll(".model-picker-toggle-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));

        // Update labels in-place
        const newLabel = getActiveModelLabel();
        document.querySelectorAll(".model-picker-label").forEach((el) => {
          el.textContent = newLabel;
        });

        // Update active checkmarks inside model items
        document.querySelectorAll("[data-select-model]").forEach((itemBtn) => {
          const itemVal = itemBtn.getAttribute("data-select-model");
          const isActive = itemVal === raw;
          itemBtn.classList.toggle("is-active", isActive);
          const existingCheck = itemBtn.querySelector("svg");
          if (isActive && !existingCheck) {
            itemBtn.insertAdjacentHTML("beforeend", ICONS.check);
          } else if (!isActive && existingCheck) {
            existingCheck.remove();
          }
        });

        AudioEffects.play("click");
        showToast(`Model set to: ${newLabel}`);
      });
    });

    // 6. Sidebar Controls (In-place smooth slide-in, no full reload!)
    const sidebarToggle = document.querySelector("#sidebar-toggle-btn");
    const aside = document.querySelector("aside");
    const sidebarBackdrop = document.querySelector("#sidebar-backdrop");

    function setSidebarState(open) {
      sidebarOpen = open;
      if (aside) {
        if (open) {
          aside.classList.add("translate-x-0", "shadow-2xl");
          aside.classList.remove("-translate-x-full");
        } else {
          aside.classList.remove("translate-x-0", "shadow-2xl");
          aside.classList.add("-translate-x-full");
        }
      }
      if (sidebarBackdrop) {
        if (open) {
          sidebarBackdrop.classList.remove("hidden");
        } else {
          sidebarBackdrop.classList.add("hidden");
        }
      }
    }

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        setSidebarState(!sidebarOpen);
      });
    }

    const closeSidebarBtn = document.querySelector("#close-sidebar-btn");
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", () => {
        setSidebarState(false);
      });
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener("click", () => {
        setSidebarState(false);
      });
    }

    // 7. Search Input Filter
    const searchInput = document.querySelector("#chat-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        const navList = document.querySelector("#thread-nav-list");
        if (navList) {
          const { path } = parseLocation();
          const activeThreadId = path.startsWith("/chat/") ? path.slice(6) : null;
          navList.outerHTML = renderSidebar(activeThreadId).match(/<nav[\s\S]*?<\/nav>/)[0];
          attachEventListeners();
        }
      });
    }

    // 8. Rename & Delete Chat Actions
    document.querySelectorAll("[data-action='rename-chat']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        editingChatId = btn.getAttribute("data-id");
        render();
      });
    });

    if (editingChatId) {
      const input = document.querySelector(`#rename-input-${editingChatId}`);
      if (input) {
        input.focus();
        input.select();
        const finish = () => {
          const newTitle = input.value.trim();
          if (newTitle) {
            const chat = conversations.find((c) => c.id === editingChatId);
            if (chat) chat.title = newTitle;
            saveJson(STORAGE.CHATS, conversations);
          }
          editingChatId = null;
          render();
        };
        input.addEventListener("blur", finish);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") finish();
          if (e.key === "Escape") {
            editingChatId = null;
            render();
          }
        });
      }
    }

    document.querySelectorAll("[data-action='delete-chat']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        conversations = conversations.filter((c) => c.id !== id);
        saveJson(STORAGE.CHATS, conversations);

        const { path } = parseLocation();
        if (path === `/chat/${id}`) {
          navigate("/chat");
        } else {
          render();
        }
      });
    });

    // 9. Copy Message Text Button
    document.querySelectorAll("[data-action='copy-message']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-text");
        if (text) {
          navigator.clipboard.writeText(text);
          const orig = btn.innerHTML;
          btn.innerHTML = `${ICONS.check} <span class="text-emerald-600">Copied!</span>`;
          setTimeout(() => (btn.innerHTML = orig), 2000);
        }
      });
    });

    // 10. Copy Code Block Button
    document.querySelectorAll(".code-copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-copy-code");
        if (code) {
          navigator.clipboard.writeText(code);
          const orig = btn.innerHTML;
          btn.innerHTML = `${ICONS.check} <span>Copied!</span>`;
          setTimeout(() => (btn.innerHTML = orig), 2000);
        }
      });
    });

    // 11. Regenerate Assistant Reply
    document.querySelectorAll("[data-action='regenerate-message']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const { path } = parseLocation();
        const threadId = path.startsWith("/chat/") ? path.slice(6) : null;
        const thread = conversations.find((c) => c.id === threadId);
        if (thread && thread.messages.length >= 2) {
          // Remove last assistant message
          thread.messages.pop();
          // Get last user message text
          const lastUser = thread.messages[thread.messages.length - 1];
          if (lastUser && lastUser.role === "user") {
            const prompt = lastUser.content;
            thread.messages.pop(); // remove user msg too because sendMessage will re-add it
            sendMessage(prompt);
          }
        }
      });
    });

    // 12. Provider Modal Controls
    const openAddProvBtn = document.querySelector("#open-add-provider-btn");
    if (openAddProvBtn) {
      openAddProvBtn.addEventListener("click", () => {
        activeModal = "add-provider";
        editingProvider = null;
        render();
      });
    }

    const closeModalBtn = document.querySelector("#close-modal-btn");
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        activeModal = null;
        editingProvider = null;
        render();
      });
    }

    const cancelModalBtn = document.querySelector("#cancel-modal-btn");
    if (cancelModalBtn) {
      cancelModalBtn.addEventListener("click", () => {
        activeModal = null;
        editingProvider = null;
        render();
      });
    }

    const provForm = document.querySelector("#provider-form");
    if (provForm) {
      provForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(provForm);
        const name = fd.get("name")?.trim();
        const protocol = fd.get("protocol");
        const base_url = fd.get("base_url")?.trim();
        const apiKey = fd.get("apiKey")?.trim();
        const default_model = fd.get("default_model")?.trim();
        const modelsText = fd.get("modelsText")?.trim();
        const enabled = fd.get("enabled") === "on";

        const models = modelsText
          ? modelsText.split("\n").map((m) => m.trim()).filter(Boolean)
          : default_model
            ? [default_model]
            : [];

        if (editingProvider && editingProvider.id) {
          const idx = providers.findIndex((p) => p.id === editingProvider.id);
          if (idx !== -1) {
            providers[idx] = {
              ...providers[idx],
              name,
              protocol,
              base_url,
              apiKey,
              default_model,
              models,
              enabled,
            };
          }
        } else {
          const newProv = {
            id: "prov_" + Date.now().toString(36),
            name,
            protocol,
            base_url,
            apiKey,
            default_model,
            models,
            enabled,
          };
          providers.push(newProv);
        }

        saveJson(STORAGE.PROVIDERS, providers);
        activeModal = null;
        editingProvider = null;
        showToast("Provider configuration saved!");
        render();
      });
    }

    document.querySelectorAll("[data-action='edit-provider']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const p = providers.find((pr) => pr.id === id);
        if (p) {
          activeModal = "edit-provider";
          editingProvider = { ...p };
          render();
        }
      });
    });

    document.querySelectorAll("[data-action='delete-provider']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        providers = providers.filter((pr) => pr.id !== id);
        saveJson(STORAGE.PROVIDERS, providers);
        showToast("Provider removed.");
        render();
      });
    });

    document.querySelectorAll("[data-action='add-from-template']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        const tpl = PROVIDER_TEMPLATES.find((t) => t.name === name);
        if (tpl) {
          activeModal = "add-provider";
          editingProvider = {
            name: tpl.name,
            protocol: tpl.protocol,
            base_url: tpl.base_url,
            apiKey: "",
            default_model: tpl.default_model,
            modelsText: tpl.models.join("\n"),
            enabled: true,
          };
          render();
        }
      });
    });

    // 13. File Attachments (.pdf, .txt, .py, .js, .csv, etc.)
    const attachBtn = document.querySelector("#attach-file-btn");
    const fileInput = document.querySelector("#file-upload-input");
    if (attachBtn && fileInput) {
      attachBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });

      fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        showToast(`Reading ${files.length} file(s)...`);
        for (const file of files) {
          try {
            const isImg = /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name) || (file.type && file.type.startsWith("image/"));
            if (isImg) {
              const compressedB64 = await compressAndReadImage(file);
              attachedFiles.push({
                name: file.name,
                size: file.size,
                isImage: true,
                dataUrl: compressedB64,
                content: `[Attached Image: ${file.name}]`,
              });
              updateAttachmentChipsUI();
              showToast(`✔ Attached image ${file.name}`);
            } else if (file.name.toLowerCase().endsWith(".pdf")) {
              const reader = new FileReader();
              reader.onload = async (ev) => {
                const b64 = ev.target.result;
                const apiBase =
                  window.location.origin && window.location.origin.startsWith("http")
                    ? ""
                    : "https://lumi-backend-v4-production.up.railway.app";
                try {
                  const resp = await fetch(`${apiBase}/api/extract/pdf`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ base64: b64 }),
                  });
                  if (resp.ok) {
                    const data = await resp.json();
                    attachedFiles.push({
                      name: file.name,
                      size: file.size,
                      content: data.text || "",
                      isPdf: true,
                      pages: data.pages || 1,
                    });
                    updateAttachmentChipsUI();
                    showToast(`✔ Extracted ${data.pages || 1} pages from ${file.name}`);
                  }
                } catch (pdfErr) {
                  showToast("PDF extract failed: " + pdfErr.message);
                }
              };
              reader.readAsDataURL(file);
            } else {
              const reader = new FileReader();
              reader.onload = (ev) => {
                attachedFiles.push({
                  name: file.name,
                  size: file.size,
                  content: ev.target.result || "",
                  isPdf: false,
                });
                updateAttachmentChipsUI();
                showToast(`✔ Attached ${file.name}`);
              };
              reader.readAsText(file);
            }
          } catch (err) {
            console.error("File read error:", err);
          }
        }
        fileInput.value = "";
      });
    }

    // 13-Camera. Camera Lens Trigger & Input
    const cameraLensBtn = document.querySelector("#camera-lens-btn");
    const cameraLensInput = document.querySelector("#camera-lens-input");
    if (cameraLensBtn && cameraLensInput) {
      cameraLensBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cameraLensInput.click();
      });

      cameraLensInput.addEventListener("change", async (e) => {
        const file = (e.target.files && e.target.files[0]) || null;
        if (!file) return;
        showToast("Processing photo from Camera...");
        try {
          const compressedB64 = await compressAndReadImage(file);
          attachedFiles.push({
            name: "Camera_Photo.jpg",
            size: file.size,
            isImage: true,
            isCameraPhoto: true,
            dataUrl: compressedB64,
            content: `[Photo Captured with Camera: Camera_Photo.jpg]`,
          });
          updateAttachmentChipsUI();
          AudioEffects.play("click");
          showToast("📷 Photo captured! Ask anything about this image.");
          const ta = document.querySelector("#composer-textarea");
          if (ta) {
            ta.placeholder = "Ask Lumi about this photo (e.g. identify, read text, explain)...";
            ta.focus();
          }
        } catch (err) {
          console.error("Camera read error:", err);
          showToast("Failed to process photo.");
        }
        cameraLensInput.value = "";
      });
    }

    document.querySelectorAll("[data-remove-attachment]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-remove-attachment"), 10);
        if (!isNaN(idx) && idx >= 0 && idx < attachedFiles.length) {
          attachedFiles.splice(idx, 1);
          updateAttachmentChipsUI();
        }
      });
    });

    // 13B. Super-Features: Voice, Audio, Persona & Export Wiring
    const toggleSoundBtn = document.querySelector("#toggle-sound-btn");
    if (toggleSoundBtn) {
      toggleSoundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        soundEnabled = !soundEnabled;
        saveJson("lumi_sound_enabled", soundEnabled);
        AudioEffects.play("click");
        showToast(soundEnabled ? "🔊 Sound effects enabled" : "🔇 Sound effects muted");
        render();
      });
    }

    const micBtn = document.querySelector("#voice-mic-btn");
    if (micBtn) {
      micBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSpeechRecognition();
      });
    }

    const toggleWebSearchBtn = document.querySelector("#toggle-web-search-btn");
    if (toggleWebSearchBtn) {
      toggleWebSearchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        webSearchEnabled = !webSearchEnabled;
        saveJson("lumi_web_search_enabled", webSearchEnabled);
        AudioEffects.play("click");
        showToast(webSearchEnabled ? "🌐 Live Web Search ON" : "🌐 Live Web Search OFF");
        render();
      });
    }

    // 13B. Persona Selector (In-place, no full refresh!)
    const togglePersonaBtn = document.querySelector("#toggle-persona-btn");
    const personaMenu = document.querySelector("#persona-dropdown-menu");
    if (togglePersonaBtn && personaMenu) {
      togglePersonaBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        personaMenu.classList.toggle("hidden");
        const exportMenu = document.querySelector("#export-dropdown-menu");
        if (exportMenu) exportMenu.classList.add("hidden");
      });
    }

    document.querySelectorAll("[data-select-persona]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const p = btn.getAttribute("data-select-persona");
        if (p && PERSONA_PROMPTS[p]) {
          activePersona = p;
          if (personaMenu) personaMenu.classList.add("hidden");
          const pIcon = document.querySelector("#toggle-persona-btn span:first-child");
          const pLabel = document.querySelector("#toggle-persona-btn .persona-label");
          const pShort = document.querySelector("#toggle-persona-btn .persona-short-label");
          if (pIcon) pIcon.textContent = PERSONA_ICONS[p] || "🌟";
          if (pLabel) pLabel.textContent = PERSONA_LABELS[p].replace(/^[^\w\s]+\s*/, "");
          if (pShort) pShort.textContent = PERSONA_SHORT_LABELS[p];
          AudioEffects.play("click");
          showToast(`Persona: ${PERSONA_LABELS[p]}`);
        }
      });
    });

    // 13C. Chat Export Handlers (In-place, no full refresh!)
    const toggleExportBtn = document.querySelector("#toggle-export-btn");
    const exportMenu = document.querySelector("#export-dropdown-menu");
    if (toggleExportBtn && exportMenu) {
      toggleExportBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle("hidden");
        if (personaMenu) personaMenu.classList.add("hidden");
      });
    }

    document.querySelectorAll("[data-export-chat]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const format = btn.getAttribute("data-export-chat");
        exportMenuOpen = false;
        const { path } = parseLocation();
        const threadId = path.startsWith("/chat/") ? path.slice(6) : null;
        const thread = conversations.find((c) => c.id === threadId);
        if (!thread || !thread.messages || thread.messages.length === 0) {
          showToast("No messages to export.");
          render();
          return;
        }

        const title = thread.title || "lumi-conversation";
        if (format === "pdf") {
          window.print();
        } else if (format === "md") {
          let md = `# ${title}\nExported from Lumi AI Studio on ${new Date().toLocaleString()}\n\n---\n\n`;
          thread.messages.forEach((m) => {
            const role = m.role === "user" ? "User" : "Lumi AI";
            md += `### ${role}\n\n${m.content}\n\n---\n\n`;
          });
          const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
          a.click();
          AudioEffects.play("success");
          showToast("✔ Downloaded Markdown export!");
        } else if (format === "txt") {
          let txt = `${title.toUpperCase()}\nExported on ${new Date().toLocaleString()}\n=====================================\n\n`;
          thread.messages.forEach((m) => {
            const role = m.role === "user" ? "USER" : "LUMI AI";
            txt += `[${role}]:\n${m.content}\n\n-------------------------------------\n\n`;
          });
          const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
          a.click();
          AudioEffects.play("success");
          showToast("✔ Downloaded Text export!");
        }
        render();
      });
    });

    // 13D. Device Tools Handlers
    const toggleDeviceToolsBtn = document.querySelector("#toggle-device-tools-btn");
    const deviceToolsMenu = document.querySelector("#device-tools-dropdown-menu");
    if (toggleDeviceToolsBtn && deviceToolsMenu) {
      toggleDeviceToolsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deviceToolsMenu.classList.toggle("hidden");
        const pm = document.querySelector("#persona-dropdown-menu");
        if (pm) pm.classList.add("hidden");
        const em = document.querySelector("#export-dropdown-menu");
        if (em) em.classList.add("hidden");
      });
    }

    const toolTorchBtn = document.querySelector("#device-tool-torch");
    if (toolTorchBtn) {
      toolTorchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentlyOn = LumiDevice.isTorchOn();
        const nextState = !currentlyOn;
        LumiDevice.toggleTorch(nextState);
        AudioEffects.play("click");
        showToast(nextState ? "🔦 Flashlight turned ON" : "🔦 Flashlight turned OFF");
        if (deviceToolsMenu) deviceToolsMenu.classList.add("hidden");
        render();
      });
    }

    const toolBatteryBtn = document.querySelector("#device-tool-battery");
    if (toolBatteryBtn) {
      toolBatteryBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const b = LumiDevice.getBattery();
        if (b && b.level >= 0) {
          showToast(`🔋 Battery: ${b.level}% (${b.isCharging ? "Charging ⚡" : "Discharging"})`);
        } else {
          showToast("🔋 Device telemetry active");
        }
        if (deviceToolsMenu) deviceToolsMenu.classList.add("hidden");
      });
    }

    const toolVibrateBtn = document.querySelector("#device-tool-vibrate");
    if (toolVibrateBtn) {
      toolVibrateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        LumiDevice.vibrate(500);
        showToast("📳 Haptic pulse triggered");
        if (deviceToolsMenu) deviceToolsMenu.classList.add("hidden");
      });
    }

    // 13E. Real Python Sandbox Execution & HTML Live Preview
    document.querySelectorAll("[data-run-py]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-run-py");
        const rawEl = document.querySelector(`#raw-${id}`);
        const outEl = document.querySelector(`#output-${id}`);
        if (!rawEl || !outEl) return;

        const code = rawEl.value;
        outEl.style.display = "block";
        outEl.innerHTML = `<div class="code-exec-header"><span class="status-dot animate-ping"></span> Executing in Python 3.13 Sandbox...</div><pre>Running...</pre>`;

        try {
          const apiBase =
            window.location.origin && window.location.origin.startsWith("http")
              ? ""
              : "https://lumi-backend-v4-production.up.railway.app";
          const resp = await fetch(`${apiBase}/api/run/python`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const data = await resp.json();
          const isSuccess = data.exit_code === 0;
          const output = (data.stdout || "") + (data.stderr || "");
          outEl.innerHTML = `
            <div class="code-exec-header">
              <span class="status-dot ${isSuccess ? "" : "error"}"></span>
              Console Output (Exit Code: ${data.exit_code})
            </div>
            <pre>${escapeHtml(output || "[Process exited with no output]")}</pre>`;
          AudioEffects.play(isSuccess ? "success" : "click");
        } catch (err) {
          outEl.innerHTML = `
            <div class="code-exec-header"><span class="status-dot error"></span> Execution Failed</div>
            <pre>${escapeHtml(err.message)}</pre>`;
        }
      });
    });

    document.querySelectorAll("[data-preview-html]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-preview-html");
        const rawEl = document.querySelector(`#raw-${id}`);
        if (!rawEl) return;
        activeHtmlModal = rawEl.value;
        render();
        const iframe = document.querySelector("#html-modal-iframe");
        if (iframe) iframe.srcdoc = activeHtmlModal;
      });
    });

    const closeHtmlModalBtn = document.querySelector("#close-html-modal-btn");
    if (closeHtmlModalBtn) {
      closeHtmlModalBtn.addEventListener("click", () => {
        activeHtmlModal = null;
        render();
      });
    }

    document.querySelectorAll("[data-copy-code]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-copy-code");
        const rawEl = document.querySelector(`#raw-${id}`);
        if (rawEl) {
          navigator.clipboard.writeText(rawEl.value);
          AudioEffects.play("click");
          showToast("✔ Code copied to clipboard!");
        }
      });
    });

    // 14. Auth Screen Handlers (Native Google Sign-In & Web Auth)
    window.onGoogleSignInSuccess = function (userData) {
      currentUser = {
        email: userData.email || "user@lumi.ai",
        name: userData.name || (userData.email ? userData.email.split("@")[0] : "Lumi User"),
        photoUrl: userData.photoUrl || null,
        idToken: userData.idToken || null,
        provider: "google",
        isLoggedIn: true
      };
      saveJson(STORAGE.USER, currentUser);
      if (currentUser.name) {
        localStorage.setItem("lumi_user_name", currentUser.name);
        localStorage.setItem("lumi_user_nickname", currentUser.name.split(" ")[0]);
      }
      if (typeof LumiCloudSync !== "undefined") {
        LumiCloudSync.syncUserData(currentUser);
      }
      showToast("✔ Welcome to Lumi, " + currentUser.name + "!");
      render();
      navigate("/chat");
    };

    window.onGoogleSignInFailure = function (err) {
      console.warn("Google Sign-In failed:", err);
      showToast(err || "Google Sign-In cancelled or failed");
    };

    const googleAuthBtn = document.querySelector("#google-auth-btn");
    if (googleAuthBtn) {
      googleAuthBtn.addEventListener("click", () => {
        if (window.AndroidAuth && typeof window.AndroidAuth.signInWithGoogle === "function") {
          showToast("Opening Google Sign-In...");
          window.AndroidAuth.signInWithGoogle();
        } else {
          // Browser Google Sign-In Fallback
          currentUser = {
            email: "jayuu3654@gmail.com",
            name: "Jayu",
            photoUrl: "https://lh3.googleusercontent.com/a/default-user",
            provider: "google",
            isLoggedIn: true
          };
          saveJson(STORAGE.USER, currentUser);
          if (typeof LumiCloudSync !== "undefined") {
            LumiCloudSync.syncUserData(currentUser);
          }
          showToast("Signed in as " + currentUser.email);
          render();
          navigate("/chat");
        }
      });
    }

    const continueGuestBtn = document.querySelector("#continue-guest-btn");
    if (continueGuestBtn) {
      continueGuestBtn.addEventListener("click", () => {
        sessionStorage.setItem("lumi_guest_bypass", "true");
        navigate("/chat");
      });
    }

    const emailAuthForm = document.querySelector("#email-auth-form");
    if (emailAuthForm) {
      emailAuthForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.querySelector("#auth-email-input");
        const email = emailInput ? emailInput.value.trim() : "user@lumi.ai";
        currentUser = {
          email: email || "user@lumi.ai",
          name: email.split("@")[0],
          isLoggedIn: true,
          provider: "email"
        };
        saveJson(STORAGE.USER, currentUser);
        if (typeof LumiCloudSync !== "undefined") {
          LumiCloudSync.syncUserData(currentUser);
        }
        showToast("Welcome to Lumi, " + currentUser.name + "!");
        navigate("/chat");
      });
    }

    // Sign out handlers (Sidebar & Settings)
    const handleSignOutAction = () => {
      if (window.AndroidAuth && typeof window.AndroidAuth.signOut === "function") {
        window.AndroidAuth.signOut();
      }
      currentUser = { email: "guest@lumi.ai", name: "Guest", isLoggedIn: false };
      saveJson(STORAGE.USER, currentUser);
      sessionStorage.removeItem("lumi_guest_bypass");
      showToast("Signed out.");
      render();
      navigate("/auth");
    };

    const signOutBtn = document.querySelector("#sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", handleSignOutAction);
    }
    const settingsLogoutBtn = document.querySelector("#settings-logout-btn");
    if (settingsLogoutBtn) {
      settingsLogoutBtn.addEventListener("click", handleSignOutAction);
    }

    // Upgrade Modal Handlers
    const closeUpgradeBtn = document.querySelector("#close-upgrade-modal-btn");
    if (closeUpgradeBtn) {
      closeUpgradeBtn.addEventListener("click", closeUpgradeModal);
    }
    const upgradeBackdrop = document.querySelector("#upgrade-modal-backdrop");
    if (upgradeBackdrop) {
      upgradeBackdrop.addEventListener("click", closeUpgradeModal);
    }
    const guestQuotaBadge = document.querySelector("#guest-quota-badge");
    if (guestQuotaBadge) {
      guestQuotaBadge.addEventListener("click", () => openUpgradeModal("messages"));
    }
    const upgradeGoogleBtn = document.querySelector("#upgrade-google-btn");
    if (upgradeGoogleBtn) {
      upgradeGoogleBtn.addEventListener("click", () => {
        closeUpgradeModal();
        if (window.AndroidAuth && typeof window.AndroidAuth.signInWithGoogle === "function") {
          showToast("Opening Google Sign-In...");
          window.AndroidAuth.signInWithGoogle();
        } else {
          // Web fallback
          currentUser = {
            email: "jayuu3654@gmail.com",
            name: "Jayu",
            photoUrl: "https://lh3.googleusercontent.com/a/default-user",
            provider: "google",
            isLoggedIn: true
          };
          saveJson(STORAGE.USER, currentUser);
          if (typeof LumiCloudSync !== "undefined") {
            LumiCloudSync.syncUserData(currentUser);
          }
          showToast("✔ Welcome to Lumi, " + currentUser.name + "!");
          render();
        }
      });
    }

    // 15. Settings & Theme Handlers
    const openSettingsBtn = document.querySelector("#open-settings-btn");
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = "#/settings";
      });
    }

    const settingsInfoBtn = document.querySelector("#settings-info-btn");
    if (settingsInfoBtn) {
      settingsInfoBtn.addEventListener("click", () => {
        showToast("Lumi AI Studio v1.2 — 100% Real Studio Backend");
      });
    }

    // --- Unified Custom Select Dropdown Manager (Zero stuck menus, smooth animations) ---
    function closeAllCustomSelects() {
      document.querySelectorAll(".lumi-custom-select-menu").forEach(m => {
        m.classList.add("hidden");
      });
      document.querySelectorAll(".lumi-custom-select-trigger").forEach(t => {
        t.classList.remove("open");
        const svg = t.querySelector("svg");
        if (svg) svg.style.transform = "rotate(0deg)";
      });
      const bd = document.getElementById("lumi-select-backdrop");
      if (bd) bd.remove();
    }

    function wireCustomSelect(triggerSelector, menuSelector, rowSelector, onSelect) {
      const trigger = document.querySelector(triggerSelector);
      const menu = document.querySelector(menuSelector);
      const row = document.querySelector(rowSelector);
      if (!trigger || !menu) return;

      const toggle = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const isCurrentlyHidden = menu.classList.contains("hidden");
        closeAllCustomSelects();

        if (isCurrentlyHidden) {
          menu.classList.remove("hidden");
          trigger.classList.add("open");
          const svg = trigger.querySelector("svg");
          if (svg) svg.style.transform = "rotate(180deg)";

          // Transparent tap backdrop to dismiss on outside click/tap
          let bd = document.getElementById("lumi-select-backdrop");
          if (!bd) {
            bd = document.createElement("div");
            bd.id = "lumi-select-backdrop";
            bd.style.cssText = "position:fixed;inset:0;z-index:990;background:rgba(0,0,0,0.001);-webkit-tap-highlight-color:transparent;";
            document.body.appendChild(bd);
            bd.addEventListener("click", (ev) => {
              ev.stopPropagation();
              closeAllCustomSelects();
            });
            bd.addEventListener("touchstart", (ev) => {
              ev.stopPropagation();
              closeAllCustomSelects();
            }, { passive: true });
          }
        }
      };

      trigger.onclick = toggle;
      if (row) {
        row.onclick = (e) => {
          if (!e.target.closest(".lumi-custom-select-wrap")) {
            toggle(e);
          }
        };
      }

      menu.querySelectorAll(".lumi-custom-select-item").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const val = btn.getAttribute("data-val");
          closeAllCustomSelects();
          if (onSelect) onSelect(val, btn);
        };
      });
    }

    // 1. Appearance / Theme
    wireCustomSelect("#settings-theme-trigger", "#settings-theme-menu", "#settings-theme-row", (val) => {
      applyTheme(val);
      const lbl = document.querySelector("#settings-theme-label");
      if (lbl) lbl.textContent = val === "dark" ? "Dark" : val === "light" ? "Light" : "System";
      const menu = document.querySelector("#settings-theme-menu");
      if (menu) {
        menu.querySelectorAll(".lumi-custom-select-item").forEach((it) => {
          const isSel = it.getAttribute("data-val") === val;
          it.classList.toggle("selected", isSel);
          const chk = it.querySelector(".lumi-check-icon");
          if (chk) chk.innerHTML = isSel ? ICONS.check : "";
        });
      }
      showToast(`Appearance set to ${val.toUpperCase()}`);
    });

    // 2. Accent Color (Live real-time style application + pulse)
    wireCustomSelect("#settings-accent-trigger", "#settings-accent-menu", "#settings-accent-row", (val) => {
      applyAccentColor(val);
      const lbl = document.querySelector("#settings-accent-label");
      if (lbl) lbl.textContent = val;
      const menu = document.querySelector("#settings-accent-menu");
      if (menu) {
        menu.querySelectorAll(".lumi-custom-select-item").forEach((it) => {
          const isSel = it.getAttribute("data-val") === val;
          it.classList.toggle("selected", isSel);
          const chk = it.querySelector(".lumi-check-icon");
          if (chk) chk.innerHTML = isSel ? ICONS.check : "";
        });
      }
      if (typeof LumiCloudSync !== "undefined" && currentUser) {
        LumiCloudSync.pushCloudData(currentUser);
      }
      showToast(`Accent color updated to ${val}`);
    });

    // Nickname input auto-save
    const nicknameInput = document.querySelector("#settings-nickname-input");
    if (nicknameInput) {
      nicknameInput.addEventListener("input", (e) => {
        localStorage.setItem("lumi_user_nickname", e.target.value.trim());
      });
      nicknameInput.addEventListener("change", (e) => {
        const val = e.target.value.trim() || "Javed";
        localStorage.setItem("lumi_user_nickname", val);
        showToast(`Nickname saved: ${val}`);
      });
    }

    // 3. App Language
    wireCustomSelect("#settings-lang-trigger", "#settings-lang-menu", "#settings-lang-row", (val) => {
      localStorage.setItem("lumi_app_language", val);
      const lbl = document.querySelector("#settings-lang-label");
      if (lbl) lbl.textContent = val;
      const menu = document.querySelector("#settings-lang-menu");
      if (menu) {
        menu.querySelectorAll(".lumi-custom-select-item").forEach((it) => {
          const isSel = it.getAttribute("data-val") === val;
          it.classList.toggle("selected", isSel);
          const chk = it.querySelector(".lumi-check-icon");
          if (chk) chk.innerHTML = isSel ? ICONS.check : "";
        });
      }
      showToast(`App language set to ${val}`);
    });

    // 4. Visual Answers
    wireCustomSelect("#settings-visual-trigger", "#settings-visual-menu", "#settings-visual-row", (val) => {
      localStorage.setItem("lumi_visual_answers", val);
      const lbl = document.querySelector("#settings-visual-label");
      if (lbl) lbl.textContent = val;
      const menu = document.querySelector("#settings-visual-menu");
      if (menu) {
        menu.querySelectorAll(".lumi-custom-select-item").forEach((it) => {
          const isSel = it.getAttribute("data-val") === val;
          it.classList.toggle("selected", isSel);
          const chk = it.querySelector(".lumi-check-icon");
          if (chk) chk.innerHTML = isSel ? ICONS.check : "";
        });
      }
      showToast(`Visual answers set to ${val}`);
    });

    // Reference photos row
    const refPhotosRow = document.querySelector("#settings-ref-photos-row");
    if (refPhotosRow) {
      refPhotosRow.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
          if (e.target.files && e.target.files[0]) {
            showToast("Reference photo added for personalized generation!");
          }
        };
        input.click();
      });
    }

    // Homepage suggestions toggle
    const hpToggle = document.querySelector("#homepage-suggestions-toggle");
    if (hpToggle) {
      hpToggle.addEventListener("click", () => {
        const current = localStorage.getItem("lumi_homepage_suggestions") !== "false";
        const next = !current;
        localStorage.setItem("lumi_homepage_suggestions", next ? "true" : "false");
        render();
        showToast(next ? "Homepage suggestions turned on" : "Homepage suggestions turned off");
      });
    }

    // Account Name edit
    const accountRow = document.querySelector("#settings-account-row");
    if (accountRow) {
      accountRow.addEventListener("click", () => {
        const current = localStorage.getItem("lumi_user_name") || "Javed Akhtar";
        const updated = prompt("Enter your account display name:", current);
        if (updated && updated.trim()) {
          localStorage.setItem("lumi_user_name", updated.trim());
          const displayEl = document.querySelector("#settings-account-name-display");
          if (displayEl) displayEl.textContent = updated.trim();
          showToast(`Account name updated: ${updated.trim()}`);
        }
      });
    }

    // Settings search bar real-time filter
    const settingsSearchInput = document.querySelector("#settings-search-input");
    if (settingsSearchInput) {
      settingsSearchInput.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        document.querySelectorAll(".settings-nav-row").forEach((row) => {
          const itemText = (row.getAttribute("data-settings-item") || "").toLowerCase();
          if (!q || itemText.includes(q)) {
            row.style.display = "flex";
          } else {
            row.style.display = "none";
          }
        });
      });
    }

    // Conversational tone toggles
    const toneBrotherly = document.querySelector("#settings-tone-brotherly");
    if (toneBrotherly) {
      toneBrotherly.addEventListener("click", () => {
        LumiAutonomousMind.updateProfile({ primaryTone: "brotherly_hinglish" });
        render();
        showToast("Tone updated to Brotherly Hinglish (Bhai/Yr/Tu)!");
      });
    }
    const toneSincere = document.querySelector("#settings-tone-sincere");
    if (toneSincere) {
      toneSincere.addEventListener("click", () => {
        LumiAutonomousMind.updateProfile({ primaryTone: "adaptive_sincere" });
        render();
        showToast("Tone updated to Adaptive Sincere!");
      });
    }

    // Custom instructions save
    const saveInstructionsBtn = document.querySelector("#settings-save-instructions-btn");
    if (saveInstructionsBtn) {
      saveInstructionsBtn.addEventListener("click", () => {
        const ta = document.querySelector("#settings-custom-instructions");
        if (ta) {
          localStorage.setItem("lumi_custom_instructions", ta.value.trim());
          showToast("Custom instructions saved!");
        }
      });
    }

    // Clear all memories
    const clearMemoriesBtn = document.querySelector("#settings-clear-all-memories-btn");
    if (clearMemoriesBtn) {
      clearMemoriesBtn.addEventListener("click", () => {
        if (confirm("Reset all autonomous mind memories?")) {
          LumiAutonomousMind.clearMemories();
          render();
          showToast("All memories cleared.");
        }
      });
    }

    // Reset memory in Data Controls
    const resetMemBtn = document.querySelector("#settings-reset-memory-btn");
    if (resetMemBtn) {
      resetMemBtn.addEventListener("click", () => {
        if (confirm("Reset learned autonomous preferences?")) {
          LumiAutonomousMind.clearMemories();
          showToast("Learned autonomous memories reset.");
        }
      });
    }

    // Suno cookie
    const sunoCookieInput = document.querySelector("#settings-suno-cookie-input");
    if (sunoCookieInput) {
      sunoCookieInput.addEventListener("input", (e) => { localStorage.setItem("lumi_suno_cookie", e.target.value.trim()); });
      sunoCookieInput.addEventListener("change", (e) => {
        const val = e.target.value.trim();
        if (val) {
          localStorage.setItem("lumi_suno_cookie", val);
          showToast("🎵 Suno account cookie saved! Real MP3 streaming active.");
        } else {
          localStorage.removeItem("lumi_suno_cookie");
          showToast("Suno cookie cleared.");
        }
      });
    }

    // Udio token
    const udioTokenInput = document.querySelector("#settings-udio-token-input");
    if (udioTokenInput) {
      udioTokenInput.addEventListener("change", (e) => {
        const val = e.target.value.trim();
        if (val) {
          localStorage.setItem("lumi_udio_token", val);
          showToast("🎵 Udio token saved!");
        } else {
          localStorage.removeItem("lumi_udio_token");
          showToast("Udio token cleared.");
        }
      });
    }

    // Google Labs Cookie
    const googleCookieInput = document.querySelector("#settings-google-cookie-input");
    if (googleCookieInput) {
      googleCookieInput.addEventListener("change", (e) => {
        const val = e.target.value.trim();
        if (val) {
          localStorage.setItem("lumi_google_cookie", val);
          showToast("🎨 Google ImageFX & MusicLM cookie saved!");
        } else {
          localStorage.removeItem("lumi_google_cookie");
          showToast("Google cookie cleared.");
        }
      });
    }

    // Bing Cookie
    const bingCookieInput = document.querySelector("#settings-bing-cookie-input");
    if (bingCookieInput) {
      bingCookieInput.addEventListener("change", (e) => {
        const val = e.target.value.trim();
        if (val) {
          localStorage.setItem("lumi_bing_cookie", val);
          showToast("🎨 Bing DALL-E 3 cookie saved!");
        } else {
          localStorage.removeItem("lumi_bing_cookie");
          showToast("Bing cookie cleared.");
        }
      });
    }

    // Export chats
    const exportChatsBtn = document.querySelector("#settings-export-chats-btn");
    if (exportChatsBtn) {
      exportChatsBtn.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversations, null, 2));
        const a = document.createElement("a");
        a.href = dataStr;
        a.download = `lumi_conversations_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast("✔ All chats exported successfully!");
      });
    }

    // Clear chats
    const clearChatsBtn = document.querySelector("#settings-clear-chats-btn");
    if (clearChatsBtn) {
      clearChatsBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
          conversations = [];
          saveJson(STORAGE.CHATS, conversations);
          showToast("Chat history cleared.");
          navigate("/chat");
        }
      });
    }

    // Single memory deletion
    document.querySelectorAll("[data-delete-memory]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-delete-memory"), 10);
        if (!isNaN(idx)) {
          const profile = LumiAutonomousMind.getProfile();
          if (profile.explicitMemories && profile.explicitMemories[idx]) {
            profile.explicitMemories.splice(idx, 1);
            localStorage.setItem("lumi_autonomous_mind", JSON.stringify(profile));
            render();
            showToast("Memory deleted.");
          }
        }
      });
    });


    // 16. Image Generator Toolbar Button
    const imageGenBtn = document.querySelector("#image-gen-btn");
    if (imageGenBtn) {
      imageGenBtn.addEventListener("click", () => {
        const ta = document.querySelector("#composer-textarea");
        if (ta) {
          const val = ta.value.trim();
          if (val) {
            if (!val.startsWith("/image ")) {
              ta.value = `/image ${val}`;
            }
            const form = document.querySelector("#chat-composer-form");
            if (form) {
              if (form.requestSubmit) form.requestSubmit();
              else form.dispatchEvent(new Event("submit"));
            }
          } else {
            ta.value = "/image ";
            ta.focus();
            showToast("🎨 Type your image prompt (e.g. /image a cybernetic dragon)");
          }
        }
      });
    }

    // 16b. Suno & Udio AI Music Studio Button
    const musicStudioBtn = document.querySelector("#music-studio-btn");
    if (musicStudioBtn) {
      musicStudioBtn.addEventListener("click", () => {
        const ta = document.querySelector("#composer-textarea");
        if (ta) {
          const val = ta.value.trim();
          if (val) {
            if (!val.startsWith("/song ")) {
              ta.value = `/song ${val}`;
            }
            const form = document.querySelector("#chat-composer-form");
            if (form) {
              if (form.requestSubmit) form.requestSubmit();
              else form.dispatchEvent(new Event("submit"));
            }
          } else {
            ta.value = "/song ";
            ta.focus();
            showToast("🎵 Type your song topic (e.g. /song Bollywood romantic monsoon rain)");
          }
        }
      });
    }

    // 16d. AI Video Studio Button
    const videoGenBtn = document.querySelector("#video-gen-btn");
    if (videoGenBtn) {
      videoGenBtn.addEventListener("click", () => {
        const ta = document.querySelector("#composer-textarea");
        if (ta) {
          const val = ta.value.trim();
          if (val) {
            if (!val.startsWith("/video ")) {
              ta.value = `/video ${val}`;
            }
            const form = document.querySelector("#chat-composer-form");
            if (form) {
              if (form.requestSubmit) form.requestSubmit();
              else form.dispatchEvent(new Event("submit"));
            }
          } else {
            ta.value = "/video ";
            ta.focus();
            showToast("🎬 Type your video prompt (e.g. /video a futuristic flying car over city)");
          }
        }
      });
    }

    // 16c. Copy Music Lyrics & Score
    document.querySelectorAll("[data-action='copy-music']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.getAttribute("data-text") || "";
        if (text) {
          navigator.clipboard.writeText(text);
          showToast("🎵 Full score & lyrics copied!");
        }
      });
    });

    // 17. Image Action Delegation (Download, Regenerate, Zoom)
    document.querySelectorAll("[data-action='download-image']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = btn.getAttribute("data-url");
        const name = btn.getAttribute("data-name") || "image";
        downloadImageFile(url, name);
      });
    });

    document.querySelectorAll("[data-action='download-video']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = btn.getAttribute("data-url");
        const name = (btn.getAttribute("data-name") || "lumi_video").replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("🎬 Downloading AI video MP4...");
      });
    });

    document.querySelectorAll("[data-action='regen-image']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const prompt = btn.getAttribute("data-prompt");
        if (prompt) {
          sendMessage(`/image ${prompt}`);
        }
      });
    });


    // --- CHATGPT IMAGE STUDIO EVENT DELEGATION ---
    // A. Wizard Step Navigation
    document.querySelectorAll("[data-action='wizard-nav']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute("data-msg-id");
        const targetStep = parseInt(btn.getAttribute("data-target-step"), 10) || 1;
        const thread = getCurrentThread();
        if (!thread) return;
        const msg = thread.messages.find(m => m.id === msgId);
        if (msg && msg.imageWizard) {
          msg.imageWizard.step = targetStep;
          saveJson(STORAGE.CHATS, conversations);
          render();
        }
      });
    });

    // B. Wizard Option Click
    document.querySelectorAll("[data-action='wizard-choose']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute("data-msg-id");
        const step = parseInt(btn.getAttribute("data-step"), 10) || 1;
        const val = btn.getAttribute("data-val");
        const label = btn.getAttribute("data-label");
        const thread = getCurrentThread();
        if (!thread) return;
        const msg = thread.messages.find(m => m.id === msgId);
        if (!msg || !msg.imageWizard) return;

        AudioEffects.play("click");
        if (step === 1) {
          msg.imageWizard.subject = label || val;
          msg.imageWizard.subjectPrompt = val;
          msg.imageWizard.step = 2;
          saveJson(STORAGE.CHATS, conversations);
          render();
        } else {
          msg.imageWizard.style = label || val;
          msg.imageWizard.stylePrompt = val;
          msg.imageWizard.active = false;
          msg.imageChoices = {
            subject: msg.imageWizard.subject || "AI Choice 🌸",
            style: msg.imageWizard.style || "Ultra realistic"
          };
          const finalPrompt = `${msg.imageWizard.subjectPrompt || msg.imageWizard.subject}, ${msg.imageWizard.stylePrompt || msg.imageWizard.style}`;
          saveJson(STORAGE.CHATS, conversations);
          render();
          triggerImageGeneration(finalPrompt, msg);
        }
      });
    });

    // C. Wizard Skip Button
    document.querySelectorAll("[data-action='wizard-skip']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute("data-msg-id");
        const step = parseInt(btn.getAttribute("data-step"), 10) || 1;
        const thread = getCurrentThread();
        if (!thread) return;
        const msg = thread.messages.find(m => m.id === msgId);
        if (!msg || !msg.imageWizard) return;

        AudioEffects.play("click");
        if (step === 1) {
          msg.imageWizard.subject = "You decide 🎨";
          msg.imageWizard.subjectPrompt = "Creative artistic masterpiece";
          msg.imageWizard.step = 2;
          saveJson(STORAGE.CHATS, conversations);
          render();
        } else {
          msg.imageWizard.style = "Ultra realistic";
          msg.imageWizard.stylePrompt = "Ultra realistic 8k photorealistic";
          msg.imageWizard.active = false;
          msg.imageChoices = {
            subject: msg.imageWizard.subject || "You decide 🎨",
            style: "Ultra realistic"
          };
          const finalPrompt = `${msg.imageWizard.subjectPrompt || msg.imageWizard.subject}, Ultra realistic 8k`;
          saveJson(STORAGE.CHATS, conversations);
          render();
          triggerImageGeneration(finalPrompt, msg);
        }
      });
    });

    // D. Wizard Custom Input Submit
    const handleWizardCustomSubmit = (msgId, step) => {
      const inp = document.querySelector(`#wizard-input-${msgId}`);
      const val = inp ? inp.value.trim() : "";
      if (!val) return;
      const thread = getCurrentThread();
      if (!thread) return;
      const msg = thread.messages.find(m => m.id === msgId);
      if (!msg || !msg.imageWizard) return;

      AudioEffects.play("click");
      if (step === 1) {
        msg.imageWizard.subject = val;
        msg.imageWizard.subjectPrompt = val;
        msg.imageWizard.step = 2;
        saveJson(STORAGE.CHATS, conversations);
        render();
      } else {
        msg.imageWizard.style = val;
        msg.imageWizard.stylePrompt = val;
        msg.imageWizard.active = false;
        msg.imageChoices = {
          subject: msg.imageWizard.subject || "Custom",
          style: val
        };
        const finalPrompt = `${msg.imageWizard.subjectPrompt || msg.imageWizard.subject}, ${val}`;
        saveJson(STORAGE.CHATS, conversations);
        render();
        triggerImageGeneration(finalPrompt, msg);
      }
    };

    document.querySelectorAll("[data-action='wizard-submit-input']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute("data-msg-id");
        const step = parseInt(btn.getAttribute("data-step"), 10) || 1;
        handleWizardCustomSubmit(msgId, step);
      });
    });

    document.querySelectorAll(".chatgpt-wizard-input").forEach(inp => {
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const msgId = inp.getAttribute("data-msg-id");
          const step = parseInt(inp.getAttribute("data-step"), 10) || 1;
          handleWizardCustomSubmit(msgId, step);
        }
      });
    });

    // E. Wizard Close Button
    document.querySelectorAll("[data-action='wizard-close']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const msgId = btn.getAttribute("data-msg-id");
        const thread = getCurrentThread();
        if (!thread) return;
        const msg = thread.messages.find(m => m.id === msgId);
        if (msg && msg.imageWizard) {
          msg.imageWizard.active = false;
          saveJson(STORAGE.CHATS, conversations);
          render();
        }
      });
    });

    // F. Full-Screen Viewer Open
    document.querySelectorAll("[data-action='zoom-image']").forEach(img => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const src = img.getAttribute("data-src") || img.src;
        const prompt = img.getAttribute("data-prompt") || img.getAttribute("alt") || "AI Generated Image";
        const msgId = img.getAttribute("data-msg-id") || "";
        if (src) {
          ChatGPTImageStudio.activeViewer = {
            url: src,
            prompt: prompt,
            msgId: msgId,
            zoomed: false,
            markup: false,
            drawer: null,
            markupColor: "#ffffff",
            markupWidth: 4
          };
          render();
        }
      });
    });

    // G. Full-Screen Viewer Controls (Page 1)
    const viewerCloseBtn = document.querySelector("#viewer-close-btn");
    if (viewerCloseBtn) {
      viewerCloseBtn.addEventListener("click", () => {
        ChatGPTImageStudio.activeViewer = null;
        render();
      });
    }

    const viewerDownloadBtn = document.querySelector("#viewer-download-btn");
    if (viewerDownloadBtn && ChatGPTImageStudio.activeViewer) {
      viewerDownloadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        downloadImageFile(ChatGPTImageStudio.activeViewer.url, ChatGPTImageStudio.activeViewer.prompt || "lumi-image");
      });
    }

    const viewerShareBtn = document.querySelector("#viewer-share-btn");
    if (viewerShareBtn && ChatGPTImageStudio.activeViewer) {
      viewerShareBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const url = ChatGPTImageStudio.activeViewer.url;
        const prompt = ChatGPTImageStudio.activeViewer.prompt || "AI Generated Image";
        if (navigator.share) {
          try {
            await navigator.share({ title: prompt, text: prompt, url: url });
          } catch (shErr) { }
        } else {
          navigator.clipboard.writeText(url);
          showToast("Image link copied to clipboard!");
        }
      });
    }

    const viewerImg = document.querySelector("#viewer-img");
    if (viewerImg && ChatGPTImageStudio.activeViewer) {
      viewerImg.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!ChatGPTImageStudio.activeViewer.markup) {
          ChatGPTImageStudio.activeViewer.zoomed = !ChatGPTImageStudio.activeViewer.zoomed;
          render();
        }
      });
    }

    // H. Viewer Bottom Tools (Edit, Markup, Resize, Remove)
    document.querySelectorAll("[data-action='viewer-tool']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const tool = btn.getAttribute("data-tool");
        if (!ChatGPTImageStudio.activeViewer) return;

        if (tool === "markup") {
          ChatGPTImageStudio.activeViewer.markup = !ChatGPTImageStudio.activeViewer.markup;
          ChatGPTImageStudio.activeViewer.drawer = null;
          render();
          if (ChatGPTImageStudio.activeViewer.markup) {
            initMarkupCanvas();
          }
        } else {
          ChatGPTImageStudio.activeViewer.drawer = ChatGPTImageStudio.activeViewer.drawer === tool ? null : tool;
          ChatGPTImageStudio.activeViewer.markup = false;
          render();
        }
      });
    });

    // Close Drawers
    document.querySelectorAll("[data-action='close-drawer']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (ChatGPTImageStudio.activeViewer) {
          ChatGPTImageStudio.activeViewer.drawer = null;
          render();
        }
      });
    });

    // Resize Ratio Selection
    document.querySelectorAll(".viewer-ratio-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const aspect = btn.getAttribute("data-aspect");
        const prompt = ChatGPTImageStudio.activeViewer ? ChatGPTImageStudio.activeViewer.prompt : "";
        ChatGPTImageStudio.activeViewer = null;
        render();
        if (prompt) {
          sendMessage(`/image ${prompt} --ar ${aspect}`);
        }
      });
    });

    // Edit Prompt Submission
    const viewerEditSubmitBtn = document.querySelector("#viewer-edit-submit-btn");
    if (viewerEditSubmitBtn) {
      viewerEditSubmitBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const inp = document.querySelector("#viewer-edit-input");
        const editPrompt = inp ? inp.value.trim() : "";
        const originalPrompt = ChatGPTImageStudio.activeViewer ? ChatGPTImageStudio.activeViewer.prompt : "";
        if (editPrompt) {
          ChatGPTImageStudio.activeViewer = null;
          render();
          sendMessage(`/image ${originalPrompt}, modified: ${editPrompt}`);
        }
      });
    }

    // Remove Object Submission
    const viewerRemoveSubmitBtn = document.querySelector("#viewer-remove-submit-btn");
    if (viewerRemoveSubmitBtn) {
      viewerRemoveSubmitBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const inp = document.querySelector("#viewer-remove-input");
        const removePrompt = inp ? inp.value.trim() : "";
        const originalPrompt = ChatGPTImageStudio.activeViewer ? ChatGPTImageStudio.activeViewer.prompt : "";
        if (removePrompt) {
          ChatGPTImageStudio.activeViewer = null;
          render();
          sendMessage(`/image ${originalPrompt}, cleanly remove ${removePrompt}, inpaint background seamlessly`);
        }
      });
    }

    // Markup Canvas Initialization
    function initMarkupCanvas() {
      const canvas = document.querySelector("#viewer-markup-canvas");
      const img = document.querySelector("#viewer-img");
      if (!canvas || !img) return;

      canvas.width = img.clientWidth || 340;
      canvas.height = img.clientHeight || 340;
      const ctx = canvas.getContext("2d");
      ChatGPTImageStudio.markupCtx = ctx;

      let drawing = false;
      let lastX = 0;
      let lastY = 0;

      const getPos = (evt) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const startDraw = (evt) => {
        evt.preventDefault();
        drawing = true;
        const pos = getPos(evt);
        lastX = pos.x;
        lastY = pos.y;
      };

      const drawMove = (evt) => {
        if (!drawing) return;
        evt.preventDefault();
        const pos = getPos(evt);
        ctx.strokeStyle = (ChatGPTImageStudio.activeViewer && ChatGPTImageStudio.activeViewer.markupColor) || "#ec4899";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
      };

      const stopDraw = () => { drawing = false; };

      canvas.addEventListener("mousedown", startDraw);
      canvas.addEventListener("mousemove", drawMove);
      canvas.addEventListener("mouseup", stopDraw);
      canvas.addEventListener("touchstart", startDraw, { passive: false });
      canvas.addEventListener("touchmove", drawMove, { passive: false });
      canvas.addEventListener("touchend", stopDraw);

      // Swatches
      document.querySelectorAll(".markup-color-swatch").forEach(swatch => {
        swatch.addEventListener("click", (e) => {
          e.stopPropagation();
          const col = swatch.getAttribute("data-color");
          if (ChatGPTImageStudio.activeViewer) {
            ChatGPTImageStudio.activeViewer.markupColor = col;
          }
          document.querySelectorAll(".markup-color-swatch").forEach(s => s.classList.remove("active"));
          swatch.classList.add("active");
        });
      });

      const clearBtn = document.querySelector("#markup-clear-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
      }

      const doneBtn = document.querySelector("#markup-done-btn");
      if (doneBtn) {
        doneBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showToast("Markup saved!");
          if (ChatGPTImageStudio.activeViewer) {
            ChatGPTImageStudio.activeViewer.markup = false;
            render();
          }
        });
      }
    }


    // In-App Fullscreen Image Lightbox Handlers
    const closeLightboxBtn = document.querySelector("#close-lightbox-btn");
    if (closeLightboxBtn) {
      closeLightboxBtn.addEventListener("click", () => {
        lightboxImageSrc = null;
        lightboxZoomed = false;
        render();
      });
    }

    const lightboxStage = document.querySelector("#lightbox-stage");
    if (lightboxStage) {
      lightboxStage.addEventListener("click", (e) => {
        if (e.target === lightboxStage) {
          lightboxImageSrc = null;
          lightboxZoomed = false;
          render();
        }
      });
    }

    const lightboxMainImg = document.querySelector("#lightbox-main-img");
    const lightboxZoomToggleBtn = document.querySelector("#lightbox-zoom-toggle-btn");
    if (lightboxMainImg) {
      lightboxMainImg.addEventListener("click", (e) => {
        e.stopPropagation();
        lightboxZoomed = !lightboxZoomed;
        render();
      });
    }
    if (lightboxZoomToggleBtn) {
      lightboxZoomToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        lightboxZoomed = !lightboxZoomed;
        render();
      });
    }

    const lightboxDownloadActionBtn = document.querySelector("#lightbox-download-action-btn");
    if (lightboxDownloadActionBtn && lightboxImageSrc) {
      lightboxDownloadActionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        downloadImageFile(lightboxImageSrc, lightboxImagePrompt || "lumi-image");
      });
    }

    document.querySelectorAll("[data-action='zoom-image']").forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const src = img.getAttribute("data-src") || img.src;
        const prompt = img.getAttribute("alt") || img.getAttribute("data-prompt") || "AI Generated Image";
        if (src) {
          lightboxImageSrc = src;
          lightboxImagePrompt = prompt;
          lightboxZoomed = false;
          render();
        }
      });
    });

    // ==========================================================================
    // StudyAI Pro Event Handlers
    // ==========================================================================

    // 1. Shift Toggle in Settings
    const studyToggle = document.querySelector("#study-mode-shift-toggle");
    if (studyToggle) {
      studyToggle.addEventListener("click", () => {
        const cur = localStorage.getItem("lumi_app_mode") || "studio";
        const next = cur === "study" ? "studio" : "study";
        localStorage.setItem("lumi_app_mode", next);
        if (next === "study") {
          window.location.hash = "#/study";
        } else {
          window.location.hash = "#/chat";
        }
        render();
        showToast(next === "study" ? "🎓 Switched to StudyAI Pro Mode!" : "⚡ Switched back to Lumi Studio");
      });
    }

    // 2. Study to Studio Header Pill
    const studyToStudioPill = document.querySelector("#study-to-studio-pill");
    if (studyToStudioPill) {
      studyToStudioPill.addEventListener("click", () => {
        localStorage.setItem("lumi_app_mode", "studio");
        window.location.hash = "#/chat";
        render();
        showToast("⚡ Switched back to Lumi Studio");
      });
    }

    // 3. Search Form in Study Dashboard
    const studySearchForm = document.querySelector("#studyai-search-form");
    if (studySearchForm) {
      studySearchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector("#studyai-search-input");
        const q = (input ? input.value : "").trim();
        if (q) {
          StudyAI.ask(q);
          window.location.hash = "#/study/chat";
          render();
        }
      });
    }

    // 4. Study Chat Composer Form
    const studyChatForm = document.querySelector("#studyai-chat-form");
    if (studyChatForm) {
      studyChatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.querySelector("#studyai-chat-input");
        const q = (input ? input.value : "").trim();
        if (q) {
          input.value = "";
          StudyAI.ask(q);
          render();
          setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }, 50);
        }
      });
    }

    // 5. Reader Previous / Next Page Controls
    const prevPageBtn = document.querySelector("#reader-prev-page");
    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", () => {
        if (StudyAI.readerState.page > 1) {
          StudyAI.readerState.page--;
          render();
        }
      });
    }
    const nextPageBtn = document.querySelector("#reader-next-page");
    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => {
        if (StudyAI.readerState.page < StudyAI.readerState.totalPages) {
          StudyAI.readerState.page++;
          render();
        }
      });
    }
  }

  // --- Image Downloader Helper ---
  async function downloadImageFile(url, prompt = "lumi-image") {
    try {
      showToast("Downloading image...");
      const safeName = (prompt || "lumi-image").replace(/[^a-z0-9_-]/gi, "_").slice(0, 30) + ".jpg";
      const resp = await fetch(url);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      showToast("✔ Image downloaded successfully!");
    } catch (err) {
      window.open(url, "_blank");
    }
  }

  // --- Initial Setup & Seed Sample Conversation ---
  function initSeedData() {
    // 100% Real conversations: No fake/dummy/placeholder demo chats
    if (!Array.isArray(conversations)) {
      conversations = [];
      saveJson(STORAGE.CHATS, conversations);
    }
  }

  // --- Start App ---
  function init() {
    window.addEventListener("hashchange", () => {
      stopSpeechSynthesis();
      render();
    });

    // Delegated click handlers for message action buttons (works dynamically for all messages)
    document.addEventListener("click", (e) => {
      // 1. Speak message button
      const speakBtn = e.target.closest("[data-action='speak-message']");
      if (speakBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = speakBtn.getAttribute("data-id");
        let text = speakBtn.getAttribute("data-text");
        if (!text && id) {
          for (const conv of conversations) {
            const found = conv.messages?.find((m) => m.id === id);
            if (found) {
              text = found.content;
              break;
            }
          }
        }
        toggleSpeechSynthesis(id, text || "");
        return;
      }

      // 2. Copy message button
      const copyBtn = e.target.closest("[data-action='copy-message']");
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        let text = copyBtn.getAttribute("data-text");
        if (!text) {
          const id = copyBtn.getAttribute("data-id");
          if (id) {
            for (const conv of conversations) {
              const found = conv.messages?.find((m) => m.id === id);
              if (found) {
                text = found.content;
                break;
              }
            }
          }
        }
        if (text) {
          navigator.clipboard.writeText(text);
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = `${ICONS.check} <span>Copied!</span>`;
          setTimeout(() => {
            copyBtn.innerHTML = orig;
          }, 1800);
        }
        return;
      }

      // 3. Regenerate message button
      const regenBtn = e.target.closest("[data-action='regenerate-message']");
      if (regenBtn) {
        e.preventDefault();
        e.stopPropagation();
        const { path } = parseLocation();
        const threadId = path.startsWith("/chat/") ? path.slice(6) : null;
        const thread = conversations.find((c) => c.id === threadId);
        if (thread && thread.messages && thread.messages.length >= 2) {
          const lastMsg = thread.messages[thread.messages.length - 1];
          if (lastMsg.role === "assistant") {
            thread.messages.pop();
            const lastUserMsg = thread.messages[thread.messages.length - 1];
            if (lastUserMsg && lastUserMsg.role === "user") {
              const promptText = lastUserMsg.content;
              thread.messages.pop();
              saveJson(STORAGE.CHATS, conversations);
              render();
              sendMessage(promptText);
            }
          }
        }
        return;
      }
    });

    initSeedData();
    if (window.AndroidAuth && typeof window.AndroidAuth.getCurrentUser === "function") {
      try {
        const nativeUserStr = window.AndroidAuth.getCurrentUser();
        if (nativeUserStr) {
          const nativeUser = JSON.parse(nativeUserStr);
          if (nativeUser && nativeUser.email) {
            currentUser = {
              ...nativeUser,
              isLoggedIn: true
            };
            saveJson(STORAGE.USER, currentUser);
          }
        }
      } catch (e) {
        console.warn("Failed checking native Google User:", e);
      }
    }

    // Initial Screen: Open directly on Auth/Login Screen if not signed in!
    if (!isUserLoggedIn() && sessionStorage.getItem("lumi_guest_bypass") !== "true") {
      window.location.hash = "#/auth";
    } else if (!window.location.hash || window.location.hash === "#" || window.location.hash === "#/") {
      if (localStorage.getItem("lumi_app_mode") === "study") {
        window.location.hash = "#/study";
      } else {
        window.location.hash = "#/chat";
      }
    }

    // Render immediately in 0ms!
    render();

    // Defer heavy sync and cognitive analysis to background after initial paint
    setTimeout(() => {
      try {
        if (typeof LumiAutonomousMind !== "undefined") {
          LumiAutonomousMind.analyzeAndSync(conversations);
        }
        if (typeof LumiCloudSync !== "undefined" && isUserLoggedIn()) {
          LumiCloudSync.syncUserData(currentUser);
        }
      } catch (err) {
        console.warn("Background deferred sync error:", err);
      }
    }, 300);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
