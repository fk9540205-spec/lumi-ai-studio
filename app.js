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
    { id: "qwen-2.5-coder-32b", label: "Qwen 2.5 Coder 32B (Free Coding)", group: "Free AI Engine" },
    { id: "llama-3.3-70b", label: "Llama 3.3 70B (Free Fast)", group: "Free AI Engine" },
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
    "Plan a 3-day trip to the Maldives",
    "Explain React server components simply",
    "Help me write a heartfelt birthday note",
    "Mujhe productivity ke 5 tips do",
  ];

  // --- SVG Icons ---
  const ICONS = {
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
  let providers = loadJson(STORAGE.PROVIDERS, []);
  let selectedModel = loadJson(STORAGE.MODEL, {
    provider_id: null,
    model: "qwen-2.5-coder-32b",
  });
  let currentUser = loadJson(STORAGE.USER, {
    email: "creator@lovable.app",
    name: "Lumi Creator",
  });

  let searchQuery = "";
  let sidebarOpen = false;
  let modelMenuOpen = false;
  let workspaceOpen = false;
  let activeWorkspaceTab = "active_code"; // 'active_code' | 'diff' | 'appjs' | 'terminal' | 'preview'
  let currentActiveCodeTask = null;
  let expandedWorkSteps = {}; // messageId -> boolean
  let activeModal = null; // 'add-provider' | 'edit-provider' | null
  let editingProvider = null;
  let editingChatId = null;

  let isStreaming = false;
  let streamAbortController = null;
  let pendingQueryText = ""; // query passed via URL search or suggestions

  // Super-Feature States: Audio, Voice, Runner & Active Project
  let soundEnabled = loadJson("lumi_sound_enabled", true);
  let isListening = false;
  let recognitionInstance = null;
  let currentlySpeakingId = null;
  let terminalHistory = [
    { type: "info", text: "🚀 Lumi Interactive Sandbox Terminal v2.0" },
    { type: "info", text: "Connected to Python 3.13 Subprocess Sandbox on :3456" },
  ];

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

  // --- Markdown Parser with Code Block Copying & Math Support ---
  function renderMarkdown(content) {
    if (!content) return "";

    let text = content;

    // 1. Math block: $$ ... $$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      return `<div class="math-block">${escapeHtml(math.trim())}</div>`;
    });

    // 2. Math inline: $ ... $
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      return `<span class="math-inline">${escapeHtml(math.trim())}</span>`;
    });

    // 3. Fenced Code Blocks with Language Header & Copy Button
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const id = "code-" + Math.random().toString(36).slice(2, 9);
      const displayLang = lang.trim() || "code";
      const escapedCode = escapeHtml(code.trim());
      const blockHtml = `
        <div class="code-block-container" data-code-id="${id}">
          <div class="code-block-header">
            <span class="code-block-lang">${displayLang}</span>
            <button type="button" class="code-copy-btn" data-copy-code="${escapeHtml(code.trim())}">
              ${ICONS.copy} <span>Copy</span>
            </button>
          </div>
          <pre><code>${escapedCode}</code></pre>
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

    // 5. Headings
    text = text.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    text = text.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    text = text.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // 6. Blockquotes
    text = text.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    // 7. Unordered Lists
    text = text.replace(/^[\*\-] (.*$)/gim, "<li>$1</li>");
    text = text.replace(/(<li>[\s\S]+?<\/li>)/g, "<ul>$1</ul>");
    text = text.replace(/<\/ul>\s*<ul>/g, "");

    // 8. Ordered Lists
    text = text.replace(/^\d+\. (.*$)/gim, "<oli>$1</oli>");
    text = text.replace(/(<oli>[\s\S]+?<\/oli>)/g, "<ol>$1</ol>");
    text = text.replace(/<oli>/g, "<li>").replace(/<\/oli>/g, "</li>");
    text = text.replace(/<\/ol>\s*<ol>/g, "");

    // 9. Paragraphs (lines separated by double newlines)
    const paragraphs = text.split(/\n\n+/);
    text = paragraphs
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return "";
        if (/^<(h[1-4]|div|ul|ol|blockquote|table)/.test(trimmed)) {
          return trimmed;
        }
        return `<p>${renderInlineFormatting(trimmed).replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");

    // 10. Restore Code Blocks
    text = text.replace(/__CODE_BLOCK_(\d+)__/g, (match, idx) => {
      return codeBlocks[Number(idx)] || "";
    });

    return text;
  }

  function renderInlineFormatting(str) {
    let s = str;
    // Bold
    s = s.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic
    s = s.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Inline code
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
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
        <div class="flex items-center gap-2.5 border-t border-sidebar-border px-4 py-3 bg-card/40">
          <span class="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold uppercase text-primary-foreground select-none">
            ${escapeHtml((currentUser.email || "Y")[0])}
          </span>
          <span class="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
            ${escapeHtml(currentUser.email || "Guest")}
          </span>
          <button
            type="button"
            class="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
            id="sign-out-btn"
          >
            ${ICONS.logOut}
          </button>
        </div>
      </aside>
    `;
  }

  // Helper to detect if user requested code or if assistant generated code
  function detectCodeTask(userPrompt, assistantContent) {
    const p = (userPrompt || "").toLowerCase();
    const c = assistantContent || "";

    const codeKeywords = [
      "code", "program", "function", "script", "build", "create app", "banao", "likho code",
      "python", "javascript", "html", "css", "react", "sql", "api", "backend", "frontend",
      "bug", "error", "fix", "refactor", "component", "class", "def ", "import ", "regex",
      "server", "algorithm", "database", "crud"
    ];
    const isCodePrompt = codeKeywords.some((k) => p.includes(k));
    const codeBlockMatch = c.match(/```([a-zA-Z0-9_\-\.\+]*)\n([\s\S]*?)```/);
    const hasCodeBlock = !!codeBlockMatch;

    if (!isCodePrompt && !hasCodeBlock) {
      return null;
    }

    let lang = codeBlockMatch ? (codeBlockMatch[1] || "text").toLowerCase() : "code";
    let codeSnippet = codeBlockMatch ? codeBlockMatch[2] : "";
    let lineCount = codeSnippet ? codeSnippet.split("\n").length : 0;

    let filename = "main";
    if (lang === "python" || lang === "py") filename = "script.py";
    else if (lang === "javascript" || lang === "js") filename = "app.js";
    else if (lang === "typescript" || lang === "ts") filename = "index.ts";
    else if (lang === "html") filename = "index.html";
    else if (lang === "css") filename = "styles.css";
    else if (lang === "json") filename = "data.json";
    else if (lang === "sql") filename = "schema.sql";
    else if (lang === "sh" || lang === "bash") filename = "run.sh";
    else filename = "solution.code";

    const fileMention = (p + " " + c).match(/([a-zA-Z0-9_\-]+\.(?:py|js|ts|html|css|json|sql|sh))/i);
    if (fileMention) {
      filename = fileMention[1];
    }

    return {
      isCodeTask: true,
      lang,
      filename,
      code: codeSnippet,
      lines: lineCount,
      taskTitle: `Drafted ${filename}`
    };
  }

  // 3. PROMPT COMPOSER & MODEL SELECTOR
  function renderModelPicker(placement = "composer") {
    const label = getActiveModelLabel();
    const isTopbar = placement === "topbar";
    const dropdownPosClass = isTopbar ? "placement-topbar" : "placement-composer";
    const isOpen = modelMenuOpen === placement;

    return `
      <div class="relative model-picker-wrapper" data-placement="${placement}">
        <button
          type="button"
          class="model-picker-toggle-btn inline-flex items-center gap-1.5 h-8 rounded-full border border-border bg-card/80 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer"
          data-toggle-model-picker="${placement}"
          aria-expanded="${isOpen}"
          aria-label="Select AI Model"
        >
          <span class="truncate max-w-[12rem]">${escapeHtml(label)}</span>
          ${ICONS.chevronDown}
        </button>

        ${
          isOpen
            ? `
          <div class="model-dropdown-menu ${dropdownPosClass}" id="model-dropdown-menu">
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
          </div>`
            : ""
        }
      </div>`;
  }

  function renderComposer(placeholder = "Ask Lumi anything…", isThread = false) {
    return `
      <div class="relative w-full rounded-3xl bg-card border border-border shadow-composer transition-shadow focus-within:ring-1 focus-within:ring-primary/20">
        <form id="chat-composer-form" class="w-full">
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
                id="toggle-sound-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors backdrop-blur shadow-xs cursor-pointer"
                title="${soundEnabled ? "Mute UI sounds" : "Enable UI sounds"}"
              >
                ${soundEnabled ? ICONS.volume : ICONS.volumeMute}
              </button>

              <button
                type="button"
                id="voice-mic-btn"
                class="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card/80 text-xs ${isListening ? "mic-listening-pulse" : "text-muted-foreground hover:text-foreground"} transition-all backdrop-blur shadow-xs cursor-pointer"
                title="${isListening ? "Listening... click to stop" : "Voice input (Hindi & English)"}"
              >
                ${ICONS.mic}
              </button>
            </div>

            <div class="flex items-center gap-1.5">
              ${
                isStreaming
                  ? `<button
                      type="button"
                      id="stop-generation-btn"
                      class="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 cursor-pointer"
                      title="Stop generation"
                    >
                      ${ICONS.square}
                    </button>`
                  : `<button
                      type="submit"
                      id="submit-prompt-btn"
                      class="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Send message"
                    >
                      ${ICONS.cornerDownLeft}
                    </button>`
              }
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

  // --- Antigravity IDE Components: Thinking Box & Workspace Diff Panel ---

  function renderAgentThinkingBox(codeTask, msgId, isCurrentlyStreaming) {
    if (!codeTask) return ""; // Pure conversational chat — NO fake build box!

    const isExpanded = expandedWorkSteps[msgId] !== false; // default open
    const lines = codeTask.lines || 1;
    const filename = codeTask.filename || "code.py";
    const lang = codeTask.lang || "code";

    return `
      <div class="agent-work-box animate-rise-in mb-3">
        <div class="agent-work-header cursor-pointer select-none" data-toggle-steps="${msgId}">
          <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            ${isCurrentlyStreaming ? `<span class="size-2 rounded-full bg-emerald-500 animate-ping"></span>` : ICONS.clock}
            <span>${isCurrentlyStreaming ? "Building solution..." : "Completed in 4s"}</span>
          </div>
          <div class="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
            <span>Analyzed files, generated ${escapeHtml(filename)}</span>
            <span class="transform transition-transform ${isExpanded ? 'rotate-180' : ''}">${ICONS.chevronDown}</span>
          </div>
        </div>

        ${isExpanded ? `
        <div class="agent-step-list">
          <div class="agent-step-item" data-open-workspace="active_code" title="View generated ${escapeHtml(filename)}">
            <span class="flex items-center gap-1.5 truncate">
              <span class="text-xs">🔍</span>
              <span>Analyzed prompt requirements & architecture</span>
            </span>
            <span class="text-[10px] text-muted-foreground font-mono">read</span>
          </div>

          <div class="agent-step-item" data-open-workspace="active_code" title="Inspect ${escapeHtml(filename)} in Workspace IDE">
            <span class="flex items-center gap-1.5 truncate">
              <span class="text-xs">⚡</span>
              <span>Created <code>${escapeHtml(filename)}</code></span>
            </span>
            <span class="badge-add">+${lines}</span>
          </div>

          <div class="agent-step-item" data-open-workspace="active_code" title="Open Workspace IDE">
            <span class="flex items-center gap-1.5 truncate">
              <span class="text-xs">✔</span>
              <span>Syntax validated (${escapeHtml(lang)})</span>
            </span>
            <span class="text-[10px] text-emerald-600 font-mono font-bold">READY</span>
          </div>
        </div>` : ''}
      </div>`;
  }

  function renderServerPyDiff() {
    const diffLines = [
      { type: "header", oldNum: "...", newNum: "...", text: "@@ -16,11 +3,24 @@ Lumi AI Studio Server" },
      { type: "del", oldNum: 16, newNum: "", text: '  POST /api/g4f/chat      — GPT4Free proxy (streaming SSE)' },
      { type: "del", oldNum: 17, newNum: "", text: '  GET  /api/g4f/models    — GPT4Free model list' },
      { type: "del", oldNum: 18, newNum: "", text: '  GET  /api/g4f/health    — GPT4Free health check' },
      { type: "del", oldNum: 19, newNum: "", text: '' },
      { type: "del", oldNum: 20, newNum: "", text: '  POST /api/proxy/chat    — Generic OpenAI-compatible proxy' },
      { type: "del", oldNum: 21, newNum: "", text: '  GET  /api/proxy/health  — Generic endpoint health check' },
      { type: "del", oldNum: 22, newNum: "", text: '' },
      { type: "del", oldNum: 23, newNum: "", text: '  GET  /api/status        — Overall server & provider status' },
      { type: "add", oldNum: "", newNum: 3, text: 'Lumi AI Studio — Unified Free & Reverse-Engineered AI Backend Server' },
      { type: "add", oldNum: "", newNum: 4, text: '' },
      { type: "add", oldNum: "", newNum: 5, text: 'Combines top open-source AI projects into one backend:' },
      { type: "add", oldNum: "", newNum: 6, text: '  1. Zero-Setup Free AI Hub (Pollinations & Reverse-Engineered OpenAI)' },
      { type: "add", oldNum: "", newNum: 7, text: '  2. GPT4Free (xtekky/gpt4free) — 70+ models without API keys' },
      { type: "add", oldNum: "", newNum: 8, text: '  3. Duck.ai API (enter-a-new-username3/duck-ai-api) — DuckDuckGo free AI' },
      { type: "add", oldNum: "", newNum: 9, text: '  4. Gemini Web to API (ntthanh2603/gemini-web-to-api & XD06/gemini-free-api)' },
      { type: "add", oldNum: "", newNum: 10, text: '  5. Awesome Reverse-Engineered Proxy Hub (alexgaoth/awesome-reverse-engineered)' },
      { type: "add", oldNum: "", newNum: 11, text: '' },
      { type: "add", oldNum: "", newNum: 12, text: 'Also serves the frontend web application directly on http://localhost:3456/!' },
      { type: "add", oldNum: "", newNum: 13, text: '"""' },
      { type: "add", oldNum: "", newNum: 14, text: '' },
      { type: "add", oldNum: "", newNum: 15, text: 'import glob' },
      { type: "add", oldNum: "", newNum: 16, text: 'import http.server' },
      { type: "add", oldNum: "", newNum: 17, text: 'import json' },
      { type: "add", oldNum: "", newNum: 18, text: 'import mimetypes' },
      { type: "add", oldNum: "", newNum: 19, text: 'import os' },
      { type: "add", oldNum: "", newNum: 20, text: 'import ssl' },
      { type: "add", oldNum: "", newNum: 21, text: 'import sys' },
      { type: "add", oldNum: "", newNum: 22, text: 'import threading' },
      { type: "add", oldNum: "", newNum: 23, text: 'import time' },
      { type: "add", oldNum: "", newNum: 24, text: 'import urllib.error' },
      { type: "add", oldNum: "", newNum: 25, text: 'import urllib.parse' },
      { type: "add", oldNum: "", newNum: 26, text: 'import urllib.request' },
      { type: "ctx", oldNum: 27, newNum: 27, text: 'FREE_HUB_URL = "https://text.pollinations.ai/openai/chat/completions"' },
      { type: "ctx", oldNum: 28, newNum: 28, text: 'PORT = int(os.environ.get("PORT", 3456))' },
    ];

    return `
      <div class="diff-container">
        ${diffLines
          .map((line) => {
            if (line.type === "header") {
              return `
                <div class="diff-line bg-zinc-900/90 text-zinc-500 font-semibold text-[11px] py-1 px-4 border-y border-zinc-800">
                  ${escapeHtml(line.text)}
                </div>`;
            }
            const isDel = line.type === "del";
            const isAdd = line.type === "add";
            const lineClass = isDel ? "diff-line-del" : isAdd ? "diff-line-add" : "";
            const prefix = isDel ? "- " : isAdd ? "+ " : "  ";

            return `
              <div class="diff-line ${lineClass}">
                <div class="diff-gutter">
                  <span>${line.oldNum || ""}</span>
                  <span>${line.newNum || ""}</span>
                </div>
                <div class="diff-content"><span>${prefix}</span>${escapeHtml(line.text)}</div>
              </div>`;
          })
          .join("")}
      </div>`;
  }

  function renderAppJsDiff() {
    const diffLines = [
      { type: "header", oldNum: "...", newNum: "...", text: "@@ -1571,15 +1571,45 @@ Built-in Real Free AI Streaming" },
      { type: "del", oldNum: 1571, newNum: "", text: '  // Built-in intelligent simulated streaming with smooth typewriter delay' },
      { type: "del", oldNum: 1572, newNum: "", text: '  const fullReply = generateBuiltInResponse(prompt, selectedModel.model);' },
      { type: "del", oldNum: 1573, newNum: "", text: '  const chunkSize = 4;' },
      { type: "add", oldNum: "", newNum: 1571, text: '  // Built-in Real Free AI Streaming via backend /api/free/chat' },
      { type: "add", oldNum: "", newNum: 1572, text: '  const backendOrigin = window.location.origin.includes(":3456") ? window.location.origin : "http://localhost:3456";' },
      { type: "add", oldNum: "", newNum: 1573, text: '  let streamedSuccessfully = false;' },
      { type: "add", oldNum: "", newNum: 1574, text: '  const resp = await fetch(`${backendOrigin}/api/free/chat`, {' },
      { type: "add", oldNum: "", newNum: 1575, text: '    method: "POST",' },
      { type: "add", oldNum: "", newNum: 1576, text: '    signal: streamAbortController.signal,' },
      { type: "add", oldNum: "", newNum: 1577, text: '    headers: { "Content-Type": "application/json" },' },
      { type: "add", oldNum: "", newNum: 1578, text: '    body: JSON.stringify({' },
      { type: "add", oldNum: "", newNum: 1579, text: '      model: selectedModel.model || "openai",' },
      { type: "add", oldNum: "", newNum: 1580, text: '      messages: chatHistory,' },
      { type: "add", oldNum: "", newNum: 1581, text: '      stream: true,' },
      { type: "add", oldNum: "", newNum: 1582, text: '    }),' },
      { type: "add", oldNum: "", newNum: 1583, text: '  });' },
      { type: "ctx", oldNum: 1584, newNum: 1584, text: '  // Unified Provider Presets: GPT4Free, Duck.ai, Gemini Web' },
    ];

    return `
      <div class="diff-container">
        ${diffLines
          .map((line) => {
            if (line.type === "header") {
              return `
                <div class="diff-line bg-zinc-900/90 text-zinc-500 font-semibold text-[11px] py-1 px-4 border-y border-zinc-800">
                  ${escapeHtml(line.text)}
                </div>`;
            }
            const isDel = line.type === "del";
            const isAdd = line.type === "add";
            const lineClass = isDel ? "diff-line-del" : isAdd ? "diff-line-add" : "";
            const prefix = isDel ? "- " : isAdd ? "+ " : "  ";

            return `
              <div class="diff-line ${lineClass}">
                <div class="diff-gutter">
                  <span>${line.oldNum || ""}</span>
                  <span>${line.newNum || ""}</span>
                </div>
                <div class="diff-content"><span>${prefix}</span>${escapeHtml(line.text)}</div>
              </div>`;
          })
          .join("")}
      </div>`;
  }

  function getRunnableHtml(codeTask) {
    if (!codeTask || !codeTask.code) {
      return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:90vh;color:#888;background:#0d1117;text-align:center;"><div><h3 style="color:#eee;margin-bottom:8px;">🚀 Live Preview Ready</h3><p style="color:#6e7681;font-size:13px;">Ask Lumi to build a game, calculator, or landing page to run it interactively here!</p></div></body></html>`;
    }
    const c = codeTask.code;
    if (codeTask.lang === "html" || codeTask.filename.endsWith(".html") || c.includes("<!DOCTYPE") || c.includes("<html") || c.includes("<div") || c.includes("<canvas")) {
      return c;
    }
    if (codeTask.lang === "javascript" || codeTask.lang === "js") {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0d1117;color:#c9d1d9;font-family:monospace;padding:24px;margin:0;}h3{color:#58a6ff;margin-top:0;font-size:14px;}pre{background:#161b22;padding:16px;border-radius:8px;border:1px solid #30363d;white-space:pre-wrap;font-size:13px;line-height:1.5;}</style></head><body><h3>⚡ JavaScript Output Console:</h3><pre id="log"></pre><script>
        const logEl = document.getElementById('log');
        const _log = console.log;
        console.log = (...args) => {
          _log(...args);
          logEl.textContent += args.map(a => typeof a === 'object' ? JSON.stringify(a,null,2) : a).join(' ') + '\\n';
        };
        try {
          ${c}
        } catch(e) {
          logEl.textContent += '❌ Error: ' + e.message;
        }
      <\/script></body></html>`;
    }
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0d1117;color:#58a6ff;font-family:monospace;padding:24px;line-height:1.6;}</style></head><body><div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;"><span style="color:#8b949e;">// File: ${escapeHtml(codeTask.filename)}</span><br><br><pre style="color:#e6edf3;white-space:pre-wrap;margin:0;">${escapeHtml(c)}</pre></div></body></html>`;
  }

  function renderTerminalView() {
    return `
      <div class="terminal-container">
        <div class="terminal-line"><span class="terminal-prompt">jayu@ai:~/Videos/ai$</span> ./run_backend.sh</div>
        <div class="terminal-line terminal-info">========================================================</div>
        <div class="terminal-line terminal-info">  🚀 Lumi AI Studio — Sandbox Terminal & Code Runner</div>
        <div class="terminal-line terminal-info">========================================================</div>
        <div class="terminal-line terminal-success">✔ Python sandbox active with subprocess runner (:3456)</div>
        <div class="terminal-line terminal-success">✔ Web preview sandbox active (HTML5, Canvas, JS)</div>
        <div class="terminal-line terminal-info">--------------------------------------------------------</div>
        ${terminalHistory.map((item) => `
          <div class="terminal-line ${item.type === 'error' ? 'text-rose-400' : item.type === 'stdout' ? 'text-zinc-100 font-mono' : 'terminal-success'}">
            ${item.cmd ? `<div class="text-sky-400 font-bold mb-0.5"><span class="text-zinc-500">$</span> ${escapeHtml(item.cmd)}</div>` : ''}
            ${item.stdout ? `<div class="whitespace-pre-wrap text-emerald-300 font-mono pl-3 border-l-2 border-emerald-500/40 my-1">${escapeHtml(item.stdout)}</div>` : ''}
            ${item.stderr ? `<div class="whitespace-pre-wrap text-rose-400 font-mono pl-3 border-l-2 border-rose-500/40 my-1">${escapeHtml(item.stderr)}</div>` : ''}
            ${item.text ? `<div>${escapeHtml(item.text)}</div>` : ''}
          </div>
        `).join("")}
        <div class="terminal-line mt-4"><span class="terminal-prompt">jayu@ai:~/Videos/ai$</span> <span class="inline-block w-2 h-4 bg-emerald-400 animate-pulse align-middle"></span></div>
      </div>`;
  }

  function renderPreviewView() {
    const hasActiveApp = !!(currentActiveCodeTask && currentActiveCodeTask.code);
    const runnableHtml = getRunnableHtml(currentActiveCodeTask);

    return `
      <div class="preview-container">
        <div class="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground backdrop-blur">
          <div class="flex items-center gap-2">
            <span class="inline-block size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-mono text-[11px] font-semibold text-foreground">
              ${hasActiveApp ? escapeHtml(currentActiveCodeTask.filename) + " (Live App)" : "http://localhost:3456/#/chat"}
            </span>
            ${hasActiveApp ? `<span class="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">RUNNING</span>` : ""}
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium cursor-pointer"
              id="reload-preview-btn"
            >
              ${ICONS.refreshCw} <span>Reload</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              id="fullscreen-preview-btn"
              title="Open in new window"
            >
              ${ICONS.split} <span>New Window</span>
            </button>
          </div>
        </div>
        <iframe
          srcdoc="${hasActiveApp ? escapeHtml(runnableHtml) : ""}"
          src="${!hasActiveApp ? "http://localhost:3456/" : ""}"
          id="live-preview-iframe"
          sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
          class="preview-iframe"
        ></iframe>
      </div>`;
  }

  function renderActiveCodeView() {
    if (!currentActiveCodeTask || !currentActiveCodeTask.code) {
      return `
        <div class="diff-container p-6 text-zinc-400 font-mono text-xs flex flex-col items-center justify-center h-full text-center">
          <span class="text-sky-400 text-lg mb-2">⚡</span>
          <span class="font-semibold text-zinc-300">No active code generated yet</span>
          <span class="text-zinc-500 mt-1 max-w-sm">Ask Lumi to write or build code (Python, JS, HTML, API) to view the live editable file right here in Workspace IDE.</span>
        </div>`;
    }
    const lines = currentActiveCodeTask.code.split("\n");
    return `
      <div class="diff-container">
        <div class="diff-line bg-zinc-900/90 text-zinc-400 font-semibold text-[11px] py-2 px-4 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
          <div class="flex items-center gap-2">
            <span class="text-sky-400 font-bold">⚡</span>
            <span class="text-zinc-100 font-mono font-semibold">${escapeHtml(currentActiveCodeTask.filename)}</span>
            <span class="text-zinc-500 font-mono text-[10px]">(${lines.length} lines)</span>
          </div>
          <span class="text-[10px] uppercase font-mono tracking-wider text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800 font-bold">
            ${escapeHtml(currentActiveCodeTask.lang)}
          </span>
        </div>
        ${lines.map((l, idx) => `
          <div class="diff-line hover:bg-zinc-900/60 transition-colors">
            <div class="diff-gutter">
              <span></span>
              <span>${idx + 1}</span>
            </div>
            <div class="diff-content text-zinc-200 font-mono text-[12px]">${escapeHtml(l) || "&nbsp;"}</div>
          </div>
        `).join("")}
      </div>`;
  }

  function renderIdeWorkspacePanel() {
    const hasActiveCode = !!(currentActiveCodeTask && currentActiveCodeTask.code);

    return `
      <aside class="ide-workspace-panel" id="ide-workspace-panel">
        <!-- Top Tab Bar -->
        <div class="ide-top-tabbar">
          <div class="ide-tabs">
            ${
              hasActiveCode
                ? `
            <button
              type="button"
              class="ide-tab ${activeWorkspaceTab === "active_code" ? "is-active" : ""}"
              data-workspace-tab="active_code"
            >
              <span class="text-sky-400">⚡</span>
              <span>${escapeHtml(currentActiveCodeTask.filename)}</span>
              <span class="badge-add">+${currentActiveCodeTask.lines || 1}</span>
            </button>`
                : ""
            }

            <button
              type="button"
              class="ide-tab ${activeWorkspaceTab === "diff" ? "is-active" : ""}"
              data-workspace-tab="diff"
            >
              <span class="text-amber-400">📄</span>
              <span>Diff: server.py</span>
              <span class="badge-add">+145</span>
              <span class="badge-del">-12</span>
            </button>

            <button
              type="button"
              class="ide-tab ${activeWorkspaceTab === "appjs" ? "is-active" : ""}"
              data-workspace-tab="appjs"
            >
              <span class="text-yellow-400">📄</span>
              <span>Diff: app.js</span>
              <span class="badge-add">+96</span>
              <span class="badge-del">-30</span>
            </button>

            <button
              type="button"
              class="ide-tab ${activeWorkspaceTab === "terminal" ? "is-active" : ""}"
              data-workspace-tab="terminal"
            >
              ${ICONS.terminal}
              <span>Terminal (:3456)</span>
            </button>

            <button
              type="button"
              class="ide-tab ${activeWorkspaceTab === "preview" ? "is-active" : ""}"
              data-workspace-tab="preview"
            >
              ${ICONS.server}
              <span>Live Preview</span>
            </button>
          </div>

          <div class="ide-actions">
            ${
              hasActiveCode
                ? `
            <button
              type="button"
              class="ide-btn text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer"
              id="workspace-run-code-btn"
              title="Run code in sandbox terminal / preview"
            >
              ${ICONS.play} <span class="text-[11px] ml-1">Run</span>
            </button>
            <button
              type="button"
              class="ide-btn text-sky-500 hover:text-sky-400 font-semibold cursor-pointer"
              id="download-project-zip-btn"
              title="Download Full Project as .ZIP"
            >
              ${ICONS.download} <span class="text-[11px] ml-1">ZIP</span>
            </button>`
                : ""
            }
            <button
              type="button"
              class="ide-btn cursor-pointer"
              data-action="copy-workspace-code"
              title="Copy code"
            >
              ${ICONS.copy}
            </button>
            <button
              type="button"
              class="ide-btn cursor-pointer"
              id="close-workspace-btn"
              title="Close panel"
            >
              ${ICONS.close}
            </button>
          </div>
        </div>

        <!-- Main Body per Active Tab -->
        ${
          activeWorkspaceTab === "active_code"
            ? renderActiveCodeView()
            : activeWorkspaceTab === "diff"
            ? renderServerPyDiff()
            : activeWorkspaceTab === "appjs"
            ? renderAppJsDiff()
            : activeWorkspaceTab === "terminal"
            ? renderTerminalView()
            : renderPreviewView()
        }
      </aside>`;
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
                    <div class="animate-rise-in flex justify-end">
                      <div class="max-w-[85%] rounded-3xl bg-primary px-4 py-2.5 text-primary-foreground text-[15px] whitespace-pre-wrap leading-relaxed shadow-xs">
                        ${escapeHtml(msg.content)}
                      </div>
                    </div>`;
                }

                // Assistant Message
                const rawText = msg.content || "";
                const isCurrentlyStreaming =
                  isStreaming && index === messages.length - 1;

                // Detect if this message was a code task based on prompt and response
                const prevUserMsg = index > 0 && messages[index - 1].role === "user" ? messages[index - 1].content : "";
                const codeTask = detectCodeTask(prevUserMsg, rawText);

                return `
                  <div class="animate-rise-in flex gap-3.5 items-start">
                    <img src="${LUMI_LOGO}" alt="Lumi" class="mt-0.5 size-6 shrink-0 object-contain select-none" />
                    
                    <div class="min-w-0 flex-1">
                      <!-- Antigravity Thinking & Tool Execution Accordion (Only for real code tasks) -->
                      ${renderAgentThinkingBox(codeTask, msg.id, isCurrentlyStreaming)}

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

                      <div class="markdown-body text-[15px] leading-relaxed text-foreground">
                        ${renderMarkdown(rawText)}
                        ${isCurrentlyStreaming ? `<span class="streaming-cursor"></span>` : ""}
                      </div>

                      <!-- AI Image Generation Result Card -->
                      ${
                        msg.imageUrl
                          ? `
                        <div class="ai-image-card">
                          <img src="${escapeHtml(msg.imageUrl)}" alt="${escapeHtml(msg.imagePrompt || "Generated Image")}" loading="lazy" />
                          <div class="ai-image-overlay">
                            <span class="text-xs text-white/90 truncate max-w-[260px] font-medium drop-shadow">
                              ${escapeHtml(msg.imagePrompt || "AI Generated Image")}
                            </span>
                            <div class="flex items-center gap-2">
                              <a
                                href="${escapeHtml(msg.imageUrl)}"
                                download="lumi-ai-image.jpg"
                                target="_blank"
                                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs backdrop-blur font-medium transition-colors"
                              >
                                ${ICONS.download} <span>Download</span>
                              </a>
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
                            codeTask
                              ? `
                          <button
                            type="button"
                            class="run-code-action-btn"
                            data-action="run-code"
                            title="Execute in Sandbox Terminal / Preview"
                          >
                            ${ICONS.play} <span>Run Code</span>
                          </button>

                          <button
                            type="button"
                            class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors font-medium border border-sky-200 dark:border-sky-800/50 cursor-pointer"
                            data-open-workspace="active_code"
                            title="Inspect generated code in Workspace IDE"
                          >
                            ${ICONS.split} <span>View in Workspace IDE</span>
                          </button>`
                              : ""
                          }
                          
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
        ${
          sidebarOpen
            ? `<div class="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-xs md:hidden" id="sidebar-backdrop"></div>`
            : ""
        }

        <!-- Workspace Main View -->
        <main class="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <!-- Top Bar -->
          <div class="flex items-center justify-between border-b border-border/50 px-4 py-2 bg-card/50 backdrop-blur z-10">
            <div class="flex items-center gap-2">
              <button
                type="button"
                id="sidebar-toggle-btn"
                class="inline-flex size-8 items-center justify-center rounded-lg hover:bg-accent transition-colors md:hidden"
                aria-label="Open chats"
              >
                ${ICONS.panelLeft}
              </button>
              <div class="text-sm font-medium truncate max-w-[160px] sm:max-w-xs">
                ${thread ? escapeHtml(thread.title) : "Lumi AI Studio"}
              </div>
            </div>

            <div class="flex items-center gap-2">
              ${renderModelPicker("topbar")}

              <button
                type="button"
                id="toggle-workspace-btn"
                class="inline-flex items-center gap-1.5 h-8 rounded-full border px-3 text-xs font-medium transition-all ${
                  workspaceOpen
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
                    : "border-border bg-card/80 text-muted-foreground hover:text-foreground"
                }"
                title="Toggle Antigravity IDE Workspace / Diff View"
              >
                ${ICONS.code}
                <span class="hidden sm:inline">Workspace IDE</span>
                <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            </div>
          </div>

          <!-- Dynamic Stage (Split Workspace Layout) -->
          <div class="flex min-h-0 flex-1 overflow-hidden">
            <!-- Left / Center: Chat Area -->
            <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
              ${thread ? renderThreadChat(thread) : renderEmptyChat()}
            </div>

            <!-- Right: Antigravity IDE Split Panel -->
            ${workspaceOpen ? renderIdeWorkspacePanel() : ""}
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

  // --- Intelligent Offline Assistant Responses ---
  function generateBuiltInResponse(promptText, modelId) {
    const text = promptText.trim().toLowerCase();

    // 1. Maldives Trip
    if (text.includes("maldives") || (text.includes("trip") && text.includes("3-day"))) {
      return `### 🌴 3-Day Luxury Island Escape to the Maldives

Here is a curated itinerary balancing azure lagoons, reef exploration, and sunset relaxation.

---

#### **Day 1: Arrival & Overwater Bliss**
- **Morning:** Arrive at Velana International Airport (Malé). Board your scenic **25-minute seaplane flight** over the North Malé Atoll with breathtaking aerial views of coral rings.
- **Afternoon:** Check into your private **Overwater Bungalow**. Unpack and step directly down your villa ladder into warm, crystal-clear 28°C turquoise water.
- **Evening:** Sunset cocktails on the ocean deck followed by an authentic seafood grill at a beachfront restaurant under the stars.

---

#### **Day 2: Manta Ray Safari & Sandbank Picnic**
- **Morning (08:30):** Private dhoni boat excursion to a protected reef channel. Snorkel alongside majestic **Manta Rays** and gentle sea turtles.
- **Lunch:** Castaway picnic on an uninhabited sandbank — fresh chilled fruit, grilled reef fish, and sparkling coconut water.
- **Afternoon:** Indulge in an overwater glass-bottom spa massage listening to ocean swells.
- **Night:** Bioluminescent night walk along the shoreline where glowing phytoplankton lights up the sand.

---

#### **Day 3: Marine Conservation & Sunset Cruise**
- **Morning:** Coral adoption dive with the resident marine biologist to plant your own coral fragment on the resort reef.
- **Afternoon:** Stand-Up Paddleboarding (SUP) across the tranquil lagoon or kayaking with clear glass kayaks.
- **Late Afternoon (17:30):** Traditional sunset dolphin cruise with champagne while pods of spinner dolphins leap alongside the boat bow.
- **Night:** Departure transfer to Malé for your flight home.

> **Pro Tip:** Pack reef-safe mineral sunscreen and an underwater action camera with red filter lens!`;
    }

    // 2. React Server Components
    if (text.includes("react server components") || text.includes("rsc")) {
      return `### ⚛️ React Server Components (RSC) Simply Explained

**React Server Components (RSC)** let React components execute exclusively on the **server**, sending zero JavaScript bundle weight to the browser.

---

#### 1. The Core Problem RSC Solves
Traditionally, in client-side React (SPA):
1. Browser downloads a huge \`bundle.js\` (libraries, components, markdown parsers).
2. Browser renders the HTML.
3. Component makes API calls \`fetch('/api/data')\`, causing waterfall delays.

With **RSC**, the component runs on your server, queries your database directly, and streams lightweight **pre-rendered UI** to the browser.

---

#### 2. Server vs Client Components Comparison

| Feature | Server Component (Default) | Client Component (\`'use client'\`) |
| :--- | :--- | :--- |
| **Executes on** | Server Only | Server (SSR) + Browser Hydration |
| **Bundle Impact** | **0 KB** JS sent to client | Included in client JS bundle |
| **Database Access** | Direct \`await db.query()\` | Requires \`fetch()\` API endpoint |
| **Interactivity** | No (\`onClick\`, \`useState\`) | Yes (hooks, DOM event listeners) |

---

#### 3. Code Example

\`\`\`tsx
// app/users/page.tsx (Server Component - runs on server)
import { db } from '@/lib/db';
import LikeButton from './like-button'; // Client component

export default async function UsersPage() {
  // Direct DB query with NO client API route needed!
  const users = await db.user.findMany();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Community Members</h1>
      <ul>
        {users.map(u => (
          <li key={u.id} className="flex justify-between py-2 border-b">
            <span>{u.name} ({u.role})</span>
            {/* Interactive widget with use client */}
            <LikeButton userId={u.id} />
          </li>
        ))}
      </ul>
    </main>
  );
}
\`\`\`

\`\`\`tsx
// app/users/like-button.tsx (Client Component)
'use client';

import { useState } from 'react';

export default function LikeButton({ userId }: { userId: string }) {
  const [likes, setLikes] = useState(0);

  return (
    <button 
      onClick={() => setLikes(l => l + 1)} 
      className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-semibold"
    >
      ❤️ {likes}
    </button>
  );
}
\`\`\`

> **Mental Model:** Think of Server Components as **fast skeletons & data engines**, and Client Components as **interactive buttons, inputs & modals**.`;
    }

    // 3. Birthday Note
    if (text.includes("birthday note") || text.includes("birthday")) {
      return `### 🎂 Heartfelt Birthday Notes

Here are four unique versions you can personalize:

---

#### Option 1: Warm, Meaningful & Deep
> *"Happy Birthday, [Name]! Another year older, wiser, and even more wonderful. Looking back on all the memories we've shared, I am so grateful to have you in my corner. Thank you for your kindness, your steady laugh, and the way you always light up any room you walk into. May this year bring you all the quiet peace, grand adventures, and dreams you've been working so hard toward. Cheers to you!"*

---

#### Option 2: Short, Sweet & Poetic
> *"Wishing the happiest of birthdays to someone who makes life so much brighter simply by being in it. May your year ahead be filled with serendipity, deep laughter, and endless good coffee. Happy Birthday, [Name]!"*

---

#### Option 3: Fun & Energetic
> *"Happy Birthday, superstar! 🥳 Another year of being unapologetically you and crushing everything you set your mind to. Let’s celebrate big, eat all the cake, and make this your best trip around the sun yet!"*

---

#### Option 4: Hinglish Warmth
> *"Janamdin bohot bohot mubarak ho, [Name]! 🎉 Tum jaise dost kismat se milte hain. Hamesha aise hi khush raho, hasti raho aur life mein aage badhte raho. Aaj ka din tumhara hai — celebrate hard!"*`;
    }

    // 4. Productivity Tips in Hinglish
    if (text.includes("productivity") || text.includes("tips") || text.includes("kaam")) {
      return `### ⚡ Supercharge Your Day: 5 Powerful Productivity Tips

Yeh 5 practical rules tumhari daily efficiency aur focus ko 3x kar denge:

---

#### 1. 🐸 Eat That Frog First (Sabse Mushkil Kaam Pehle)
- **Problem:** Log subah chote-mote emails aur social media mein time waste karte hain aur hard tasks ko postpone karte rehte hain.
- **Fix:** Apne din ka **#1 most critical & challenging task** pehle 90 minutes mein finish karo jab tumhara will-power aur energy 100% hoti hai. Baaki din automatically aasaan lagne lagega.

---

#### 2. ⏳ The 50/10 Time-Boxing Rule (Deep Focus Sprints)
- Continuous 4-5 ghante kaam karne se burnout hota hai.
- **Rule:** 50 minutes **strict deep work** (no notifications, phone in another room), aur uske baad **10 minutes screen-free break** (pani piyo, stretch karo, walk karo).

---

#### 3. ⏱️ 2-Minute Rule
- Agar koi task **2 minute se kam samay** leta hai (e.g., email reply, file organize, quick reminder set karna), toh usse baad ke liye mat taalo — **do it right away!** Yeh mental clutter khatam karta hai.

---

#### 4. 🔕 Notification Blackout & Batching
- Multitasking is a myth. Har WhatsApp ya Instagram ding tumhara focus tod deti hai.
- Work hours ke dauran **Do Not Disturb (DND)** on rakho. Messages aur emails din mein sirf 2 baar check karo: ek baar dopahar 1 PM aur ek baar shaam 5 PM.

---

#### 5. 📝 Night-Before Prep (Top 3 Priorities)
- Sone se 5 minutes pehle ek index card ya notebook par agle din ke **sirf 3 non-negotiable tasks** likho.
- Subah uthte hi decision fatigue nahi hoga aur tum instantly action mode mein hoge!

> **Quote:** *"Focus is not about saying yes to things, it's about saying NO to the 100 other good ideas."*`;
    }

    // Default intelligent conversational reply
    return `### ✨ Lumi AI Assistant

Thank you for your message: **"${escapeHtml(promptText)}"**

Here are some thoughtful thoughts and next steps:

1. **Clarity & Core Principles:** Breaking down complex challenges into bite-sized, actionable milestones is always the most effective path forward.
2. **Key Consideration:** Keep ergonomics, user delight, and reliability at the foundation of what you are building.
3. **Execution Plan:**
   - Define the primary objective.
   - Iterate rapidly in small feedback loops.
   - Polish micro-animations and typography for maximum sensory impact.

\`\`\`javascript
// Example: Creating smooth micro-interactions
const animateIn = (element) => {
  element.animate([
    { opacity: 0, transform: 'translateY(12px) scale(0.98)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ], {
    duration: 350,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    fill: 'forwards'
  });
};
\`\`\`

Let me know if you would like me to expand on any specific aspect or dive deeper into code, writing, or analysis!`;
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
          max_tokens: 2048,
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
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

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
      }
      return;
    }

    // Default: OpenAI-compatible (works with Free AI Hub, GPT4Free, Duck.ai, Gemini Web, Ollama, Groq, etc.)
    const apiBase =
      window.location.origin && window.location.origin.startsWith("http")
        ? ""
        : "https://lumi-backend-v2-production.up.railway.app";

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
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          if (!dataStr || dataStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(dataStr);
            const delta =
              parsed.choices?.[0]?.delta?.content ||
              parsed.choices?.[0]?.delta?.reasoning ||
              parsed.choices?.[0]?.delta?.text ||
              parsed.message ||
              "";
            if (delta) onChunk(delta);
          } catch {}
        }
      }
    }
  }

  // --- Send Message & Live Streaming Execution ---
  async function sendMessage(text) {
    const prompt = text.trim();
    if (!prompt || isStreaming) return;

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

    // Add User Message
    thread.messages.push({
      id: "msg_" + Date.now().toString(36) + "_user",
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    });

    // Add Empty Assistant Message placeholder for streaming
    const assistantMsgId = "msg_" + Date.now().toString(36) + "_assistant";
    thread.messages.push({
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    });

    saveJson(STORAGE.CHATS, conversations);
    render();
    scrollToBottom();
    AudioEffects.play("send");

    // 1. FREE IMAGE GENERATION (/image or image prompt)
    const isImageCommand = /^\/(?:image|img)\s+/i.test(prompt) || prompt.toLowerCase().startsWith("generate image") || prompt.toLowerCase().startsWith("image of ");
    if (isImageCommand) {
      const imagePrompt = prompt.replace(/^\/(?:image|img)\s+/i, "").replace(/^(?:generate image of|generate image|image of)\s*/i, "").trim();
      assistantMsg.imagePrompt = imagePrompt;
      const seed = Math.floor(Math.random() * 999999);
      assistantMsg.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;
      assistantMsg.content = `✨ **Flux AI Image Generated** for: *"**${escapeHtml(imagePrompt)}**"*`;
      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("success");
      render();
      scrollToBottom();
      return;
    }

    // 2. LIVE WEB SEARCH (/search <query>)
    let webContext = "";
    const isSearchCommand = /^\/search\s+/i.test(prompt);
    if (isSearchCommand) {
      const searchQuery = prompt.replace(/^\/search\s+/i, "").trim();
      try {
        const searchResp = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const searchData = await searchResp.json();
        if (searchData.results && searchData.results.length > 0) {
          assistantMsg.searchResults = searchData.results;
          webContext = "\n\nLive Web Knowledge Sources:\n" + searchData.results.map(r => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n");
        }
      } catch {}
    }

    // Start Streaming
    isStreaming = true;
    streamAbortController = new AbortController();

    const assistantMsg = thread.messages.find((m) => m.id === assistantMsgId);

    const onChunk = (chunk) => {
      assistantMsg.content += chunk;
      updateStreamingMessageUI(threadId, assistantMsg.content);

      // Dynamically detect code blocks as they stream in
      const detectedTask = detectCodeTask(prompt, assistantMsg.content);
      if (detectedTask) {
        currentActiveCodeTask = detectedTask;
      }
      scrollToBottom();
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
            : "https://lumi-backend-v2-production.up.railway.app";

        let streamedSuccessfully = false;
        try {
          const chatHistory = thread.messages
            .filter((m) => m.id !== assistantMsgId && m.content)
            .map((m) => ({ role: m.role, content: m.content }));

          if (webContext && chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].content += webContext;
          }

          const resp = await fetch(`${apiBase}/api/free/chat`, {
            method: "POST",
            signal: streamAbortController.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: selectedModel.model || "qwen-2.5-coder-32b",
              messages: chatHistory,
              stream: true,
            }),
          });

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
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const dataStr = line.slice(6).trim();
                  if (!dataStr || dataStr === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    const delta =
                      parsed.choices?.[0]?.delta?.content ||
                      parsed.choices?.[0]?.delta?.reasoning ||
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
      isStreaming = false;
      streamAbortController = null;

      // When streaming completes, if code was generated, auto-open workspace to active file
      const finalCodeTask = detectCodeTask(prompt, assistantMsg.content);
      if (finalCodeTask) {
        currentActiveCodeTask = finalCodeTask;
        activeWorkspaceTab = "active_code";
        workspaceOpen = true;
      }

      saveJson(STORAGE.CHATS, conversations);
      AudioEffects.play("success");
      render();
      scrollToBottom();
    }
  }

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
      render();
      return;
    }
    try {
      recognitionInstance = new SpeechRec();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "hi-IN";
      
      recognitionInstance.onstart = () => {
        isListening = true;
        AudioEffects.play("click");
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
        render();
      };
      recognitionInstance.onend = () => {
        isListening = false;
        render();
      };
      recognitionInstance.start();
    } catch (e) {
      isListening = false;
      render();
    }
  }

  function toggleSpeechSynthesis(msgId, text) {
    if (!("speechSynthesis" in window)) {
      showToast("Text-to-speech not supported in this browser.");
      return;
    }
    if (currentlySpeakingId === msgId) {
      window.speechSynthesis.cancel();
      currentlySpeakingId = null;
      render();
      return;
    }
    window.speechSynthesis.cancel();
    currentlySpeakingId = msgId;
    render();

    const cleanText = text.replace(/```[\s\S]*?```/g, "Code block omitted.").replace(/[#*`_]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      currentlySpeakingId = null;
      render();
    };
    utterance.onerror = () => {
      currentlySpeakingId = null;
      render();
    };
    window.speechSynthesis.speak(utterance);
  }

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

  function updateStreamingMessageUI(threadId, currentText) {
    const container = document.querySelector("#chat-messages-container");
    if (!container) return;
    const lastMsgMarkdown = container.querySelector(
      ".space-y-7 > div:last-child .markdown-body"
    );
    if (lastMsgMarkdown) {
      lastMsgMarkdown.innerHTML = `${renderMarkdown(currentText)}<span class="streaming-cursor"></span>`;
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const container = document.querySelector("#chat-messages-container");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
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
      });

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          const val = textarea.value.trim();
          if (val) sendMessage(val);
        }
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

    // 5. Model Picker Dropdown Toggle (supports both topbar and composer buttons)
    document.querySelectorAll(".model-picker-toggle-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const placement = btn.getAttribute("data-toggle-model-picker") || "composer";
        modelMenuOpen = (modelMenuOpen === placement) ? false : placement;
        render();
      });
    });

    // Close model dropdown on document click
    document.addEventListener("click", (e) => {
      if (modelMenuOpen && !e.target.closest("#model-dropdown-menu") && !e.target.closest(".model-picker-toggle-btn")) {
        modelMenuOpen = false;
        render();
      }
    });

    // Model selection click
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
        modelMenuOpen = false;
        showToast(`Model set to: ${getActiveModelLabel()}`);
        render();
      });
    });

    // 6. Sidebar Controls
    const sidebarToggle = document.querySelector("#sidebar-toggle-btn");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebarOpen = !sidebarOpen;
        render();
      });
    }

    const closeSidebarBtn = document.querySelector("#close-sidebar-btn");
    if (closeSidebarBtn) {
      closeSidebarBtn.addEventListener("click", () => {
        sidebarOpen = false;
        render();
      });
    }

    const backdrop = document.querySelector("#sidebar-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        sidebarOpen = false;
        render();
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

    // 13. Workspace IDE & Thinking Controls
    const toggleWorkspaceBtn = document.querySelector("#toggle-workspace-btn");
    if (toggleWorkspaceBtn) {
      toggleWorkspaceBtn.addEventListener("click", () => {
        workspaceOpen = !workspaceOpen;
        render();
      });
    }

    const closeWorkspaceBtn = document.querySelector("#close-workspace-btn");
    if (closeWorkspaceBtn) {
      closeWorkspaceBtn.addEventListener("click", () => {
        workspaceOpen = false;
        render();
      });
    }

    // Workspace Tab Switch
    document.querySelectorAll("[data-workspace-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-workspace-tab");
        if (tab) {
          activeWorkspaceTab = tab;
          render();
        }
      });
    });

    // Open Workspace from Action Badge or Step Item
    document.querySelectorAll("[data-open-workspace]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const target = btn.getAttribute("data-open-workspace") || "active_code";
        if (target === "active_code") {
          activeWorkspaceTab = "active_code";
        } else if (target === "appjs") {
          activeWorkspaceTab = "appjs";
        } else if (target === "terminal") {
          activeWorkspaceTab = "terminal";
        } else {
          activeWorkspaceTab = "diff";
        }
        workspaceOpen = true;
        render();
      });
    });

    // Toggle Agent Thinking Steps Accordion
    document.querySelectorAll("[data-toggle-steps]").forEach((el) => {
      el.addEventListener("click", () => {
        const msgId = el.getAttribute("data-toggle-steps");
        if (msgId) {
          expandedWorkSteps[msgId] = expandedWorkSteps[msgId] === false ? true : false;
          render();
        }
      });
    });

    // Copy Workspace Code
    const copyWorkspaceBtn = document.querySelector("[data-action='copy-workspace-code']");
    if (copyWorkspaceBtn) {
      copyWorkspaceBtn.addEventListener("click", () => {
        AudioEffects.play("click");
        if (currentActiveCodeTask && currentActiveCodeTask.code) {
          navigator.clipboard.writeText(currentActiveCodeTask.code);
          showToast(`Copied ${currentActiveCodeTask.filename} to clipboard!`);
        } else {
          showToast("Workspace code copied to clipboard!");
        }
      });
    }

    // 13B. Super-Features: Voice, Audio, Code Runner & ZIP Export Wiring
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

    document.querySelectorAll("[data-action='speak-message']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const text = btn.getAttribute("data-text");
        toggleSpeechSynthesis(id, text);
      });
    });

    const handleRunActiveCode = () => {
      if (!currentActiveCodeTask || !currentActiveCodeTask.code) {
        showToast("No active code to run. Ask Lumi to generate a script or app!");
        return;
      }
      AudioEffects.play("click");
      const lang = (currentActiveCodeTask.lang || "").toLowerCase();
      if (lang === "python" || lang === "py" || currentActiveCodeTask.filename.endsWith(".py")) {
        runPythonCode(currentActiveCodeTask.code);
      } else {
        activeWorkspaceTab = "preview";
        workspaceOpen = true;
        AudioEffects.play("success");
        showToast(`🚀 ${currentActiveCodeTask.filename} is running in Live Preview!`);
        render();
      }
    };

    document.querySelectorAll("[data-action='run-code']").forEach((btn) => {
      btn.addEventListener("click", handleRunActiveCode);
    });

    const workspaceRunBtn = document.querySelector("#workspace-run-code-btn");
    if (workspaceRunBtn) {
      workspaceRunBtn.addEventListener("click", handleRunActiveCode);
    }

    const downloadZipBtn = document.querySelector("#download-project-zip-btn");
    if (downloadZipBtn) {
      downloadZipBtn.addEventListener("click", () => {
        downloadProjectZip();
      });
    }

    const reloadPreviewBtn = document.querySelector("#reload-preview-btn");
    if (reloadPreviewBtn) {
      reloadPreviewBtn.addEventListener("click", () => {
        AudioEffects.play("click");
        const iframe = document.querySelector("#live-preview-iframe");
        if (iframe) {
          const code = currentActiveCodeTask ? getRunnableHtml(currentActiveCodeTask) : "";
          if (code) {
            iframe.srcdoc = code;
          } else {
            iframe.src = iframe.src;
          }
          showToast("Live Preview reloaded.");
        }
      });
    }

    const fullscreenPreviewBtn = document.querySelector("#fullscreen-preview-btn");
    if (fullscreenPreviewBtn) {
      fullscreenPreviewBtn.addEventListener("click", () => {
        AudioEffects.play("click");
        const code = currentActiveCodeTask ? getRunnableHtml(currentActiveCodeTask) : "<h1>No App</h1>";
        const blob = new Blob([code], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      });
    }

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
              content: generateBuiltInResponse("Mujhe productivity ke 5 tips do", "openai"),
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
    window.addEventListener("hashchange", render);
    initSeedData();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
