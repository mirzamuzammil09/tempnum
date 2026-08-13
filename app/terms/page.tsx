import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | TempNum",
  description: "Terms of Service for TempNum",
};

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <FileText className="h-5 w-5 text-zinc-300" />
        </div>
        <h1 className="text-3xl font-bold text-white font-display">Terms of Service</h1>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm leading-relaxed space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing or using TempNum, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. Description of Service</h2>
        <p>TempNum provides public virtual phone numbers and temporary disposable emails for receiving verification codes and messages. The service is provided &quot;AS IS&quot; without any warranties regarding reliability, uptime, or message delivery.</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Prohibited Uses</h2>
        <p>You agree NOT to use TempNum for:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Any unlawful, illegal, or fraudulent activities.</li>
          <li>Registering accounts on banking, financial, or critical government services.</li>
          <li>Harassment, spamming, or phishing attempts.</li>
          <li>Automated scraping or abusive API requests without permission.</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. No Liability</h2>
        <p>Since the SMS messages are public, anyone can view them. We are not responsible for any stolen accounts, compromised data, or damages that occur from using our public numbers. You use this service entirely at your own risk.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">5. Service Availability</h2>
        <p>We do not guarantee that the numbers or emails will always be active. Numbers are rotated and removed regularly. We reserve the right to modify or discontinue the service at any time without notice.</p>
      </div>
    </div>
  );
}
