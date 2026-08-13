import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  
  if (!action) {
    return NextResponse.json({ error: "Missing required action parameter" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // Generate clean disposable email account using Temp-mail.io internal API
    if (action === "gen") {
      const createRes = await fetch("https://api.internal.temp-mail.io/api/v3/email/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ min_name_length: 10, max_name_length: 10 }),
        signal: controller.signal,
        cache: "no-store"
      });
      if (!createRes.ok) throw new Error("Failed to create temporary email address.");
      
      const data = await createRes.json();
      
      clearTimeout(timeoutId);
      return NextResponse.json({ 
        email: data.email,
        token: data.email // Use email as the identifier token for list/read actions
      });
    }

    // List inbox messages
    if (action === "list") {
      const emailToken = searchParams.get("token"); 
      if (!emailToken) {
        return NextResponse.json({ error: "Missing authentication token" }, { status: 400 });
      }
      
      const response = await fetch(`https://api.internal.temp-mail.io/api/v3/email/${emailToken}/messages`, {
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Failed to fetch messages list.");
      
      const data = await response.json();
      const messagesList = Array.isArray(data) ? data : (data.messages || []);
      
      const mapped = messagesList.map((m: { id: string; from?: string; subject?: string; created_at?: string }) => ({
        id: m.id,
        from: m.from || "Unknown",
        subject: m.subject || "(No Subject)",
        date: m.created_at ? new Date(m.created_at).toLocaleString() : "Just now"
      }));

      return NextResponse.json({ messages: mapped });
    }

    // Read full message content
    if (action === "read") {
      const id = searchParams.get("id");
      const emailToken = searchParams.get("token");
      if (!id) {
        return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
      }
      if (!emailToken) {
        return NextResponse.json({ error: "Missing authentication token" }, { status: 400 });
      }

      const response = await fetch(`https://api.internal.temp-mail.io/api/v3/message/${id}`, {
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeoutId);
      
      let m;
      if (!response.ok) {
        // Fallback: Try to find the message from the list endpoint if single read fails
        const listRes = await fetch(`https://api.internal.temp-mail.io/api/v3/email/${emailToken}/messages`, { cache: "no-store" });
        if (listRes.ok) {
          const list = await listRes.json();
          m = list.find((msg: { id: string }) => msg.id === id || msg.id == id);
        }
        if (!m) throw new Error("Failed to retrieve mail content.");
      } else {
        m = await response.json();
      }
      
      return NextResponse.json({ 
        message: {
          id: id,
          from: m.from || "Unknown",
          subject: m.subject || "(No Subject)",
          date: m.created_at ? new Date(m.created_at).toLocaleString() : "Just now",
          body: m.body_html || m.body_text || "",
          textBody: m.body_text || "",
          htmlBody: m.body_html || m.body_text || ""
        } 
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("TempMail API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
