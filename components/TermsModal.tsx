"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, ArrowRight } from "lucide-react";

export default function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const accepted = localStorage.getItem("tc_accepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    setIsAccepting(true);
    setTimeout(() => {
      localStorage.setItem("tc_accepted", "true");
      setIsOpen(false);
    }, 800);
  };

  if (!hasMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl"
          >
            {/* Shield Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-lg font-semibold tracking-tight text-zinc-100 font-display">
              Terms of Service & Disclaimer
            </h2>

            {/* Body text */}
            <p className="mb-6 text-center text-xs leading-relaxed text-zinc-400">
              This service displays publicly available phone numbers and messages. 
              These numbers are public and should not be used for unauthorized access, fraud, 
              or account misuse. This platform is intended only for development, testing, and privacy research.
            </p>

            {/* Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs px-6 py-2.5 transition-colors disabled:opacity-50 w-full"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-900" />
                    <span>Connecting to Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>I Agree & Continue</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-650" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
