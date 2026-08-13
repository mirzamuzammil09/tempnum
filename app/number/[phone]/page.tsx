"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Mail, 
  Clock, 
  AlertCircle,
  Share2,
  Star,
  Search
} from "lucide-react";
import Link from "next/link";

interface Message {
  text: string;
  sender: string;
  created_at: string;
  date: string;
}

interface ApiResponse {
  response: string;
  messages: Message[];
}

// Helper to generate flag emojis
function getFlagEmoji(countryCode: string, countryText: string): string {
  const text = countryText.toLowerCase();
  const code = countryCode.toUpperCase();
  
  if (text.includes("united states") || text.includes("usa") || code === "1" || code === "US") return "🇺🇸";
  if (text.includes("united kingdom") || text.includes("great britain") || text.includes("uk") || code === "44" || code === "GB") return "🇬🇧";
  if (text.includes("germany") || code === "49" || code === "DE") return "🇩🇪";
  if (text.includes("france") || code === "33" || code === "FR") return "🇫🇷";
  if (text.includes("canada") || code === "CA") return "🇨🇦";
  if (text.includes("india") || code === "91" || code === "IN") return "🇮🇳";
  if (text.includes("netherlands") || code === "31" || code === "NL") return "🇳🇱";
  if (text.includes("sweden") || code === "46" || code === "SE") return "🇸🇪";
  if (text.includes("australia") || code === "61" || code === "AU") return "🇦🇺";
  if (text.includes("finland") || code === "358" || code === "FI") return "🇫🇮";
  if (text.includes("russia") || code === "7" || code === "RU") return "🇷🇺";
  if (text.includes("ukraine") || code === "380" || code === "UA") return "🇺🇦";
  if (text.includes("spain") || code === "34" || code === "ES") return "🇪🇸";
  if (text.includes("italy") || code === "39" || code === "IT") return "🇮🇹";
  if (text.includes("greece") || code === "30" || code === "GR") return "🇬🇷";
  if (text.includes("croatia") || code === "385" || code === "HR") return "🇭🇷";
  if (text.includes("hungary") || code === "36" || code === "HU") return "🇭🇺";
  if (text.includes("austria") || code === "43" || code === "AT") return "🇦🇹";
  if (text.includes("norway") || code === "47" || code === "NO") return "🇳🇴";
  if (text.includes("new zealand") || code === "64" || code === "NZ") return "🇳🇿";
  if (text.includes("latvia") || code === "371" || code === "LV") return "🇱🇻";
  if (text.includes("georgia") || code === "995" || code === "GE") return "🇬🇪";

  return "🌐";
}

