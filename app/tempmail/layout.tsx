import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disposable Temporary Email | Receive Verification Emails",
  description: "Keep your real inbox spam-free. Generate a temporary email to register accounts and receive verification logs securely and anonymously.",
  keywords: ["temp mail", "disposable email", "10 minute mail", "fake email", "throwaway email", "receive verification email"],
};

export default function TempMailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
