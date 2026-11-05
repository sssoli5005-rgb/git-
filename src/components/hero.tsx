import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Compass,
  Lightbulb,
  MessagesSquare,
  Plus,
  Send,
  Square,
} from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { tourismCopy } from "@/i18n/translations";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

const EMPTY_MESSAGES: ChatMessage[] = [];

type ChatErrorCode =
  | "not_configured"
  | "rate_limited"
  | "invalid_key"
  | "model_unavailable"
  | "invalid_request"
  | "provider_error"
  | "search_unavailable"
  | "incomplete_response"
  | "timeout"
  | "unavailable";

type OllamaStreamChunk = {
  message?: { content?: string };
  error?: string;
  reset?: boolean;
  done?: boolean;
  done_reason?: string;
};

class ChatRequestError extends Error {
  constructor(readonly code: ChatErrorCode) {
    super(code);
  }
}

function isChatErrorCode(code: unknown): code is ChatErrorCode {
  return [
    "not_configured",
    "rate_limited",
    "invalid_key",
    "model_unavailable",
    "invalid_request",
    "provider_error",
    "search_unavailable",
    "incomplete_response",
    "timeout",
    "unavailable",
  ].includes(code as string);
}

export function Hero({ onStart }: { onStart: () => void }) {
  const { lang, t } = useLanguage();
  const isArabic = lang === "ar";
  const highlights = [
    { icon: Heart, title: t.features.items[0].title, desc: t.features.items[0].desc },
    { icon: Compass, title: t.features.items[1].title, desc: t.features.items[1].desc },
    { icon: Lightbulb, title: t.features.items[2].title, desc: t.features.items[2].desc },
  ];
  const steps = isArabic
    ? [
        {
          number: "01",
          title: "ابدأ براحتك",
          desc: "اكتب اللي شاغل بالك أو الموضوع اللي حابب تفهمه.",
        },
        {
          number: "02",
          title: "اتكلم بوضوح",
          desc: "شارك التفاصيل اللي تريحك، واسأل عن أي نقطة محتاج توضيحها.",
        },
        {
          number: "03",
          title: "خد خطوة مناسبة",
          desc: "ناقش أفكارك واكتشف وجهات نظر وخطوات عملية تساعدك.",
        },
      ]
    : [
        {
          number: "01",
          title: "Start comfortably",
          desc: "Write what is on your mind or the topic you want to understand.",
        },
        {
          number: "02",
          title: "Share at your pace",
          desc: "Add the details you feel comfortable sharing and ask questions.",
        },
        {
          number: "03",
          title: "Explore your next step",
          desc: "Consider perspectives and practical steps that may help.",
        },
      ];

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--background)_0%,oklch(0.97_0.025_295)_100%)]">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        <div className="absolute -start-24 top-20 h-72 w-72 rounded-full bg-[oklch(0.86_0.08_300/0.45)] blur-3xl" />
        <div className="absolute -end-28 bottom-0 h-80 w-80 rounded-full bg-[oklch(0.88_0.06_210/0.35)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
        <div className="text-center lg:text-start">
          <div className="mb-5 inline-flex items-center rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            <span className="me-2 h-2 w-2 rounded-full bg-primary" />
            اختبرها
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.2] tracking-tight text-balance text-foreground sm:text-5xl lg:mx-0 lg:text-[3.75rem]">
            {t.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0">
            {t.subtitle}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
          <div className="absolute -inset-8 rounded-[3rem] bg-white/35 blur-2xl" />
          <div className="relative aspect-square rounded-[2.75rem] border border-white/70 bg-white/55 p-8 shadow-[0_30px_80px_-35px_oklch(0.35_0.08_300/0.35)] backdrop-blur-xl">
            <svg viewBox="0 0 420 420" className="h-full w-full" fill="none">
              <circle cx="210" cy="210" r="142" fill="oklch(0.94 0.025 300)" />
              <path
                d="M104 126C104 91 132 63 167 63H249C292 63 327 98 327 141V206C327 249 292 284 249 284H184L132 321V284C115 276 104 260 104 241V126Z"
                fill="white"
                stroke="oklch(0.62 0.14 300)"
                strokeWidth="4"
              />
              <path
                d="M143 137H276M143 177H246M143 217H267"
                stroke="oklch(0.76 0.11 295)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="303" cy="103" r="43" fill="oklch(0.72 0.16 300)" />
              <path
                d="M303 82V124M282 103H324"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="112" cy="330" r="18" fill="oklch(0.78 0.12 210)" />
              <path
                d="M88 330H40M112 306V258"
                stroke="oklch(0.78 0.12 210)"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {isArabic ? "هدف اختبرها" : "The goal of Ekhtaberha"}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base">
            {isArabic
              ? "مساحة ذكية تساعدك ترتب أفكارك، تفهم المواقف من زوايا مختلفة، وتفكر في اختياراتك بهدوء ومن غير أحكام."
              : "A thoughtful AI space to organize your thoughts, look at situations from different perspectives, and consider your choices without judgment."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_16px_45px_-28px_oklch(0.35_0.08_300/0.35)] backdrop-blur sm:p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-foreground sm:text-3xl">
          {isArabic ? "تستخدم اختبرها إزاي؟" : "How to use Ekhtaberha"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-border/70 bg-card/80 p-5 text-center shadow-sm"
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">
                {step.number}
              </span>
              <h3 className="mt-3 font-bold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-4 text-center sm:px-6">
        <div className="rounded-[2rem] border border-primary/15 bg-white/75 px-6 py-9 shadow-[0_20px_55px_-35px_oklch(0.35_0.08_300/0.4)] backdrop-blur sm:px-10">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
            {isArabic ? "جاهز تجرّب اختبرها؟" : "Ready to try Ekhtaberha?"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {isArabic
              ? "ابدأ محادثتك الأولى في أي موضوع تحب تتكلم عنه."
              : "Start your first conversation about anything on your mind."}
          </p>
          <button
            type="button"
            onClick={onStart}
            className="group mt-6 inline-flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_16px_35px_-12px_oklch(0.45_0.12_300/0.55)] transition-all hover:-translate-y-0.5 hover:bg-primary-deep"
          >
            {isArabic ? "جرّب المحادثة — ابدأ الآن" : t.ctaPrimary}
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              aria-hidden
            />
          </button>
          <p className="mt-4 text-sm font-medium text-muted-foreground">{t.heroNote}</p>
        </div>
      </div>
    </section>
  );
}
export function ChatWorkspace({
  conversations,
  activeConversation,
  sessionKey,
  onHome,
  onStartNew,
  onOpenConversation,
  onMessagesChange,
}: {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  sessionKey: number;
  onHome: () => void;
  onStartNew: () => void;
  onOpenConversation: (id: string) => void;
  onMessagesChange: (id: string | null, messages: ChatMessage[]) => string;
}) {
  const { lang, t } = useLanguage();
  const c = tourismCopy[lang as keyof typeof tourismCopy] ?? tourismCopy.en;

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-6 sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 start-[-10%] h-[420px] w-[420px] rounded-full bg-sage/30 blur-3xl" />
        <div className="absolute top-44 end-[-8%] h-[380px] w-[380px] rounded-full bg-apricot/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onHome}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent/50"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t.chat.home}
          </button>
          <span className="text-sm font-semibold text-muted-foreground">{c.chatBadge}</span>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">{t.chat.conversations}</h2>
              <button
                type="button"
                onClick={onStartNew}
                aria-label={t.chat.newConversation}
                title={t.chat.newConversation}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              {conversations.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">{t.chat.noConversations}</p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onOpenConversation(conversation.id)}
                    aria-current={activeConversation?.id === conversation.id ? "page" : undefined}
                    className={`truncate rounded-xl px-3 py-2.5 text-start text-sm transition-colors ${
                      activeConversation?.id === conversation.id
                        ? "bg-secondary font-semibold text-secondary-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {conversation.title}
                  </button>
                ))
              )}
            </div>
          </aside>

          <ChatConversation
            key={sessionKey}
            conversation={activeConversation}
            onMessagesChange={onMessagesChange}
          />
        </div>
      </div>
    </section>
  );
}

function ChatConversation({
  conversation,
  onMessagesChange,
}: {
  conversation: Conversation | null;
  onMessagesChange: (id: string | null, messages: ChatMessage[]) => string;
}) {
  const { lang, t } = useLanguage();
  const c = tourismCopy[lang];
  const messages = conversation?.messages ?? EMPTY_MESSAGES;
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<ChatMessage | null>(null);
  const [streamedReply, setStreamedReply] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const sendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const stoppedRef = useRef(false);
  const stopRef = useRef<(() => void) | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const streamedReplyContainerRef = useRef<HTMLDivElement | null>(null);
  const hasPositionedStreamedReplyRef = useRef(false);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (pendingMessage && !streamedReply) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    if (streamedReply && !hasPositionedStreamedReplyRef.current) {
      const reply = streamedReplyContainerRef.current;
      if (reply) {
        const containerTop = container.getBoundingClientRect().top;
        const replyTop = reply.getBoundingClientRect().top;
        container.scrollTop += replyTop - containerTop - 24;
        hasPositionedStreamedReplyRef.current = true;
      }
    }
  }, [messages, pendingMessage, streamedReply, pending]);

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    },
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || pending || sendingRef.current) return;
    sendingRef.current = true;

    // Keep the complete conversation in the saved chat. The server separately
    // selects a bounded recent context window for the model's token limits.
    const nextMessages: ChatMessage[] = [...messages, { role: "user" as const, content }];
    const context = nextMessages;
    const firstUserMessage = context.findIndex((message) => message.role === "user");
    const requestMessages = context.slice(firstUserMessage);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    hasPositionedStreamedReplyRef.current = false;
    stoppedRef.current = false;
    let userStopped = false;
    let partialReply = "";
    const controller = new AbortController();
    controllerRef.current = controller;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 75_000);
    stopRef.current = () => {
      userStopped = true;
      stoppedRef.current = true;
      requestIdRef.current += 1;
      controller.abort();
      setPendingMessage(null);
      setStreamedReply("");
      setInput(content);
      setStatus("");
      setPending(false);
      sendingRef.current = false;
      controllerRef.current = null;
      stopRef.current = null;
    };

    setInput("");
    setPendingMessage({ role: "user", content });
    setStreamedReply("");
    setPending(true);
    setStatus("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ language: lang, messages: requestMessages }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as { code?: unknown } | null;
        throw new ChatRequestError(isChatErrorCode(error?.code) ? error.code : "provider_error");
      }

      if (!response.body) throw new ChatRequestError("unavailable");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      let reply = "";
      let responseDone = false;
      let doneReason: string | undefined;

      const processLine = (line: string) => {
        if (!line.trim() || controller.signal.aborted || requestIdRef.current !== requestId) return;
        if (responseDone) throw new ChatRequestError("provider_error");
        let chunk: OllamaStreamChunk;
        try {
          chunk = JSON.parse(line) as OllamaStreamChunk;
        } catch {
          throw new ChatRequestError("provider_error");
        }
        if (chunk.error) {
          throw new ChatRequestError(isChatErrorCode(chunk.error) ? chunk.error : "provider_error");
        }
        if (chunk.reset) {
          reply = "";
          partialReply = "";
          setStreamedReply("");
        }
        if (typeof chunk.message?.content === "string") {
          reply += chunk.message.content;
          partialReply = reply;
          setStreamedReply(reply);
        }
        if (chunk.done === true) {
          responseDone = true;
          doneReason = chunk.done_reason;
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          lines.forEach(processLine);
        }
        buffered += decoder.decode();
        processLine(buffered);
      } finally {
        reader.releaseLock();
      }

      if (controller.signal.aborted || requestIdRef.current !== requestId) {
        throw new DOMException("The response was stopped", "AbortError");
      }

      if (!responseDone || doneReason === "length") {
        throw new ChatRequestError("incomplete_response");
      }

      const finalReply = reply.trim();
      if (!finalReply) throw new ChatRequestError("unavailable");
      const completedMessages: ChatMessage[] = [
        ...nextMessages,
        { role: "assistant" as const, content: finalReply },
      ];
      onMessagesChange(conversation?.id ?? null, completedMessages);
      setPendingMessage(null);
      setStreamedReply("");
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setPendingMessage(null);
        setInput(content);
        const cancelled =
          userStopped ||
          stoppedRef.current ||
          (controller.signal.aborted && !timedOut) ||
          (error instanceof DOMException && error.name === "AbortError" && !timedOut);
        const code = timedOut
          ? "timeout"
          : error instanceof ChatRequestError
            ? error.code
            : "unavailable";
        setStreamedReply(!cancelled ? partialReply : "");
        if (!cancelled) {
          const errorMessages: Record<ChatErrorCode, string> = {
            not_configured: t.chat.setupNeeded,
            rate_limited: t.chat.rateLimited,
            invalid_key: t.chat.invalidKey,
            model_unavailable: t.chat.modelUnavailable,
            invalid_request: t.chat.invalidRequest,
            provider_error: t.chat.providerError,
            search_unavailable: t.chat.heritageSearchFailed,
            incomplete_response: t.chat.incompleteResponse,
            timeout: t.chat.timeout,
            unavailable: t.chat.error,
          };
          setStatus(errorMessages[code]);
        }
      }
    } finally {
      clearTimeout(timeoutId);
      if (requestIdRef.current === requestId) {
        if (controllerRef.current === controller) controllerRef.current = null;
        stopRef.current = null;
        sendingRef.current = false;
        setPending(false);
      }
    }
  }

  return (
    <div className="relative min-w-0 rounded-2xl border border-border bg-card shadow-soft">
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <MessagesSquare className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{c.chatTitle}</p>
          <p className="text-xs text-muted-foreground">{c.chatBadge}</p>
        </div>
        <span aria-hidden className="ms-auto h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
      </div>

      <div
        ref={messagesContainerRef}
        aria-live="polite"
        className="flex h-[min(68svh,32rem)] min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-6 text-[15px] leading-8 sm:px-7"
        dir="auto"
        role="log"
      >
        {messages.map((message, index) => (
          <Bubble key={`${message.role}-${index}`} side={message.role === "user" ? "user" : "ai"}>
            <FormattedMessage content={message.content} />
          </Bubble>
        ))}
        {pendingMessage && (
          <Bubble side="user">
            <FormattedMessage content={pendingMessage.content} />
          </Bubble>
        )}
        {(pending || status) && streamedReply && (
          <div ref={streamedReplyContainerRef}>
            <Bubble side="ai">
              <FormattedMessage content={streamedReply} />
            </Bubble>
          </div>
        )}
        {pending && <p className="ps-2 text-xs text-muted-foreground">{t.chat.sending}</p>}
      </div>

      <div className="border-t border-border/70 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={c.chatPlaceholder}
            aria-label={c.chatPlaceholder}
            maxLength={1500}
            rows={2}
            className="min-h-12 flex-1 resize-none rounded-xl bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          {pending ? (
            <button
              type="button"
              onClick={() => stopRef.current?.()}
              aria-label={t.chat.stop}
              title={t.chat.stop}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-opacity hover:opacity-90"
            >
              <Square className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              aria-label={t.chat.send}
              disabled={!input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </button>
          )}
        </form>
        {status && (
          <p role="status" aria-live="polite" className="mt-2 text-xs text-muted-foreground">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

function FormattedMessage({ content }: { content: string }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const renderInline = (line: string) =>
    line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g).map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold">
            {part.slice(2, -2)}
          </strong>
        );
      }

      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/u);
      if (link) {
        try {
          const url = new URL(link[2]);
          if (url.protocol === "https:" || url.protocol === "http:") {
            return (
              <a
                key={index}
                href={url.href}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {link[1]}
              </a>
            );
          }
        } catch {
          return <span key={index}>{part}</span>;
        }
      }

      return <span key={index}>{part}</span>;
    });

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-1" aria-hidden="true" />;
        const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
        if (heading) {
          return (
            <p key={index} className="pt-2 text-base font-extrabold">
              {renderInline(heading[1])}
            </p>
          );
        }
        const bullet = trimmed.match(/^[-*•]\s+(.+)$/);
        if (bullet) {
          return (
            <div key={index} className="flex gap-2">
              <span className="shrink-0 text-primary">•</span>
              <span className="min-w-0">{renderInline(bullet[1])}</span>
            </div>
          );
        }
        const numbered = trimmed.match(/^(\d+[.)])\s+(.+)$/);
        if (numbered) {
          return (
            <div key={index} className="flex gap-2">
              <span className="shrink-0 font-bold text-primary">{numbered[1]}</span>
              <span className="min-w-0">{renderInline(numbered[2])}</span>
            </div>
          );
        }
        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function Bubble({ side, children }: { side: "ai" | "user"; children: ReactNode }) {
  if (side === "ai") {
    return (
      <div className="max-w-[94%] whitespace-pre-wrap break-words rounded-2xl rounded-ss-md border border-border/70 bg-secondary/90 px-5 py-4 text-[15px] leading-8 text-secondary-foreground shadow-sm sm:max-w-[88%]">
        {children}
      </div>
    );
  }
  return (
    <div className="ms-auto max-w-[94%] whitespace-pre-wrap break-words rounded-2xl rounded-se-md bg-primary px-5 py-4 text-[15px] leading-8 text-primary-foreground shadow-sm sm:max-w-[88%]">
      {children}
    </div>
  );
}
