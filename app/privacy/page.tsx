import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TempNum",
  description: "Privacy Policy for TempNum",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <Shield className="h-5 w-5 text-zinc-300" />
        </div>
        <h1 className="text-3xl font-bold text-white font-display">Privacy Policy</h1>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm leading-relaxed space-y-6">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Information Collection</h2>
        <p>TempNum is designed with privacy in mind. We provide temporary public phone numbers for SMS verification. The SMS messages received by our public numbers are publicly visible and can be viewed by anyone on the internet.</p>
        <p>For temporary emails, we generate disposable inboxes. The messages received there are tied to the token generated and stored locally in your browser.</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. Public Nature of SMS</h2>
        <p>Please be aware that all SMS messages sent to the numbers listed on TempNum are <strong>fully public</strong>. Do not use these numbers for sensitive, personal, financial, or secure accounts. We are not responsible for any privacy breaches resulting from the use of our public numbers.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Local Storage</h2>
        <p>We use your browser&apos;s Local Storage to save your preferences, such as starred numbers or your current temporary email token. This data never leaves your device and is not stored on our databases.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Third-Party Services</h2>
        <p>We utilize third-party APIs (such as Temp-mail.io for emails) to provide some of our services. These third parties may have their own privacy policies regarding the handling of messages.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">5. Changes to This Policy</h2>
        <p>We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page.</p>
      </div>
    </div>
  );
}
