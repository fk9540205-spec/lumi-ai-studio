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
    { id: "llama-3.3-70b", label: "Llama 3.3 70B (Free Ultra Fast)", group: "Free AI Engine" },
    { id: "qwen-2.5-coder-32b", label: "Qwen 2.5 Coder 32B (Free Coding)", group: "Free AI Engine" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Free)", group: "Free AI Engine" },
    { id: "deepseek-distill-qwen-32b", label: "DeepSeek Reasoning (Free)", group: "Free AI Engine" },
    { id: "mistral-small-3.1-24b", label: "Mistral Small (Free)", group: "Free AI Engine" },
  ];

  // --- Provider Catalog for Adding New Ones ---
  const PROVIDER_TEMPLATES = [
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
    model: "llama-3.3-70b",
  });
  // Auto-upgrade to ultra-fast Llama 3.3 70B if user had slow/thinking gpt-4o-mini
  if (!selectedModel.provider_id && (selectedModel.model === "gpt-4o-mini" || selectedModel.model === "qwen-2.5-coder-32b")) {
    selectedModel.model = "llama-3.3-70b";
    saveJson(STORAGE.MODEL, selectedModel);
  }
  let currentUser = loadJson(STORAGE.USER, {
    email: "creator@lovable.app",
    name: "Lumi Creator",
  });

  let searchQuery = "";
  let sidebarOpen = false;
  let modelMenuOpen = false;
  let activeModal = null; // 'add-provider' | 'edit-provider' | null
  let editingProvider = null;
  let editingChatId = null;

  let isStreaming = false;
  let streamAbortController = null;
  let pendingQueryText = ""; // query passed via URL search or suggestions

  // Super-Feature States: Audio, Voice & Search
  let soundEnabled = loadJson("lumi_sound_enabled", true);
  let webSearchEnabled = loadJson("lumi_web_search_enabled", false);
  let isListening = false;
  let recognitionInstance = null;
  let currentlySpeakingId = null;

  // Real System Personas
  const PERSONA_PROMPTS = {
    general: "You are Lumi, a top-tier, highly articulate AI companion. Format your responses with clean, professional elegance. Do NOT clutter responses with excessive asterisks (**) or bold text on every phrase. Use clean headings, well-structured bullet points, and natural prose. When live search results are provided, synthesize the facts directly with confidence and authority.",
    engineer: "You are an elite Senior Staff Software Engineer. Focus on clean, modular, production-ready code, idiomatic architecture, robust error handling, edge cases, and peak performance. Provide complete, runnable code examples without unnecessary filler.",
    dsa: "You are an expert Data Structures & Algorithms (DSA) and Coding Interview Coach. Explain problem-solving patterns intuitively, break down step-by-step algorithms, analyze Time & Space Complexity (Big-O), and write clean, optimal implementations.",
    hindi: "Aap Lumi ho, ek aadhunik, super-intelligent aur professional AI sathi. Baat-cheet bilkul swachh, aasan aur natural Hindi / Hinglish mein karo. Format ko bilkul clean aur professional rakhein — har line ya label par baar-baar **bold** ya asterisks lagane se bachein. Seedha, sundar aur vistarit uttar dein.",
    bughunter: "You are a Senior Code Auditor and Bug Hunter. Thoroughly inspect code for security vulnerabilities, race conditions, memory leaks, and edge cases with minimal, concrete fixes.",
    writer: "You are a master creative writer, storyteller, and copywriter. Craft vivid, compelling, engaging, and beautifully phrased prose with powerful narrative flow.",
    artist: "You are an AI Artist & Image Generator. When the user describes any image, scene, or concept, describe it evocatively and create stunning visual art."
  };

  const GENUI_SYSTEM_INSTRUCTION = `
[PROFESSIONAL FORMATTING & TYPOGRAPHY GUIDELINES]
1. ELEGANT & CLEAN FORMATTING (STRICT):
   - Never spam asterisks (**) or bold text on every single line, sub-point, or phrase.
   - Do NOT use repetitive boilerplate bold labels like "**Kyu zaroori hai:**" or "**Kaise karein:**" or "**Samanya galti:**" repeatedly.
   - Format lists cleanly: "1. Heading Title — Concise, natural explanation."
   - Use clear markdown headers (### Section Title) for distinct sections rather than bolding entire inline lines.
   - Keep line breaks and whitespace balanced for effortless readability.

2. DIRECT & FACTUAL ANSWERS:
   - Immediately output your response without any <think> tags, internal deliberations, or planning scratchpads.
   - When live web search or verified knowledge is provided, synthesize the facts and deliver an authoritative, clear answer. Never say you cannot browse or lack real-time access.
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
    engineer: "💻 Senior Engineer",
    dsa: "🧠 DSA Coach",
    hindi: "🇮🇳 Hindi Companion",
    bughunter: "🐛 Bug Hunter",
    writer: "✍️ Creative Writer",
    artist: "🎨 Image Artist"
  };

  const PERSONA_ICONS = {
    general: "🌟",
    engineer: "💻",
    dsa: "🧠",
    hindi: "🇮🇳",
    bughunter: "🐛",
    writer: "✍️",
    artist: "🎨",
  };

  const PERSONA_SHORT_LABELS = {
    general: "AI",
    engineer: "Dev",
    dsa: "DSA",
    hindi: "Hindi",
    bughunter: "Bug",
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
      } catch {}
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

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }

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
        "rich_message"
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

    renderBlock(block) {
      if (!block || typeof block !== "object") return "";
      const type = (block.type || "").toLowerCase().replace(/_card$/, "");

      switch (type) {
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
          <div class="font-semibold text-xs text-indigo-400 mb-0.5 uppercase tracking-wide">🏆 Lumi Recommendation</div>
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

    renderActionsCard(b) {
      const actions = Array.isArray(b.actions) ? b.actions : Array.isArray(b.buttons) ? b.buttons : Array.isArray(b.chips) ? b.chips : [];
      return `<div class="genui-card genui-actions-card p-3">${this.renderActionsRow(actions)}</div>`;
    },

    renderAccordionCard(b) {
      const title = escapeHtml(b.title || "FAQ / Expandable Sections");
      const items = Array.isArray(b.items) ? b.items : [];

      const itemsHtml = items.map((it, idx) => {
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
    } catch {}

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
    } catch {}

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
      } catch (e) {}
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
              ${
                isPython
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
      <aside class="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
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
          ${
            filtered.length === 0
              ? `<p class="px-3 py-4 text-xs text-muted-foreground text-center">No chats yet</p>`
              : filtered
                  .map((chat) => {
                    const isActive = chat.id === activeThreadId;
                    const isEditing = editingChatId === chat.id;

                    return `
                    <div class="group relative flex items-center rounded-lg text-sm transition-colors hover:bg-sidebar-accent ${
                      isActive ? "bg-sidebar-accent font-medium text-foreground" : "text-muted-foreground"
                    }">
                      ${
                        isEditing
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
          <span class="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground select-none shrink-0">
            ${escapeHtml((currentUser.email || "Y")[0])}
          </span>
          <span class="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
            ${escapeHtml(currentUser.email || "Guest")}
          </span>
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
            ${
              f.isImage && f.dataUrl
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

  function renderSettingsModal() {
    if (!settingsModalOpen) return "";
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="settings-modal-overlay">
        <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl text-foreground flex flex-col gap-4 animate-in fade-in zoom-in-95" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base text-primary">${ICONS.settings}</span>
              <h3 class="font-semibold text-sm">Settings</h3>
            </div>
            <button
              type="button"
              class="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
              id="close-settings-modal-btn"
              title="Close"
            >
              ✕
            </button>
          </div>

          <!-- Mode / Theme Options -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Appearance / Theme</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                class="theme-toggle-btn flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  currentTheme === "light"
                    ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                    : "border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground"
                }"
                data-set-theme="light"
              >
                <span class="text-lg">☀️</span>
                <span class="text-xs font-medium">White Mode</span>
              </button>
              <button
                type="button"
                class="theme-toggle-btn flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  currentTheme === "dark"
                    ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                    : "border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground"
                }"
                data-set-theme="dark"
              >
                <span class="text-lg">🌙</span>
                <span class="text-xs font-medium">Dark Mode</span>
              </button>
              <button
                type="button"
                class="theme-toggle-btn flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                  currentTheme === "system"
                    ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                    : "border-border bg-secondary/30 hover:bg-secondary/60 text-muted-foreground"
                }"
                data-set-theme="system"
              >
                <span class="text-lg">💻</span>
                <span class="text-xs font-medium">Auto System</span>
              </button>
            </div>
          </div>

          <!-- AI & Providers -->
          <div class="flex flex-col gap-1.5 pt-2 border-t border-border">
            <label class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI & Models</label>
            <a
              href="#/providers"
              class="flex items-center justify-between p-2.5 rounded-xl border border-border bg-secondary/20 hover:bg-secondary/50 transition-colors text-xs"
              id="settings-goto-providers"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-base">⚡</span>
                <div>
                  <div class="font-medium text-foreground">AI Providers & API Keys</div>
                  <div class="text-[10px] text-muted-foreground">Gemini Vision, OpenAI, Ollama, Groq</div>
                </div>
              </div>
              <span class="text-muted-foreground text-xs font-bold">→</span>
            </a>
          </div>

          <!-- Chat Data Management -->
          <div class="flex flex-col gap-1.5 pt-2 border-t border-border">
            <label class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Chat History</label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex-1 inline-flex items-center justify-center gap-1 text-xs py-2 px-2.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary text-foreground font-medium transition-colors cursor-pointer"
                id="settings-export-chats-btn"
              >
                ${ICONS.export} <span>Export All</span>
              </button>
              <button
                type="button"
                class="flex-1 inline-flex items-center justify-center gap-1 text-xs py-2 px-2.5 rounded-xl border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium transition-colors cursor-pointer"
                id="settings-clear-chats-btn"
              >
                ${ICONS.trash} <span>Clear Chats</span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Lumi AI Studio v1.2</span>
            <span class="text-emerald-500 font-medium">● Free Engine Active</span>
          </div>
        </div>
      </div>`;
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
              class="model-item-btn ${
                !selectedModel.provider_id && selectedModel.model === m.id ? "is-active" : ""
              }"
              data-select-model="builtin::${m.id}"
            >
              <span>${escapeHtml(m.label)}</span>
              ${
                !selectedModel.provider_id && selectedModel.model === m.id
                  ? ICONS.check
                  : ""
              }
            </button>`
          ).join("")}

          ${
            providers.length > 0
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
          <textarea
            id="composer-textarea"
            name="message"
            rows="1"
            autofocus
            placeholder="${escapeHtml(placeholder)}"
            class="w-full resize-none rounded-3xl border-0 bg-transparent px-5 pt-4 pb-2 text-[15px] outline-none placeholder:text-muted-foreground min-h-[56px] max-h-48"
          ></textarea>

          <div class="flex items-center justify-between gap-2 px-3 pb-3">
            <div class="flex min-w-0 items-center gap-2">
              ${renderModelPicker("composer")}

              <button
                type="button"
                id="attach-file-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer"
                title="Attach files or documents (.pdf, .txt, .py, .js, .csv, .md, .json)"
              >
                ${ICONS.paperclip}
              </button>

              <button
                type="button"
                id="toggle-sound-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer"
                title="${soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}"
              >
                ${soundEnabled ? ICONS.volume : ICONS.volumeMute}
              </button>

              <button
                type="button"
                id="toggle-web-search-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs ${webSearchEnabled ? "text-primary border-primary/60 bg-primary/10 shadow-xs ring-1 ring-primary/40" : "text-muted-foreground hover:text-foreground"} transition-all backdrop-blur shadow-xs cursor-pointer"
                title="${webSearchEnabled ? "Live Web Search: Active (Click to disable)" : "Live Web Search: Off (Click to enable)"}"
              >
                ${ICONS.globe}
              </button>

              <button
                type="button"
                id="image-gen-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors backdrop-blur shadow-xs cursor-pointer"
                title="Generate AI Image (/image)"
              >
                ${ICONS.image}
              </button>
            </div>

            <div class="flex items-center gap-1.5" id="composer-submit-wrapper">
              <button
                type="button"
                id="voice-call-trigger-btn"
                class="${isStreaming ? "hidden" : "inline-flex"} size-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 cursor-pointer"
                title="Voice Call"
              >
                ${ICONS.mic}
              </button>
              <button
                type="submit"
                id="submit-prompt-btn"
                class="hidden size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send message"
              >
                ${ICONS.cornerDownLeft}
              </button>
              <button
                type="button"
                id="stop-generation-btn"
                class="${isStreaming ? "inline-flex" : "hidden"} size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
                title="Stop generation"
              >
                ${ICONS.square}
              </button>
            </div>
          </div>
        </form>
      </div>`;
  }

  // 4. EMPTY CHAT STATE
  function renderEmptyChat() {
    return `
      <div class="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-16 min-h-0">
        <div class="aurora opacity-40"></div>

        <div class="relative z-10 w-full max-w-2xl text-center">
          <!-- Floating Mascot -->
          <img src="${LUMI_LOGO}" alt="Lumi" width="816" height="816" class="animate-float-soft mx-auto size-14 object-contain select-none drop-shadow" />

          <h1 class="animate-rise-in mt-6 text-center font-display text-4xl md:text-5xl tracking-tight text-foreground">
            What's on your mind?
          </h1>

          <div class="animate-rise-in mt-8 [animation-delay:100ms] text-left">
            ${renderComposer("Ask Lumi anything…", false)}
          </div>

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
        </div>
      </div>`;
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
                    <div class="animate-rise-in user-msg-row" id="msg-row-${msg.id}">
                      ${
                        msg.attachedFiles && msg.attachedFiles.length > 0
                          ? `<div class="flex flex-wrap justify-end gap-1.5 mb-1">
                              ${msg.attachedFiles.map(f => `<span class="attachment-chip text-[11px] py-0.5 px-2">${f.isImage && f.dataUrl ? `<img src="${f.dataUrl}" class="size-3.5 object-cover rounded-xs inline-block mr-1" />` : f.isPdf ? "📑 " : "📄 "}${escapeHtml(f.name)} (${formatBytes(f.size)})</span>`).join('')}
                            </div>`
                          : ""
                      }
                      <div class="user-msg-bubble">${escapeHtml(msg.content.trim())}</div>
                    </div>`;
                }

                // Assistant Message
                const rawText = msg.content || "";
                const isCurrentlyStreaming =
                  isStreaming && index === messages.length - 1;

                return `
                  <div class="animate-rise-in flex gap-3.5 items-start" id="msg-row-${msg.id}">
                    <img src="${LUMI_LOGO}" alt="Lumi" class="mt-0.5 size-6 shrink-0 object-contain select-none" />
                    
                    <div class="min-w-0 flex-1">
                      ${
                        msg.scrapedUrl
                          ? `<div class="mb-2">
                              <a href="${escapeHtml(msg.scrapedUrl.url)}" target="_blank" rel="noopener" class="url-scrape-badge">
                                ${ICONS.globe} <span>Scraped: ${escapeHtml(msg.scrapedUrl.title)}</span>
                              </a>
                            </div>`
                          : ""
                      }

                      <!-- Real-Time Web Search Source Badges (if search query) -->
                      ${
                        msg.searchResults && msg.searchResults.length > 0
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
                        ${
                          isCurrentlyStreaming && !rawText
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

                      <!-- AI Image Generation Result / Loading Card -->
                      ${
                        msg.imageLoading
                          ? `
                        <div class="ai-image-card p-6 flex flex-col items-center justify-center gap-3 text-center my-3 border border-border bg-card/60 rounded-2xl">
                          <div class="relative size-12 flex items-center justify-center">
                            <div class="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                            <span class="text-xl">🎨</span>
                          </div>
                          <div class="text-sm font-medium text-foreground">Generating high-definition AI image...</div>
                          <div class="text-xs text-muted-foreground truncate max-w-xs font-mono">"${escapeHtml(msg.imagePrompt || "")}"</div>
                        </div>`
                          : msg.imageUrl
                          ? `
                        <div class="ai-image-card my-3">
                          <img src="${escapeHtml(msg.imageUrl)}" alt="${escapeHtml(msg.imagePrompt || "Generated Image")}" loading="lazy" class="cursor-pointer" data-action="zoom-image" data-src="${escapeHtml(msg.imageUrl)}" />
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

                      ${
                        !isCurrentlyStreaming && (rawText || msg.imageUrl)
                          ? `
                        <div class="mt-2.5 flex items-center flex-wrap gap-2">
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


                          
                          ${
                            isLastAssistant
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
              })
              .join("")}

            <!-- Thinking Pulse State -->
            ${
              isStreaming && messages.length > 0 && messages[messages.length - 1].role === "user"
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
        <div class="mx-auto w-full max-w-3xl px-4 pb-5 pt-2">
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
            ${
              providers.length === 0
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
      <div class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
        <div class="aurora opacity-60"></div>

        <div class="animate-rise-in relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card/90 p-8 shadow-composer backdrop-blur">
          <a class="mx-auto block w-fit" href="#/" aria-label="Lumi home">
            <img src="${LUMI_LOGO}" alt="Lumi" class="size-12 object-contain select-none" />
          </a>

          <h1 class="mt-5 text-center font-display text-3xl font-normal text-foreground">Welcome back</h1>
          <p class="mt-1 text-center text-xs text-muted-foreground">Sign in to save and sync your conversations.</p>

          <div class="mt-6 space-y-2.5">
            <!-- Google Button -->
            <button
              type="button"
              id="google-auth-btn"
              class="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
            >
              ${ICONS.google} <span>Continue with Google</span>
            </button>

            <!-- Lovable Button -->
            <button
              type="button"
              id="lovable-auth-btn"
              class="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-accent transition-colors shadow-2xs"
            >
              <img src="${LOVABLE_MARK}" class="size-4 object-contain" alt="" />
              <span>Continue with Lovable</span>
            </button>
          </div>

          <div class="relative my-6 text-center text-xs text-muted-foreground after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-border after:-z-10">
            <span class="bg-card px-2 font-medium">or</span>
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
                value="creator@lovable.app"
              />
            </div>

            <button
              type="submit"
              class="h-11 w-full rounded-full bg-primary font-medium text-sm text-primary-foreground hover:bg-primary/90 transition-transform active:scale-98"
            >
              Continue with Email
            </button>
          </form>

          <div class="mt-5 pt-3 border-t border-border/60 text-center">
            <a href="#/chat" class="text-xs text-muted-foreground hover:text-foreground hover:underline">
              Continue as Guest &rarr;
            </a>
          </div>
        </div>
      </div>`;
  }

  // --- Real API Streaming Integration ---
  async function streamFromCustomProvider(provider, modelName, promptText, onChunk, abortSignal) {
    const isAnthropic = provider.protocol === "anthropic";
    const apiKey = provider.apiKey || "";

    if (isAnthropic) {
      const response = await fetch(`${provider.base_url.replace(/\/+$/, "")}/messages`, {
        method: "POST",
        signal: abortSignal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          ...(provider.headers || {}),
        },
        body: JSON.stringify({
          model: modelName || provider.default_model || "claude-3-5-sonnet-20241022",
          max_tokens: 4096,
          messages: [{ role: "user", content: promptText }],
          stream: true,
        }),
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
            } catch {}
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
        messages: [{ role: "user", content: promptText }],
        stream: true,
        max_tokens: 4096,
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
          } catch {}
        }
      }
      if (done) break;
    }
  }

  // --- Send Message & Live Streaming Execution ---
  async function sendMessage(text) {
    const prompt = text.trim();
    if (!prompt || isStreaming) return;
    stopSpeechSynthesis();

    let { path } = parseLocation();
    let threadId = path.startsWith("/chat/") ? path.slice(6) : null;
    let thread = conversations.find((c) => c.id === threadId);

    // Create a new thread if not in one
    if (!thread) {
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
      navigate(`/chat/${threadId}`);
    }

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

    // In-place append if chat container exists, preventing full-screen repaint/flash!
    const msgsContainer = document.querySelector("#chat-messages-container .space-y-7");
    if (msgsContainer) {
      const userHtml = `
        <div class="animate-rise-in user-msg-row" id="msg-row-${userMsg.id}">
          ${
            userMsg.attachedFiles && userMsg.attachedFiles.length > 0
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
    } else {
      render();
      scrollToBottom();
    }

    // 1. FREE HIGH-RESOLUTION IMAGE GENERATION (/image, /imagine, or visual prompt)
    const isImageCommand =
      /^\/(?:image|img|imagine)\s+/i.test(prompt) ||
      /^(?:generate image of|generate image|image of|draw a|draw an|paint a|create an image of|create image of)\s*/i.test(prompt) ||
      /\b(photo banao|image bana do|image banao|tasveer banao|picture bana do|photo generate karo)\b/i.test(prompt) ||
      activePersona === "artist";

    if (isImageCommand) {
      let imagePrompt = prompt
        .replace(/^\/(?:image|img|imagine)\s+/i, "")
        .replace(/^(?:generate image of|generate image|image of|draw a|draw an|paint a|create an image of|create image of)\s*/i, "")
        .replace(/\b(photo banao|image bana do|image banao|tasveer banao|picture bana do|photo generate karo)\b/i, "")
        .trim();
      if (!imagePrompt) imagePrompt = prompt.trim();

      assistantMsg.imagePrompt = imagePrompt;
      assistantMsg.imageLoading = true;
      assistantMsg.content = `🎨 **Generating Flux AI Image** for: *"**${escapeHtml(imagePrompt)}**"*...`;
      saveJson(STORAGE.CHATS, conversations);
      render();
      scrollToBottom();

      const seed = Math.floor(Math.random() * 999999);
      const targetUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

      const preloader = new Image();
      preloader.onload = () => {
        assistantMsg.imageUrl = targetUrl;
        assistantMsg.imageLoading = false;
        assistantMsg.content = `✨ **Flux AI Image Generated** for: *"**${escapeHtml(imagePrompt)}**"*`;
        isStreaming = false;
        saveJson(STORAGE.CHATS, conversations);
        AudioEffects.play("success");
        render();
        scrollToBottom();
      };
      preloader.onerror = () => {
        assistantMsg.imageUrl = targetUrl;
        assistantMsg.imageLoading = false;
        assistantMsg.content = `✨ **Flux AI Image Generated** for: *"**${escapeHtml(imagePrompt)}**"*`;
        isStreaming = false;
        saveJson(STORAGE.CHATS, conversations);
        render();
        scrollToBottom();
      };
      preloader.src = targetUrl;
      return;
    }

    // 2. LIVE REAL-TIME WEATHER & WEB SEARCH
    let webContext = "";
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

        let keywordQuery = cleanQuery
          .replace(/\b(who is|what is|when is|where is|tell me|explain|give me|the|ke|ki|ka|ko|mein|se|par|hain|hai|kaun|kya|kab|kahan|kise|kiske|batao|bataiye|dikhaye|chahiye)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        const searchQuery = keywordQuery || cleanQuery || prompt;

        let searchResults = [];

        // 1. Try Backend Multi-Source Web Search
        try {
          const apiBase =
            window.location.origin && window.location.origin.startsWith("http")
              ? ""
              : "https://lumi-backend-v4-production.up.railway.app";
          const searchController = new AbortController();
          const searchTimeout = setTimeout(() => searchController.abort(), 3500);
          const searchResp = await fetch(`${apiBase}/api/search?q=${encodeURIComponent(searchQuery)}`, {
            signal: searchController.signal,
          });
          clearTimeout(searchTimeout);

          if (searchResp.ok) {
            const searchData = await searchResp.json();
            if (Array.isArray(searchData.results) && searchData.results.length > 0) {
              searchResults = searchData.results;
            }
          }
        } catch (err) {
          console.warn("Backend web search failed:", err);
        }

        // 2. Direct Wikipedia Client Fallback if backend returned 0 or poor results
        if (!searchResults.length) {
          try {
            const keywordQuery = searchQuery
              .replace(/\b(who is|what is|when is|where is|the|current|ke|ki|ka|ko|mein|se|par|hain|hai|kaun|kya|kab|kahan|kise|kiske|batao|bataiye)\b/gi, "")
              .replace(/\s+/g, " ")
              .trim();
            const targetWikiQuery = keywordQuery || searchQuery;
            const wikiResp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(targetWikiQuery)}&format=json&origin=*`);
            if (wikiResp.ok) {
              const wikiData = await wikiResp.json();
              const items = wikiData.query?.search || [];
              searchResults = items.slice(0, 5).map(it => {
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
            console.warn("Direct Wikipedia search fallback failed:", wikiErr);
          }
        }

        if (searchResults.length > 0) {
          assistantMsg.searchResults = searchResults;
          webContext = `\n\n[OFFICIAL VERIFIED LIVE WEB KNOWLEDGE FOR: "${searchQuery}"]:\n` +
            searchResults.map((r, i) => `[Source ${i + 1}: ${r.title}]\nSnippet: ${r.snippet}\nSource URL: ${r.url}`).join("\n\n") +
            `\n\n(CRITICAL INSTRUCTION: You HAVE just executed a live web search and retrieved the live verified facts above. Synthesize this information and answer the user's question completely, accurately, and naturally. NEVER output disclaimers saying "I cannot search the web", "I don't have internet access", or "I cannot browse live links". Present the verified facts directly in your response.)\n`;
          render();
          scrollToBottom();
        }
      }
    }

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
      const customProv = selectedModel.provider_id
        ? providers.find((p) => p.id === selectedModel.provider_id)
        : null;

      if (customProv && customProv.enabled) {
        // Live streaming from custom configured endpoint
        await streamFromCustomProvider(
          customProv,
          selectedModel.model,
          prompt,
          onChunk,
          streamAbortController.signal
        );
      } else {
        // Built-in Real Free AI Streaming via backend /api/free/chat
        const apiBase =
          window.location.origin && window.location.origin.startsWith("http")
            ? ""
            : "https://lumi-backend-v4-production.up.railway.app";

        let streamedSuccessfully = false;
        try {
          const systemPrompt = (PERSONA_PROMPTS[activePersona] || PERSONA_PROMPTS.general) + "\n" + GENUI_SYSTEM_INSTRUCTION;
          const chatHistory = [
            { role: "system", content: systemPrompt },
            ...thread.messages
              .filter((m) => m.id !== assistantMsgId && m.content)
              .map((m) => ({ role: m.role, content: m.content }))
          ];

          const extraContext = (webContext || "") + (scrapedContext || "") + (fileContext || "");
          if (extraContext && chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].content += extraContext;
          }

          // Direct high-capacity streaming with instant fallback to backend
          let resp = null;
          if (!imagePayload) {
            try {
              resp = await fetch("https://text.pollinations.ai/openai/chat/completions", {
                method: "POST",
                signal: streamAbortController.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: "openai",
                  messages: chatHistory,
                  stream: true,
                  max_tokens: 4096,
                }),
              });
            } catch (directErr) {
              console.warn("Direct cluster streaming bypassed, falling back to backend:", directErr);
            }
          }

          if (!resp || !resp.ok) {
            resp = await fetch(`${apiBase}/api/free/chat`, {
              method: "POST",
              signal: streamAbortController.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: selectedModel.model || "llama-3.3-70b",
                messages: chatHistory,
                image: imagePayload,
                stream: true,
                max_tokens: 4096,
              }),
            });
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
                  } catch {}
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

      const stopBtn = document.querySelector("#stop-generation-btn");
      const submitBtn = document.querySelector("#submit-prompt-btn");
      const voiceBtn = document.querySelector("#voice-call-trigger-btn");
      const ta = document.querySelector("#composer-textarea");
      if (stopBtn) {
        stopBtn.classList.add("hidden");
        stopBtn.classList.remove("inline-flex");
      }
      const hasText = ta && ta.value.trim().length > 0;
      if (hasText) {
        if (submitBtn) {
          submitBtn.classList.remove("hidden");
          submitBtn.classList.add("inline-flex");
        }
        if (voiceBtn) {
          voiceBtn.classList.add("hidden");
          voiceBtn.classList.remove("inline-flex");
        }
      } else {
        if (voiceBtn) {
          voiceBtn.classList.remove("hidden");
          voiceBtn.classList.add("inline-flex");
        }
        if (submitBtn) {
          submitBtn.classList.add("hidden");
          submitBtn.classList.remove("inline-flex");
        }
      }

      scrollToBottom(true);
    }
  }

  window.sendMessage = sendMessage;

  // --- Voice, Code Runner & Project Helpers ---
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
        try { window.AndroidAudio.restoreSystemSounds(); } catch {}
      }
      render();
      return;
    }
    try {
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch {}
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
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const textarea = document.querySelector("#composer-textarea");
        if (textarea) {
          textarea.value = transcript;
          textarea.style.height = "auto";
          textarea.style.height = Math.min(textarea.scrollHeight, 192) + "px";
        }
      };
      recognitionInstance.onerror = () => {
        isListening = false;
        if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
          try { window.AndroidAudio.restoreSystemSounds(); } catch {}
        }
        render();
      };
      recognitionInstance.onend = () => {
        isListening = false;
        if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
          try { window.AndroidAudio.restoreSystemSounds(); } catch {}
        }
        render();
      };
      recognitionInstance.start();
    } catch (e) {
      isListening = false;
      if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
        try { window.AndroidAudio.restoreSystemSounds(); } catch {}
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
    } catch (e) {}
  }

  function updateSpeechUI() {
    document.querySelectorAll("[data-action='speak-message']").forEach((btn) => {
      const id = btn.getAttribute("data-id");
      const isSpeaking = currentlySpeakingId && (currentlySpeakingId === id);
      btn.className = `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
        isSpeaking ? "text-primary bg-primary/10 font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-accent"
      } transition-colors cursor-pointer`;
      btn.title = isSpeaking ? "Stop voice" : "Read aloud";
      btn.innerHTML = `${isSpeaking ? ICONS.volumeMute : ICONS.volume} <span>${isSpeaking ? "Speaking..." : "Listen"}</span>`;
    });
  }

  function stopSpeechSynthesis() {
    if (window.AndroidTTS && typeof window.AndroidTTS.stop === "function") {
      try {
        window.AndroidTTS.stop();
      } catch (e) {}
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
      } catch (e) {}
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
          } catch (e) {}
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
    { id: "nova", name: "Nova", provider: "OpenAI", desc: "Warm, natural conversational tone" },
    { id: "alloy", name: "Alloy", provider: "OpenAI", desc: "Dynamic and expressive balanced voice" },
    { id: "shimmer", name: "Shimmer", provider: "OpenAI", desc: "Clear, cheerful and melodic tone" },
    { id: "onyx", name: "Onyx", provider: "OpenAI", desc: "Deep, warm and grounded male voice" },
    { id: "swara", name: "Swara", provider: "IndicF5", desc: "Natural native Hindi & Hinglish female voice" },
    { id: "madhur", name: "Madhur", provider: "IndicF5", desc: "Natural warm Hindi & Hinglish male voice" },
    { id: "rachel", name: "Rachel", provider: "ElevenLabs", desc: "Calm, realistic everyday conversational voice" },
    { id: "adam", name: "Adam", provider: "ElevenLabs", desc: "Deep, articulate storytelling male voice" },
    { id: "neerja", name: "Neerja", provider: "Indic Neural", desc: "Expressive Indian accent English voice" }
  ];

  const LumiVoiceCall = {
    isOpen: false,
    state: "idle", // "idle" | "listening" | "thinking" | "speaking"
    isMuted: false,
    currentLang: "hi-IN",
    selectedVoice: localStorage.getItem("lumi_live_voice") || "nova",
    previewAudio: null,
    currentlyPlayingSampleId: null,
    restartTimer: null,
    sessionTurns: [],
    speechQueue: [],
    isPlayingSpeech: false,
    isGeneratingResponse: false,
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

      const activeVoice = this.selectedVoice || localStorage.getItem("lumi_live_voice") || "nova";

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
      const voice = LIVE_VOICES.find((v) => v.id === voiceId);
      showToast(`Voice set to: ${voice ? voice.name : voiceId}`);
      this.openVoiceMenu(); // re-render checkmark in-place
    },

    stopSamplePlayback() {
      if (this.previewAudio) {
        try {
          this.previewAudio.pause();
          this.previewAudio.currentTime = 0;
        } catch {}
        this.previewAudio = null;
      }
      if (window.AndroidAudio && typeof window.AndroidAudio.stop === "function") {
        try { window.AndroidAudio.stop(); } catch {}
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
        audio.onerror = () => {
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
      this.selectedVoice = localStorage.getItem("lumi_live_voice") || "nova";

      // Silence Android OS SpeechRecognizer chimes completely!
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch {}
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
      this.stopListening();
      this.interrupt();
      this.closeVoiceSheet();

      // Restore Android OS system sounds
      if (window.AndroidAudio && typeof window.AndroidAudio.restoreSystemSounds === "function") {
        try { window.AndroidAudio.restoreSystemSounds(); } catch {}
      }

      const modal = document.querySelector("#lumi-live-modal");
      if (modal) modal.classList.add("hidden");

      if (this.sessionTurns.length > 0) {
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

    startListening() {
      if (!this.isOpen || this.isMuted) return;
      if (this.state === "speaking" || this.isPlayingSpeech) return;

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        this.updateUI("listening", "Speech recognition not supported in this browser.");
        return;
      }

      this.stopListening();

      // Ensure Android OS system chimes are silenced
      if (window.AndroidAudio && typeof window.AndroidAudio.silenceSystemSounds === "function") {
        try { window.AndroidAudio.silenceSystemSounds(); } catch {}
      }

      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = this.currentLang;

        rec.onresult = (event) => {
          // If AI is currently speaking, disregard mic to prevent acoustic feedback loop
          if (this.state === "speaking" || this.isPlayingSpeech) return;

          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) final += transcript;
            else interim += transcript;
          }

          const currentText = (final || interim).trim();
          if (currentText) {
            this.updateAuroraState("listening");
            this.updateUI("listening", currentText);

            clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              this.handleUserSpeech(currentText);
            }, 1200);
          }
        };

        rec.onerror = (e) => {
          if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech) {
            clearTimeout(this.restartTimer);
            this.restartTimer = setTimeout(() => {
              if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech) {
                this.startListening();
              }
            }, 800);
          }
        };

        rec.onend = () => {
          if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech) {
            clearTimeout(this.restartTimer);
            this.restartTimer = setTimeout(() => {
              if (this.isOpen && !this.isMuted && this.state === "listening" && !this.isPlayingSpeech) {
                this.startListening();
              }
            }, 500);
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
        } catch {}
        this.recInstance = null;
      }
    },

    interrupt() {
      this.speechQueue = [];
      this.isPlayingSpeech = false;
      this.isGeneratingResponse = false;
      if (this.streamAbortCtrl) {
        this.streamAbortCtrl.abort();
        this.streamAbortCtrl = null;
      }
      if (this.activeAudioEl) {
        try { this.activeAudioEl.pause(); } catch {}
        this.activeAudioEl = null;
      }
      if (window.AndroidAudio && typeof window.AndroidAudio.stop === "function") {
        try { window.AndroidAudio.stop(); } catch {}
      }
      if (window.AndroidTTS && typeof window.AndroidTTS.stop === "function") {
        try { window.AndroidTTS.stop(); } catch {}
      }
      if (typeof window.stopSpeechSynthesis === "function") {
        window.stopSpeechSynthesis();
      }
      this.updateUI("listening", "Bolna shuru kijiye, mai sun rahi hu...");
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

      const messages = [
        {
          role: "system",
          content: "You are Lumi in a real-time phone call. Speak in warm, natural, human conversational tone (1-2 short sentences per turn). Answer directly as if talking on a phone call. Never use markdown symbols, asterisks (**), bullet points, numbered lists, or headers."
        }
      ];

      const conv = getActiveConversation();
      if (conv && conv.messages) {
        for (const m of conv.messages.slice(-4)) {
          if (m.role === "user" || m.role === "assistant") {
            messages.push({ role: m.role, content: m.content });
          }
        }
      }

      for (const t of this.sessionTurns.slice(-4)) {
        messages.push({ role: t.role, content: t.content });
      }

      this.streamAbortCtrl = new AbortController();
      let fullAssistantReply = "";
      let sentenceBuffer = "";

      try {
        const apiBase = (window.location.origin && window.location.origin.startsWith("http"))
          ? window.location.origin
          : "https://lumi-backend-v4-production.up.railway.app";

        const resp = await fetch(`${apiBase}/api/free/chat`, {
          method: "POST",
          signal: this.streamAbortCtrl.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b",
            messages: messages,
            stream: true,
            max_tokens: 300
          })
        });

        if (!resp.ok) throw new Error("HTTP " + resp.status);

        this.updateUI("speaking", "...");
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

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
            if (dataStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content || "";
              if (delta) {
                const cleanDelta = delta.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/<\/?think>/g, "");
                fullAssistantReply += cleanDelta;
                sentenceBuffer += cleanDelta;

                const cleanSub = fullAssistantReply.replace(/\*\*/g, "").trim();
                this.updateUI("speaking", cleanSub);

                const sentenceEndMatch = sentenceBuffer.match(/^([\s\S]+?[.?!।\n])\s*([\s\S]*)$/);
                if (sentenceEndMatch) {
                  const toSpeak = sentenceEndMatch[1].trim();
                  sentenceBuffer = sentenceEndMatch[2];
                  if (toSpeak) {
                    this.speakCallChunk(toSpeak);
                  }
                }
              }
            } catch {}
          }
        }

        if (sentenceBuffer.trim()) {
          this.speakCallChunk(sentenceBuffer.trim());
        }

        const finalClean = fullAssistantReply.replace(/\*\*/g, "").trim();
        this.sessionTurns.push({ role: "assistant", content: finalClean });
        this.isGeneratingResponse = false;

        // If audio finished playing while LLM was streaming last chunk, check if queue is now empty
        if (!this.isPlayingSpeech && this.speechQueue.length === 0) {
          setTimeout(() => {
            if (this.isOpen && !this.isPlayingSpeech && !this.isGeneratingResponse && this.speechQueue.length === 0) {
              this.updateUI("listening", "Bolna shuru kijiye, mai sun rahi hu...");
              this.startListening();
            }
          }, 400);
        }

      } catch (err) {
        this.isGeneratingResponse = false;
        if (err.name === "AbortError") return;
        this.updateUI("speaking", "Ek second...");
        setTimeout(() => {
          if (this.isOpen) {
            this.updateUI("listening", "Bolna shuru kijiye, mai sun rahi hu...");
            this.startListening();
          }
        }, 1200);
      }
    },

    speakCallChunk(sentence) {
      const clean = sentence.replace(/\*\*/g, "").replace(/[`#_*~]/g, "").trim();
      if (!clean) return;

      this.speechQueue.push(clean);
      if (!this.isPlayingSpeech) {
        this.playNextQueuedSpeech();
      }
    },

    async playNextQueuedSpeech() {
      if (!this.isOpen || this.speechQueue.length === 0) {
        this.isPlayingSpeech = false;
        // Only return to listening once LLM has completely finished generating AND speech queue is drained!
        if (this.isOpen && !this.isGeneratingResponse && this.state === "speaking") {
          setTimeout(() => {
            if (this.isOpen && !this.isGeneratingResponse && !this.isPlayingSpeech && this.speechQueue.length === 0) {
              this.updateUI("listening", "Bolna shuru kijiye, mai sun rahi hu...");
              this.startListening();
            }
          }, 400);
        }
        return;
      }

      this.isPlayingSpeech = true;
      // ALWAYS keep microphone OFF while AI speaks to prevent acoustic self-interruption
      this.stopListening();

      const text = this.speechQueue.shift();
      const hasHindi = /[\u0900-\u097F]/.test(text);
      const activeVoice = this.selectedVoice || localStorage.getItem("lumi_live_voice") || "nova";

      this.updateAuroraState("speaking");

      const endpoints = [
        "http://127.0.0.1:3456/api/tts",
        "http://10.188.22.242:3456/api/tts",
        "http://localhost:3456/api/tts"
      ];

      let audioBlob = null;
      for (const ep of endpoints) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2500);
          const r = await fetch(ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: text, voice: activeVoice }),
            signal: ctrl.signal
          });
          clearTimeout(timer);
          if (r.ok) {
            const b = await r.blob();
            if (b && b.size > 200) {
              audioBlob = b;
              break;
            }
          }
        } catch {}
      }

      if (!this.isOpen || this.state !== "speaking") return;

      if (audioBlob) {
        const audioSrc = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioSrc);
        this.activeAudioEl = audio;
        audio.onended = () => {
          URL.revokeObjectURL(audioSrc);
          this.activeAudioEl = null;
          this.playNextQueuedSpeech();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioSrc);
          this.activeAudioEl = null;
          this.fallbackSpeak(text, hasHindi);
        };
        audio.play().catch((err) => {
          console.warn("Audio play error, falling back to TTS:", err);
          URL.revokeObjectURL(audioSrc);
          this.activeAudioEl = null;
          this.fallbackSpeak(text, hasHindi);
        });
      } else {
        // Fallback: If network / server is unavailable, use Android native TTS or Web Speech API
        this.fallbackSpeak(text, hasHindi);
      }
    },

    fallbackSpeak(text, hasHindi) {
      if (!this.isOpen || this.state !== "speaking") return;
      const lang = hasHindi ? "hi-IN" : "en-US";

      if (window.AndroidTTS && typeof window.AndroidTTS.speak === "function") {
        const msgId = "live_tts_" + Date.now();
        window.__lumiOnTTSDone = (doneId) => {
          if (doneId === msgId) {
            this.playNextQueuedSpeech();
          }
        };
        window.AndroidTTS.speak(msgId, text, lang);
      } else if ("speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang;
        utt.onend = () => this.playNextQueuedSpeech();
        utt.onerror = () => this.playNextQueuedSpeech();
        window.speechSynthesis.speak(utt);
      } else {
        setTimeout(() => this.playNextQueuedSpeech(), 1000);
      }
    }
  };

  window.LumiVoiceCall = LumiVoiceCall;

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
    let targetEl = null;
    if (msgId) {
      targetEl = document.querySelector(`#msg-body-${msgId}`);
    }
    if (!targetEl) {
      const container = document.querySelector("#chat-messages-container");
      if (container) {
        targetEl = container.querySelector(".space-y-7 > div:last-child .markdown-body");
      }
    }
    if (targetEl) {
      targetEl.innerHTML = `${renderMarkdown(currentText)}<span class="streaming-cursor"></span>`;
    }
  }

  let scrollScheduled = false;
  function scrollToBottom(force = false) {
    if (scrollScheduled && !force) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      scrollScheduled = false;
      const container = document.querySelector("#chat-messages-container");
      if (!container) return;

      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // If user has intentionally scrolled up to read (more than 120px away from bottom), don't hijack their scroll!
      if (!force && distanceFromBottom > 120) {
        return;
      }

      container.scrollTop = container.scrollHeight;
    });
  }

  // --- Main Render Dispatcher ---
  function render() {
    const root = getApp();
    if (!root) return;

    const { path, query } = parseLocation();

    // Check if query param 'q' was provided (e.g., from landing or search)
    if (query.get("q") && !pendingQueryText) {
      pendingQueryText = query.get("q");
    }

    if (path === "/" || path === "") {
      root.innerHTML = renderLanding();
    } else if (path === "/auth") {
      root.innerHTML = renderAuthPage();
    } else if (path === "/providers") {
      root.innerHTML = renderProvidersPage();
    } else if (path.startsWith("/chat")) {
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
    attachEventListeners();
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
        const voiceBtn = document.querySelector("#voice-call-trigger-btn");
        const submitBtn = document.querySelector("#submit-prompt-btn");
        if (voiceBtn && submitBtn && !isStreaming) {
          if (hasText) {
            voiceBtn.classList.add("hidden");
            voiceBtn.classList.remove("inline-flex");
            submitBtn.classList.remove("hidden");
            submitBtn.classList.add("inline-flex");
          } else {
            submitBtn.classList.add("hidden");
            submitBtn.classList.remove("inline-flex");
            voiceBtn.classList.remove("hidden");
            voiceBtn.classList.add("inline-flex");
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

    // 2. Chat Form Submit
    const form = document.querySelector("#chat-composer-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = form.querySelector("textarea[name='message']");
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

        if (!e.target.closest(".model-dropdown-menu") && !e.target.closest(".model-picker-toggle-btn")) {
          document.querySelectorAll(".model-dropdown-menu").forEach((m) => m.classList.add("hidden"));
          document.querySelectorAll(".model-picker-toggle-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
        }
        if (!e.target.closest(".topbar-dropdown-menu") && !e.target.closest("#toggle-persona-btn") && !e.target.closest("#toggle-export-btn")) {
          const pMenu = document.querySelector("#persona-dropdown-menu");
          if (pMenu) pMenu.classList.add("hidden");
          const eMenu = document.querySelector("#export-dropdown-menu");
          if (eMenu) eMenu.classList.add("hidden");
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

    // 14. Auth Screen Handlers
    const googleAuthBtn = document.querySelector("#google-auth-btn");
    if (googleAuthBtn) {
      googleAuthBtn.addEventListener("click", () => {
        currentUser = { email: "alex.creator@gmail.com", name: "Alex" };
        saveJson(STORAGE.USER, currentUser);
        showToast("Signed in as " + currentUser.email);
        navigate("/chat");
      });
    }

    const lovableAuthBtn = document.querySelector("#lovable-auth-btn");
    if (lovableAuthBtn) {
      lovableAuthBtn.addEventListener("click", () => {
        currentUser = { email: "creator@lovable.app", name: "Lovable Creator" };
        saveJson(STORAGE.USER, currentUser);
        showToast("Signed in with Lovable account");
        navigate("/chat");
      });
    }

    const emailAuthForm = document.querySelector("#email-auth-form");
    if (emailAuthForm) {
      emailAuthForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.querySelector("#auth-email-input");
        const email = emailInput ? emailInput.value.trim() : "user@lumi.ai";
        currentUser = { email: email || "user@lumi.ai", name: email.split("@")[0] };
        saveJson(STORAGE.USER, currentUser);
        showToast("Welcome to Lumi, " + currentUser.name + "!");
        navigate("/chat");
      });
    }

    // 14. Sign Out
    const signOutBtn = document.querySelector("#sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        currentUser = { email: "guest@lumi.ai", name: "Guest" };
        saveJson(STORAGE.USER, currentUser);
        showToast("Signed out.");
        navigate("/auth");
      });
    }

    // 15. Settings & Theme Handlers
    const openSettingsBtn = document.querySelector("#open-settings-btn");
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener("click", () => {
        settingsModalOpen = true;
        render();
      });
    }

    const closeSettingsBtn = document.querySelector("#close-settings-modal-btn");
    if (closeSettingsBtn) {
      closeSettingsBtn.addEventListener("click", () => {
        settingsModalOpen = false;
        render();
      });
    }

    const settingsOverlay = document.querySelector("#settings-modal-overlay");
    if (settingsOverlay) {
      settingsOverlay.addEventListener("click", (e) => {
        if (e.target === settingsOverlay) {
          settingsModalOpen = false;
          render();
        }
      });
    }

    document.querySelectorAll("[data-set-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.getAttribute("data-set-theme");
        applyTheme(theme);
        render();
        showToast(`Theme changed to ${theme.toUpperCase()}`);
      });
    });

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

    const clearChatsBtn = document.querySelector("#settings-clear-chats-btn");
    if (clearChatsBtn) {
      clearChatsBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all chat history? This cannot be undone.")) {
          conversations = [];
          saveJson(STORAGE.CHATS, conversations);
          settingsModalOpen = false;
          showToast("Chat history cleared.");
          navigate("/chat");
        }
      });
    }

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

    // 17. Image Action Delegation (Download, Regenerate, Zoom)
    document.querySelectorAll("[data-action='download-image']").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const url = btn.getAttribute("data-url");
        const name = btn.getAttribute("data-name") || "image";
        downloadImageFile(url, name);
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

    document.querySelectorAll("[data-action='zoom-image']").forEach((img) => {
      img.addEventListener("click", (e) => {
        e.stopPropagation();
        const src = img.getAttribute("data-src") || img.src;
        if (src) {
          window.open(src, "_blank");
        }
      });
    });
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
    if (conversations.length === 0) {
      const demoId = "demo_welcome";
      conversations = [
        {
          id: demoId,
          title: "Productivity ke 5 tips",
          createdAt: new Date().toISOString(),
          model: { provider_id: null, model: "openai" },
          messages: [
            {
              id: "m1",
              role: "user",
              content: "Mujhe productivity ke 5 tips do",
              timestamp: Date.now() - 3600000,
            },
            {
              id: "m2",
              role: "assistant",
              content: `### ⚡ 5 Powerful Productivity Tips

1. **Eat That Frog First:** Apne din ka sabse mushkil aur zaroori kaam pehle 90 minutes mein khatam karo jab energy 100% hoti hai.
2. **The 50/10 Rule:** 50 minutes deep focus work karo, fir 10 minutes ka screen-free break lo.
3. **2-Minute Rule:** Agar koi kaam 2 minute se kam ka ho, toh baad ke liye mat taalo — turant kar dalo!
4. **Notification Blackout:** Kaam ke waqt WhatsApp aur Instagram notifications band rakho.
5. **Top 3 Priorities:** Sone se pehle agle din ke sirf 3 priority tasks decide karo.`,
              timestamp: Date.now() - 3550000,
            },
          ],
        },
      ];
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
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
