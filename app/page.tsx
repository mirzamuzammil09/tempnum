"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowRight, 
  Phone, 
  Globe2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Filter,
  Grid,
  List,
  Star,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";
import TermsModal from "../components/TermsModal";

// Type definitions for API response
interface VirtualNumber {
  number: string;
  full_number: string;
  country: string;
  country_text: string;
}

interface ApiResponse {
  response: string;
  numbers: VirtualNumber[];
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

  if (code.length === 2) {
    const codePoints = code
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🌐";
    }
  }
  return "🌐";
}

export default function Home() {
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [starredNumbers, setStarredNumbers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Drag to scroll logic
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    fetchNumbers();

    if (typeof window !== "undefined") {
      const savedStars = localStorage.getItem("starred_numbers");
      if (savedStars) {
        try {
          setStarredNumbers(JSON.parse(savedStars));
        } catch (e) {
          console.error("Failed loading favorites", e);
        }
      }

      const savedView = localStorage.getItem("page_view_mode") as "grid" | "list";
      if (savedView === "grid" || savedView === "list") {
        setViewMode(savedView);
      }
    }
  }, []);

  const fetchNumbers = async () => {
    try {
      setError(null);
      const res = await fetch("/api/numbers");
      if (!res.ok) {
        throw new Error("Failed to load active gateways from server.");
      }
      const data: ApiResponse = await res.json();
      if (data.numbers) {
        setNumbers(data.numbers);
      } else {
        throw new Error("Invalid schema received from API server.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected server error occurred.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNumbers();
  };

  // Star Toggle
  const toggleStar = (e: React.MouseEvent | React.TouchEvent, fullNumber: string) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (starredNumbers.includes(fullNumber)) {
      updated = starredNumbers.filter(num => num !== fullNumber);
    } else {
      updated = [...starredNumbers, fullNumber];
    }
    setStarredNumbers(updated);
    localStorage.setItem("starred_numbers", JSON.stringify(updated));
  };

  // View Mode Change
  const changeViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("page_view_mode", mode);
  };

  // Copy helper
  const handleCopyNumber = (e: React.MouseEvent, num: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Filter logic
  const filteredNumbers = numbers.filter((item) => {
    const matchesSearch = 
      item.country_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.number.includes(searchQuery) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCountry = false;
    if (selectedCountry === "All") {
      matchesCountry = true;
    } else if (selectedCountry === "Starred") {
      matchesCountry = starredNumbers.includes(item.full_number);
    } else {
      matchesCountry = item.country_text === selectedCountry;
    }
    return matchesSearch && matchesCountry;
  });

  // Calculate unique filters dynamically
  const countriesList = [
    "All",
    ...(starredNumbers.length > 0 ? ["Starred"] : []),
    ...Array.from(new Set(numbers.map(n => n.country_text)))
  ];

  // If we filter by Starred but starred list is now empty, switch back to All
  useEffect(() => {
    if (selectedCountry === "Starred" && starredNumbers.length === 0) {
      setSelectedCountry("All");
    }
  }, [starredNumbers, selectedCountry]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.02 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" as const },
    },
  };



  return (
    <div className="relative min-h-screen px-4 py-6 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <TermsModal />

      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 relative overflow-hidden">
        {/* Soft decorative ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-zinc-800/10 rounded-full blur-[80px] -z-10" />

        {/* Minimalist Badge */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400 mb-5"
        >
          <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
          <span>Active Test Gateways</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight"
        >
          Temporary Public Numbers
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-xl mx-auto text-zinc-400 text-sm leading-relaxed mb-10"
        >
          Access public phone numbers to inspect incoming messages and verify routing integration. 
          Save favorites, search channels, and receive text delivery logs instantly.
        </motion.p>

        {/* Minimal stats cards */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 py-3 px-4 flex flex-col justify-center items-center">
            <span className="text-xl font-bold text-zinc-100">
              {numbers.length || "15"}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">
              Gateways
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 py-3 px-4 flex flex-col justify-center items-center">
            <span className="text-xl font-bold text-zinc-100">
              {new Set(numbers.map(n => n.country)).size || "15"}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">
              Countries
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 py-3 px-4 flex flex-col justify-center items-center">
            <span className="text-xl font-bold text-zinc-100">
              {starredNumbers.length}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 mt-0.5 uppercase tracking-wider">
              Starred
            </span>
          </div>
        </div>
      </section>

      {/* Search & Actions Panel */}
      <section className="mb-8">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 sm:items-center mb-6">
          {/* Clean minimal Search Box */}
          <div className="relative flex-1">
            <div className="relative flex items-center bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700/80 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-800 rounded-xl px-3.5 py-2.5 transition-all">
              <Search className="h-4 w-4 text-zinc-500 mr-2.5" />
              <input
                type="text"
                placeholder="Search country name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-0 text-sm font-normal"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2.5 justify-between sm:justify-end">
            {/* View Switcher */}
            <div className="flex bg-zinc-900/30 border border-zinc-800 rounded-xl p-0.5 select-none items-center h-[42px]">
              <button
                onClick={() => changeViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => changeViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50 flex-shrink-0"
              title="Refresh List"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || isRefreshing) ? "animate-spin text-zinc-300" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills Scroll */}
        {countriesList.length > 1 && (
          <div 
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className={`flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          >
            <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest pr-1">
              <Filter className="h-3 w-3" /> Filter
            </div>
            {countriesList.map((country) => {
              const count = country === "All" 
                ? numbers.length 
                : country === "Starred"
                  ? starredNumbers.length
                  : numbers.filter(n => n.country_text === country).length;
              const isSelected = selectedCountry === country;
              const isStarredPill = country === "Starred";
              
              return (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected 
                      ? "bg-zinc-100 border-zinc-100 text-zinc-950"
                      : "bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {isStarredPill ? (
                    <Star className={`h-3 w-3 ${isSelected ? "fill-zinc-950 text-zinc-950" : "text-zinc-400"}`} />
                  ) : country !== "All" && (
                    <span>{getFlagEmoji(country.substring(0, 2), country)}</span>
                  )}
                  <span>{country}</span>
                  <span className={`rounded-sm px-1 py-0.2 text-[9px] font-mono ${
                    isSelected 
                      ? "bg-zinc-900 text-zinc-100" 
                      : "bg-zinc-900/60 text-zinc-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Numbers Grid / List Display */}
      <section className="mb-20">
        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-5 text-center flex flex-col items-center gap-3 justify-center text-xs text-red-300 max-w-sm mx-auto">
            <AlertCircle className="h-6 w-6 text-red-400" />
            <span>{error}</span>
            <button onClick={fetchNumbers} className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-colors">
              Retry Connection
            </button>
          </div>
        )}

        {/* Skeletons Loading State */}
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="relative h-40 rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 overflow-hidden"
                >
                  <div className="absolute inset-0 animate-shimmer-fast" />
                  <div className="h-5 w-20 rounded bg-zinc-900 mb-4" />
                  <div className="h-6 w-32 rounded bg-zinc-900 mb-6" />
                  <div className="h-8 w-full rounded bg-zinc-900" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="relative h-14 rounded-lg border border-zinc-900 bg-zinc-900/10 p-4 overflow-hidden"
                >
                  <div className="absolute inset-0 animate-shimmer-fast" />
                  <div className="flex items-center justify-between h-full">
                    <div className="h-5 w-24 rounded bg-zinc-900" />
                    <div className="h-5 w-32 rounded bg-zinc-900" />
                    <div className="h-6 w-20 rounded bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredNumbers.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20 max-w-sm mx-auto">
            <Globe2 className="mx-auto h-10 w-10 text-zinc-700 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">No Active Gateways</h3>
            <p className="text-zinc-500 text-xs px-6">
              {selectedCountry === "Starred" 
                ? "You haven't bookmarked any numbers. Click the star on any card to save it." 
                : "No active gateways match your filter settings."}
            </p>
          </div>
        ) : (
          /* Main content display with Framer Motion */
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              /* GRID VIEW (Minimalist Cards) */
              <motion.div
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {filteredNumbers.map((item) => {
                  const isStarred = starredNumbers.includes(item.full_number);
                  return (
                    <Link
                      key={item.full_number}
                      href={`/number/${encodeURIComponent(item.full_number)}`}
                      className="block group focus:outline-none"
                    >
                      <motion.div
                        variants={cardVariants}
                        className="relative rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-5 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/30 flex flex-col justify-between h-40"
                      >
                        {/* Card Header: Flag, Country & Action Icons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl" role="img" aria-label={item.country_text}>
                              {getFlagEmoji(item.country, item.country_text)}
                            </span>
                            <span className="text-xs font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors font-display">
                              {item.country_text}
                            </span>
                          </div>
                          
                          {/* Bookmark Star & Active indicator */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => toggleStar(e, item.full_number)}
                              className="p-1 rounded text-zinc-500 hover:text-amber-500 transition-colors"
                              title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Star className={`h-3.5 w-3.5 ${isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                            </button>
                            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span>Online</span>
                            </span>
                          </div>
                        </div>

                        {/* Phone Number & Copy Option */}
                        <div className="my-1.5 flex items-center justify-between group/num">
                          <span className="font-mono-code text-sm sm:text-base font-semibold tracking-tight text-zinc-100 select-all truncate max-w-full">
                            {item.full_number}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyNumber(e, item.full_number)}
                            className="opacity-0 group-hover/num:opacity-100 p-1 text-zinc-500 hover:text-white transition-opacity bg-zinc-900/60 rounded border border-zinc-800"
                            title="Copy number"
                          >
                            {copiedNumber === item.full_number ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>

                        {/* SMS Feed link */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[9px] font-medium text-zinc-500 font-mono tracking-wider">
                            PUBLIC LOGS
                          </span>
                          
                          <div
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 group-hover:border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-350 transition-colors"
                          >
                            <span>Read SMS</span>
                            <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </motion.div>
            ) : (
              /* LIST VIEW (Compact Rows) */
              <motion.div
                key="list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {filteredNumbers.map((item) => {
                  const isStarred = starredNumbers.includes(item.full_number);
                  return (
                    <motion.div
                      key={item.full_number}
                      variants={cardVariants}
                      className="border border-zinc-800 bg-zinc-900/10 rounded-xl px-4 py-3 transition-colors hover:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      {/* Country Info */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <span className="text-xl" role="img" aria-label={item.country_text}>
                          {getFlagEmoji(item.country, item.country_text)}
                        </span>
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-200 leading-none">{item.country_text}</h4>
                          <span className="text-[9px] text-zinc-500 font-medium">GATEWAY ONLINE</span>
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="flex items-center gap-2 font-mono-code text-xs sm:text-sm font-semibold text-zinc-300 select-all">
                        <Phone className="h-3.5 w-3.5 text-zinc-650" />
                        <span>{item.full_number}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyNumber(e, item.full_number)}
                          className="p-1 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded border border-zinc-800"
                          title="Copy number"
                        >
                          {copiedNumber === item.full_number ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleStar(e, item.full_number)}
                          className="p-1 text-zinc-500 hover:text-amber-500 transition-colors"
                          title={isStarred ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Star className={`h-3.5 w-3.5 ${isStarred ? "text-amber-500 fill-amber-500" : ""}`} />
                        </button>
                      </div>

                      {/* Action Button */}
                      <div className="text-right">
                        <Link
                          href={`/number/${encodeURIComponent(item.full_number)}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-colors w-full sm:w-auto"
                        >
                          <span>Open Inbox</span>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </div>
  );
}
