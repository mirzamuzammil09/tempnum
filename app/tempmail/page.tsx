"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Copy, 
  RefreshCw, 
  Inbox, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Clock,
  Eye,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface MailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
}

interface MailDetail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  textBody: string;
  htmlBody: string;
}

export default function TempMailPage() {
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MailDetail | null>(null);
  const [activeMessage, setActiveMessage] = useState<MailDetail | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (selectedMessage) {
      setActiveMessage(selectedMessage);
    }
  }, [selectedMessage]);

  // Generate Email
  const generateNewEmail = async () => {
    setLoadingEmail(true);
    setError(null);
    setMessages([]);
    setSelectedMessage(null);
    try {
      const res = await fetch("/api/tempmail?action=gen");
      if (!res.ok) throw new Error("Failed to generate temp email");
      const data = await res.json();
      if (data.email && data.token) {
        setEmail(data.email);
        setToken(data.token);
        if (typeof window !== "undefined") {
          localStorage.setItem("temp_mail_address", data.email);
          localStorage.setItem("temp_mail_token", data.token);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate email");
    } finally {
      setLoadingEmail(false);
      setCountdown(10);
    }
  };

  // Fetch Message List
  const fetchMessages = useCallback(async (targetToken: string) => {
    if (!targetToken) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/tempmail?action=list&token=${encodeURIComponent(targetToken)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to check inbox");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Fetch Message Detail
  const viewMessageDetail = async (msgId: string) => {
    setLoadingMessageId(msgId);
    setError(null);
    try {
      const res = await fetch(`/api/tempmail?action=read&token=${encodeURIComponent(token)}&id=${msgId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to read email details");
      const data = await res.json();
      if (data.message) {
        setSelectedMessage(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load email details");
    } finally {
      setLoadingMessageId(null);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Initialize email on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (typeof window !== "undefined") {
      const savedAddress = localStorage.getItem("temp_mail_address");
      const savedToken = localStorage.getItem("temp_mail_token");
      
      if (!savedAddress || !savedAddress.includes("@") || !savedToken) {
        localStorage.removeItem("temp_mail_address");
        localStorage.removeItem("temp_mail_token");
        generateNewEmail();
      } else if (savedAddress && savedAddress.includes("@") && savedToken) {
        setEmail(savedAddress);
        setToken(savedToken);
        fetchMessages(savedToken);
      } else {
        generateNewEmail();
      }
    }
  }, [fetchMessages]);

  // Handle countdown & auto polling
  useEffect(() => {
    if (!token) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchMessages(token);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [token, fetchMessages]);

  const handleManualRefresh = () => {
    if (token) {
      fetchMessages(token);
      setCountdown(10);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-200px)] px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/" className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-450 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" /> Back to Virtual Numbers
        </Link>
      </div>

      {/* Header */}
      <section className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400 mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-zinc-400 animate-pulse" />
          <span>Temporary Email Service</span>
        </motion.div>
        
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Disposable Temporary Email
        </h1>
        <p className="max-w-xl mx-auto text-zinc-450 text-xs sm:text-sm">
          Keep your real inbox spam-free. Generate a temporary email to register accounts and receive verification logs securely.
        </p>
      </section>

      {/* Email Generator Container */}
      <section className="max-w-xl mx-auto mb-8">
        <div className="relative bg-zinc-900/20 border border-zinc-800 rounded-xl p-5 sm:p-6 backdrop-blur-xl">
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
            Your Temporary Email Address
          </label>
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Mail Box Display */}
            <div className="flex-1 flex items-center bg-zinc-900/30 border border-zinc-800 rounded-lg px-3.5 py-2 font-mono text-sm text-zinc-150 overflow-hidden justify-between select-all hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{loadingEmail ? "Generating..." : email || "Click Generate"}</span>
              </div>
              {email && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                  title="Copy Address"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-555" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                generateNewEmail();
              }}
              disabled={loadingEmail}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Generate New
            </button>
          </div>

          {/* Auto refresh status bar */}
          {email && (
            <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-550 font-semibold">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span>Checking inbox in <span className="text-zinc-300 font-bold font-mono">{countdown}s</span></span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleManualRefresh();
                }}
                disabled={loadingMessages}
                className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors font-semibold"
              >
                <RefreshCw className={`h-3 w-3 ${loadingMessages ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Inbox section */}
      <section className="max-w-2xl mx-auto">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Inbox className="h-4 w-4 text-zinc-500" /> Inbox
        </h2>

        {error && (
          <div className="mb-4 p-3.5 rounded-lg border border-red-950/20 bg-red-950/5 text-xs text-red-300 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Message List Grid */}
        <div className="space-y-2">
          {loadingMessages && messages.length === 0 ? (
            /* Loading skeletons */
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-zinc-900/10 border border-zinc-900/60 animate-pulse" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/10">
              <Mail className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
              <h3 className="text-xs font-semibold text-zinc-300 mb-0.5">Inbox is empty</h3>
              <p className="text-zinc-500 text-[11px] px-4">
                Use your generated address to register. Incoming messages appear automatically.
              </p>
            </div>
          ) : (
            /* Message list */
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/10 p-3.5 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                onClick={() => viewMessageDetail(msg.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-zinc-300 truncate max-w-[150px] sm:max-w-xs">{msg.from}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{msg.date}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white truncate">{msg.subject || "(No Subject)"}</h3>
                </div>
                
                <button type="button" className="self-start sm:self-center flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors">
                  {loadingMessageId === msg.id ? (
                    <Loader2 className="h-3.5 w-3.5 text-zinc-500 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-350" />
                  )}
                  <span>{loadingMessageId === msg.id ? "Loading..." : "Read Mail"}</span>
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Message Reader Modal */}
      <AnimatePresence onExitComplete={() => setActiveMessage(null)}>
        {selectedMessage && activeMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedMessage(null);
              }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase font-display">Email details</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedMessage(null);
                    }}
                    className="text-zinc-400 hover:text-white text-[11px] font-semibold px-2 py-1 bg-zinc-800 hover:bg-zinc-750 rounded border border-zinc-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <h2 className="text-sm font-semibold text-zinc-100 leading-snug">{activeMessage.subject || "(No Subject)"}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-1 mt-0.5 font-medium">
                  <div>From: <span className="text-zinc-300 font-semibold">{activeMessage.from}</span></div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-zinc-500" /> {activeMessage.date}</div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-5 overflow-y-auto bg-white text-zinc-900">
                {activeMessage.htmlBody ? (
                  <iframe
                    srcDoc={`
                      <html>
                        <head>
                          <base target="_blank">
                          <style>
                            body {
                              color: #18181b;
                              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
                              font-size: 13px;
                              line-height: 1.5;
                              margin: 0;
                              padding: 4px;
                              background-color: #ffffff;
                              word-break: break-word;
                            }
                            a { color: #2563eb; text-decoration: underline; }
                            p { margin: 0 0 1em 0; }
                            code, pre { background-color: rgba(0,0,0,0.06); padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                          </style>
                        </head>
                        <body>
                          ${(activeMessage.htmlBody || "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/<meta\b[^>]*>/gi, '')}
                        </body>
                      </html>
                    `}
                    className="w-full h-[350px] border-none bg-white"
                    title="Email Body"
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                  />
                ) : (
                  <div className="text-xs text-zinc-800 whitespace-pre-wrap font-sans">
                    {activeMessage.body || activeMessage.textBody}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
