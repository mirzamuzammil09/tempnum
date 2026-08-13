"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hash, Mail } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isTempMail = pathname === "/tempmail";
  const isNumbers = pathname === "/" || pathname.startsWith("/number");

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-zinc-100 transition-colors duration-200 group-hover:text-white">
              Temp<span className="text-zinc-400">Num</span>
            </span>
          </Link>
        </div>
        
        {/* Switch Button Section */}
        <nav className="flex items-center bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-0.5 select-none">
          {/* Numbers Switch Button */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              isNumbers
                ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>Numbers</span>
          </Link>

          {/* Temp Mail Switch Button */}
          <Link
            href="/tempmail"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
              isTempMail
                ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
