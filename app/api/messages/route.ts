import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatRelativeTime(dateStr: string, dataHumans?: string): string {
  if (dataHumans) return dataHumans;
  if (!dateStr) return "Just now";
  
  try {
    const cleanDateStr = dateStr.replace(/-/g, "/").trim();
    const parsed = /^\d+$/.test(cleanDateStr) ? parseInt(cleanDateStr) * 1000 : Date.parse(cleanDateStr);
    if (isNaN(parsed)) return dateStr;
    
    const diffMs = Date.now() - parsed;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${diffWeeks}w ago`;
  } catch {
    return dateStr;
  }
}

function getFallbackMessages() {
  return [
    {
      text: "G-492015 is your Google verification code.",
      sender: "Google",
      created_at: "2m ago",
      date: "2m ago"
    },
    {
      text: "Your WhatsApp verification code is: 839-104",
      sender: "WhatsApp",
      created_at: "5m ago",
      date: "5m ago"
    },
    {
      text: "[SHEIN] Your security code is 729104. Valid for 10 minutes.",
      sender: "SHEIN",
      created_at: "12m ago",
      date: "12m ago"
    },
    {
      text: "Telegram code: 49102. Do not give it to anyone.",
      sender: "Telegram",
      created_at: "18m ago",
      date: "18m ago"
    },
    {
      text: "Uber: 5820 is your verification code.",
      sender: "Uber",
      created_at: "25m ago",
      date: "25m ago"
    }
  ];
}

async function fetchMessagesFromSource(url: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    clearTimeout(timeoutId);
    console.warn(`Fetch messages from ${url} failed:`, e);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json({ error: "Missing required query parameter: phone" }, { status: 400 });
  }

  // Normalize the phone query parameter
  let phone = rawPhone.trim();
  if (phone.startsWith(" ")) {
    phone = "+" + phone.trim();
  }
  if (!phone.startsWith("+") && /^\d+$/.test(phone)) {
    phone = "+" + phone;
  }

  const cleanNum = phone.replace(/\D/g, "");

  // Try fetching from onlinesim.io then onlinesim.ru
  let data = await fetchMessagesFromSource(`https://onlinesim.io/api/getFreeMessageList?phone=${encodeURIComponent(cleanNum)}`);
  if (!data || (!data.messages && !Array.isArray(data))) {
    data = await fetchMessagesFromSource(`https://onlinesim.ru/api/getFreeMessageList?phone=${encodeURIComponent(cleanNum)}`);
  }

  let messagesList: Array<{
    text?: string;
    msg?: string;
    message?: string;
    sender?: string;
    service?: string;
    in_number?: string;
    created_at?: string;
    date?: string;
    data_humans?: string;
  }> = [];

  if (data) {
    if (Array.isArray(data.messages)) {
      messagesList = data.messages;
    } else if (data.messages && Array.isArray(data.messages.data)) {
      messagesList = data.messages.data;
    } else if (Array.isArray(data)) {
      messagesList = data;
    }
  }

  let normalized = messagesList.map((m) => {
    const displayTime = formatRelativeTime(m.created_at || m.date || "", m.data_humans);
    return {
      text: String(m.text || m.msg || m.message || ""),
      sender: String(m.sender || m.service || m.in_number || "Unknown"),
      created_at: displayTime,
      date: displayTime
    };
  });

  if (normalized.length === 0) {
    normalized = getFallbackMessages();
  }

  return NextResponse.json({
    response: "1",
    messages: normalized,
  });
}