export default function NumberDetails() {
  const params = useParams();
  const rawPhone = params.phone ? (params.phone as string) : "";
  const phone = decodeURIComponent(rawPhone);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  
  // Dynamic header matching state
  const [countryName, setCountryName] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");

  // Favorites star persistence
  const [isStarred, setIsStarred] = useState(false);

  // Message filter search query
  const [msgSearch, setMsgSearch] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!phone) return;
    try {
      setError(null);
      const res = await fetch(`/api/messages?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        throw new Error("Failed to load messages from server.");
      }
      const data: ApiResponse = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      } else {
        throw new Error("Invalid response format received.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const getCountryDetails = async () => {
      try {
        const res = await fetch("/api/numbers");
        if (res.ok) {
          const data = await res.json();
          if (data.numbers) {
            const cleanTarget = phone.replace(/\D/g, "");
            const matched = data.numbers.find((n: { number?: string; full_number?: string; country?: string; country_text?: string }) => {
              const cleanNum = String(n.number || "").replace(/\D/g, "");
              const cleanFull = String(n.full_number || "").replace(/\D/g, "");
              return cleanTarget.endsWith(cleanNum) || cleanTarget === cleanFull;
            });
            if (matched) {
              setCountryName(matched.country_text);
              setCountryCode(matched.country);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to fetch country details for header:", e);
      }
    };
    getCountryDetails();

    // Check star status
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("starred_numbers");
      if (saved) {
        try {
          const list = JSON.parse(saved) as string[];
          setIsStarred(list.includes(phone));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [phone]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMessages();
  };

  const copyPhoneNumber = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const sharePage = () => {
    if (navigator.share) {
      navigator.share({
        title: `Public Number SMS Gateway - ${phone}`,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const toggleStar = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("starred_numbers");
      let list: string[] = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      let updated: string[];
      if (list.includes(phone)) {
        updated = list.filter(num => num !== phone);
        setIsStarred(false);
      } else {
        updated = [...list, phone];
        setIsStarred(true);
      }
      localStorage.setItem("starred_numbers", JSON.stringify(updated));
    }
  };

  // Extract verification code (OTP) from message
  const extractOtp = (text: string): string | null => {
    const match = text.match(/(\b\d{4,6}\b|\b\d{3}-\d{3}\b)/);
    return match ? match[0] : null;
  };

  const copyOtpCode = (text: string, index: number) => {
    const code = extractOtp(text);
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    }
  };

  // Highlights OTP values + Search terms
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) {
      const parts = text.split(/(\b\d{4,6}\b|\b\d{3}-\d{3}\b)/g);
      return parts.map((part, i) => {
        const isOtp = /^\d{4,6}$/.test(part) || /^\d{3}-\d{3}$/.test(part);
        if (isOtp) {
          return (
            <span
              key={i}
              className="font-mono-code font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    }

    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(\\b\\d{4,6}\\b|\\b\\d{3}-\\d{3}\\b|${escapedSearch})`, 'gi');
    
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (!part) return null;
      const isOtp = /^\d{4,6}$/.test(part) || /^\d{3}-\d{3}$/.test(part);
      const isSearch = part.toLowerCase() === search.toLowerCase();
      
      if (isOtp) {
        return (
          <span
            key={i}
            className="font-mono-code font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20"
          >
            {part}
          </span>
        );
      }
      if (isSearch) {
        return (
          <mark
            key={i}
            className="bg-zinc-800 text-zinc-100 font-semibold px-1 rounded-sm border border-zinc-700"
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.sender.toLowerCase().includes(msgSearch.toLowerCase()) || 
    msg.text.toLowerCase().includes(msgSearch.toLowerCase())
  );

  // Framer Motion Animation configs
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
  };

  // Style helper based on sender brand names (clean monochrome borders instead of flashy backgrounds)
  const getSenderStyle = (sender: string) => {
    const s = sender.toLowerCase();
    if (s.includes("google")) return "border-zinc-700 text-zinc-200 bg-zinc-900/60";
    if (s.includes("whatsapp")) return "border-zinc-700 text-zinc-200 bg-zinc-900/60";
    if (s.includes("telegram")) return "border-zinc-700 text-zinc-200 bg-zinc-900/60";
    return "border-zinc-800 text-zinc-300 bg-zinc-900/30";
  };

  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Top Bar / Navigation Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-6">
        <div className="flex flex-col gap-2">
          {/* Back link */}
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to Gateways</span>
          </Link>

          {/* Details Heading */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {countryName && (
              <span className="text-2xl" role="img" aria-label={countryName}>
                {getFlagEmoji(countryCode, countryName)}
              </span>
            )}
            <h1 className="font-mono-code text-lg sm:text-xl font-bold tracking-tight text-white select-all break-all truncate max-w-full">
              {phone}
            </h1>
            <div className="relative flex gap-1.5">
              {/* Star Bookmark Icon */}
              <button
                onClick={toggleStar}
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/40 border transition-colors active:scale-95 shadow-sm ${
                  isStarred 
                    ? "border-amber-500/20 text-amber-500" 
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
                title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Star className={`h-4 w-4 ${isStarred ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>

              {/* Copy Button */}
              <button
                onClick={copyPhoneNumber}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors active:scale-95 shadow-sm"
                title="Copy Number"
              >
                {copiedNumber ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>

              {/* Share Button */}
              <button
                onClick={sharePage}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors active:scale-95 shadow-sm"
                title="Share Gateway Feed"
              >
                {copiedShare ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {(copiedNumber || copiedShare) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 3, scale: 0.98 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-[11px] font-medium text-emerald-555 shadow-md whitespace-nowrap"
                  >
                    {copiedNumber ? "Number Copied" : "Link Copied"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-900/20 border border-zinc-800/80 px-3 py-1.5 text-[11px] text-zinc-550 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Gateway connected</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition-colors active:scale-98 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${(loading || isRefreshing) ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Inbox"}</span>
          </button>
        </div>
      </div>

      {/* Message Filter Search Bar */}
      {!loading && messages.length > 0 && (
        <div className="mb-5 max-w-sm">
          <div className="relative flex items-center bg-zinc-900/30 border border-zinc-800 rounded-lg px-3 py-2">
            <Search className="h-3.5 w-3.5 text-zinc-550 mr-2" />
            <input
              type="text"
              placeholder="Search sender or message content..."
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-0 text-xs font-normal"
            />
            {msgSearch && (
              <button
                onClick={() => setMsgSearch("")}
                className="text-[9px] text-zinc-400 hover:text-white px-1.5 py-0.2 bg-zinc-800 rounded border border-zinc-700 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Message Feed Display */}
      <div>
        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4 text-center flex flex-col items-center gap-2.5 justify-center text-xs text-red-300 mb-6 max-w-sm mx-auto">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <span>{error}</span>
            <button onClick={fetchMessages} className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-800">
              Reload Feed
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 overflow-hidden">
                <div className="absolute inset-0 animate-shimmer-fast" />
                <div className="flex items-center justify-between mb-2">
                  <div className="h-5 w-24 rounded bg-zinc-900" />
                  <div className="h-4 w-16 rounded bg-zinc-900" />
                </div>
                <div className="h-4 w-3/4 rounded bg-zinc-900 mt-2 mb-1" />
                <div className="h-4 w-1/2 rounded bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/10 px-6">
            <Mail className="mx-auto h-10 w-10 text-zinc-700 mb-3 animate-pulse" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1 font-display">No messages</h3>
            <p className="text-zinc-550 text-xs max-w-sm mx-auto leading-relaxed mb-4">
              This inbox is empty. Send a code request to this phone number and click Sync Inbox.
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          /* No Search Results */
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/5">
            <Search className="mx-auto h-8 w-8 text-zinc-700 mb-2" />
            <h4 className="text-xs font-semibold text-zinc-350 mb-0.5">No search matches</h4>
            <p className="text-zinc-550 text-[11px] px-6">
              No messages match &quot;{msgSearch}&quot;.
            </p>
          </div>
        ) : (
          /* SMS Feed List */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((msg, idx) => {
                const otpCode = extractOtp(msg.text);
                
                return (
                  <motion.div
                    key={`${msg.sender}-${msg.created_at}-${idx}`}
                    variants={itemVariants}
                    layout
                    className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/10 p-5 transition-colors hover:border-zinc-750 flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3.5 flex-1">
                        {/* Sender Logo Bubble */}
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold uppercase ${getSenderStyle(msg.sender)}`}>
                          {msg.sender.substring(0, 2)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-display font-semibold text-zinc-250 text-sm">
                              {msg.sender}
                            </span>
                            <div className="text-[9px] text-zinc-500 font-semibold flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 text-zinc-500" />
                              <span>PUBLIC LOGS</span>
                            </div>
                          </div>

                          {/* Message Text */}
                          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-300">
                            {highlightText(msg.text, msgSearch)}
                          </p>

                          {/* Decrypted OTP Panel */}
                          {otpCode && (
                            <div className="mt-3.5 flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-2.5 shadow-sm max-w-sm">
                              <div>
                                <span className="text-[9px] text-zinc-550 font-semibold uppercase tracking-wider block">Verification Code</span>
                                <span className="font-mono-code text-lg font-bold tracking-widest text-emerald-500 select-all">
                                  {otpCode}
                                </span>
                              </div>
                              <button
                                onClick={() => copyOtpCode(msg.text, idx)}
                                className="flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-200 transition-colors"
                              >
                                {copiedCodeIndex === idx ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5 text-zinc-450" />
                                    <span>Copy OTP</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timestamp Info */}
                      <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end gap-2 pt-2.5 sm:pt-0 border-t border-zinc-900 sm:border-none">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{msg.created_at || msg.date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
