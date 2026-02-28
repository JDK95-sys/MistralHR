"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import Topbar from "@/components/Topbar";

// ─── Types ─────────────────────────────────────────────────────────
interface Citation {
  chunkId: string;
  docTitle: string;
  policyRef: string | null;
  effectiveDate: string | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
  timestamp: Date;
}

// ─── Suggested questions ───────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  { emoji: "🏖️", text: "What is my annual leave entitlement?" },
  { emoji: "👶", text: "How do I apply for parental leave?" },
  { emoji: "💶", text: "How do I submit an expense claim?" },
  { emoji: "🏠", text: "What is the remote work policy?" },
  { emoji: "⚕️", text: "What healthcare benefits do I have?" },
  { emoji: "📈", text: "How does the mobility budget work?" },
];

// ─── Markdown rendering components ─────────────────────────────────
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8, marginTop: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6, marginTop: 14, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, marginTop: 10, color: "var(--sage)" }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{ marginBottom: 10, lineHeight: 1.7, fontSize: 13.5, color: "var(--text-secondary)" }}>{children}</p>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: "var(--text-primary)" }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: "italic", color: "var(--text-muted)" }}>{children}</em>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: 0, marginBottom: 10, listStyle: "none" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: 6, marginBottom: 10, listStyle: "none", counterReset: "item" }}>{children}</ol>
  ),
  li: ({ children, ...props }) => {
    // Determine if parent is ol or ul
    const isOrdered = (props as Record<string, unknown>).ordered;
    return (
      <li style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
        fontSize: 13.5,
        lineHeight: 1.6,
        color: "var(--text-secondary)",
      }}>
        <span style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: isOrdered ? 6 : "50%",
          background: isOrdered ? "var(--mint-10)" : "var(--mint-10)",
          color: "var(--sage)",
          fontSize: 10,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        }}>
          {isOrdered ? (props as Record<string, unknown>).index !== undefined
            ? `${Number((props as Record<string, unknown>).index) + 1}`
            : "•" : "✓"}
        </span>
        <span style={{ flex: 1 }}>{children}</span>
      </li>
    );
  },
  table: ({ children }) => (
    <div style={{
      borderRadius: 12,
      border: "1px solid var(--glass-border)",
      overflow: "hidden",
      marginBottom: 12,
      marginTop: 4,
    }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 12.5,
      }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: "transparent" }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th style={{
      textAlign: "left",
      padding: "8px 12px",
      fontWeight: 700,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "var(--text-muted)",
      borderBottom: "1px solid var(--glass-border)",
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: "8px 12px",
      borderBottom: "1px solid var(--glass-border)",
      color: "var(--text-secondary)",
      fontSize: 13,
    }}>{children}</td>
  ),
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code style={{
          background: "var(--mint-10)",
          color: "var(--sage)",
          padding: "2px 6px",
          borderRadius: 6,
          fontSize: 12,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontWeight: 500,
        }}>{children}</code>
      );
    }
    return (
      <code style={{
        display: "block",
        background: "var(--pepper)",
        color: "#e8e8ed",
        padding: 14,
        borderRadius: 10,
        fontSize: 12,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        overflowX: "auto",
        marginBottom: 10,
      }}>{children}</code>
    );
  },
  hr: () => (
    <hr style={{
      border: "none",
      borderTop: "1px solid var(--glass-border)",
      margin: "14px 0",
    }} />
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      color: "var(--sage)",
      fontWeight: 600,
      textDecoration: "none",
      borderBottom: "1.5px solid var(--mint)",
    }}>{children}</a>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: "3px solid var(--mint)",
      paddingLeft: 14,
      margin: "10px 0",
      color: "var(--text-muted)",
      fontStyle: "italic",
    }}>{children}</blockquote>
  ),
};

// ─── Component ─────────────────────────────────────────────────────
export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const MAX_MESSAGE_LENGTH = 4000;
  const country = session?.user?.country ?? "your country";
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  const getInitials = (name?: string | null) =>
    name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    if (text.trim().length > MAX_MESSAGE_LENGTH) {
      alert(`Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const aId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: aId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);
    setStatusText(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event: Record<string, unknown>;
          try { event = JSON.parse(raw); } catch { continue; }

          if (event.type === "status") {
            setStatusText(event.message as string);
          } else if (event.type === "text") {
            setMessages((prev) =>
              prev.map((m) => m.id === aId
                ? { ...m, content: m.content + (event.text as string) }
                : m)
            );
          } else if (event.type === "citations") {
            setMessages((prev) =>
              prev.map((m) => m.id === aId
                ? { ...m, citations: event.citations as Citation[] }
                : m)
            );
          } else if (event.type === "done") {
            setSessionId(event.sessionId as string);
          } else if (event.type === "error") {
            throw new Error(event.message as string);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) =>
        prev.map((m) => m.id === aId ? { ...m, content: `⚠️ ${msg}`, isStreaming: false } : m)
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => m.id === aId ? { ...m, isStreaming: false } : m)
      );
      setIsLoading(false);
      setStatusText(null);
      inputRef.current?.focus();
    }
  }, [isLoading, sessionId]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-full" style={{ background: "transparent" }}>
      <Topbar>
        {hasMessages && (
          <button
            onClick={() => { setMessages([]); setSessionId(null); }}
            className="chat-new-btn"
          >
            <span style={{ fontSize: 14 }}>+</span> New chat
          </button>
        )}
      </Topbar>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ─── Welcome screen ──────────────────────────────────────── */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 animate-fade-in">
            {/* Editorial header */}
            <div className="chat-welcome-header">
              <div className="chat-welcome-badge">
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em" }}>AI · ONLINE</span>
                <span className="chat-status-dot" />
              </div>
              <h2 className="chat-welcome-title">How can I help you today?</h2>
              <p className="chat-welcome-sub">
                Ask about leave, benefits, policies or internal opportunities.{" "}
                <span style={{ color: "var(--sage)" }}>{country}</span> policies loaded.
              </p>
            </div>

            {/* Suggestion grid */}
            <div className="chat-suggestions-grid">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => sendMessage(q.text)}
                  className="chat-suggestion-card"
                >
                  <span className="chat-suggestion-emoji">{q.emoji}</span>
                  <span className="chat-suggestion-text">{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Messages ────────────────────────────────────────────── */}
        {hasMessages && (
          <div className="flex-1 overflow-y-auto" style={{ background: "transparent" }}>
            <div className="chat-messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message-row ${msg.role === "user" ? "chat-message-user" : "chat-message-assistant"}`}>
                  {/* Avatar */}
                  <div className={`chat-avatar ${msg.role === "user" ? "chat-avatar-user" : "chat-avatar-assistant"}`}>
                    {msg.role === "assistant" ? "✨" : getInitials(session?.user?.name)}
                  </div>

                  {/* Message body */}
                  <div className="chat-message-body">
                    <div className="chat-message-meta">
                      <span className="chat-message-sender">
                        {msg.role === "assistant" ? "HR Assistant" : session?.user?.name ?? "You"}
                      </span>
                      <span className="chat-message-time">{formatTime(msg.timestamp)}</span>
                    </div>

                    <div className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
                      {msg.role === "user" ? (
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{msg.content}</p>
                      ) : (
                        <>
                          {msg.content ? (
                            <div className="chat-markdown">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : msg.isStreaming ? (
                            <div className="chat-typing-indicator">
                              <span /><span /><span />
                            </div>
                          ) : null}
                          {msg.isStreaming && msg.content && (
                            <span className="chat-cursor" />
                          )}
                        </>
                      )}
                    </div>

                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="chat-citations">
                        <div className="chat-citations-label">Sources</div>
                        {msg.citations.map((c) => (
                          <div key={c.chunkId} className="chat-citation-chip">
                            <span className="chat-citation-icon">📄</span>
                            <div>
                              <div className="chat-citation-title">{c.docTitle}</div>
                              {(c.policyRef || c.effectiveDate) && (
                                <div className="chat-citation-meta">
                                  {c.policyRef}{c.policyRef && c.effectiveDate ? " · " : ""}
                                  {c.effectiveDate && `Effective ${new Date(c.effectiveDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Status indicator */}
              {statusText && (
                <div className="chat-status-indicator animate-fade-in">
                  <span className="chat-status-spinner" />
                  {statusText}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {/* ─── Input area ──────────────────────────────────────────── */}
        <div className="chat-input-area">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask about leave, benefits, expenses, remote work…"
                className="chat-input"
                disabled={isLoading}
                rows={1}
                autoFocus
              />
              {isLoading ? (
                <button type="button" onClick={() => abortRef.current?.abort()} className="chat-send-btn chat-stop-btn" aria-label="Stop">
                  <svg width="12" height="12" viewBox="0 0 12 12"><rect width="12" height="12" rx="2" fill="currentColor" /></svg>
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="chat-send-btn" aria-label="Send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <p className="chat-disclaimer" style={{ marginTop: 0 }}>
                🔒 Based on official HR documents · EU AI Act compliant · Verify decisions with your HRBP
              </p>
              {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
                <span
                  className="text-xs flex-shrink-0 ml-3"
                  style={{ color: input.length >= MAX_MESSAGE_LENGTH ? "var(--rhubarb)" : "var(--text-muted)" }}
                >
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
