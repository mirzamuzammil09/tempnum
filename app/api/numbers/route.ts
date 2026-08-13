import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_NUMBERS = [
  { number: "2138285310", full_number: "+12138285310", country: "1", country_text: "USA" },
  { number: "7342800133", full_number: "+447342800133", country: "44", country_text: "Britain" },
  { number: "745701867", full_number: "+33745701867", country: "33", country_text: "France" },
  { number: "617107037", full_number: "+31617107037", country: "31", country_text: "Netherlands" },
  { number: "612548077", full_number: "+34612548077", country: "34", country_text: "Spain" },
  { number: "6975692675", full_number: "+306975692675", country: "30", country_text: "Greece" },
  { number: "3513912419", full_number: "+393513912419", country: "39", country_text: "Italy" },
  { number: "467766016", full_number: "+32467766016", country: "32", country_text: "Belgium" },
  { number: "760810391", full_number: "+46760810391", country: "46", country_text: "Sweden" },
  { number: "414822683", full_number: "+358414822683", country: "358", country_text: "Finland" },
  { number: "403838280", full_number: "+61403838280", country: "61", country_text: "Australia" },
  { number: "797550008", full_number: "+48797550008", country: "48", country_text: "Poland" },
  { number: "702503283", full_number: "+36702503283", country: "36", country_text: "Hungary" },
  { number: "26742876", full_number: "+37126742876", country: "371", country_text: "Latvia" },
  { number: "976079860", full_number: "+385976079860", country: "385", country_text: "Croatia" },
  { number: "704662850", full_number: "+420704662850", country: "420", country_text: "Czech" },
  { number: "940246302", full_number: "+421940246302", country: "421", country_text: "Slovakia" },
  { number: "67762048284", full_number: "+4367762048284", country: "43", country_text: "Austria" },
  { number: "882983329", full_number: "+359882983329", country: "359", country_text: "Bulgaria" }
];

async function fetchFromSource(url: string) {
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
    console.warn(`Fetch from ${url} failed:`, e);
    return null;
  }
}

export async function GET() {
  let rawData = await fetchFromSource("https://onlinesim.io/api/getFreePhoneList");
  if (!rawData || (!rawData.numbers && !Array.isArray(rawData))) {
    rawData = await fetchFromSource("https://onlinesim.ru/api/getFreePhoneList");
  }

  let numbersList: Array<{
    number?: string;
    phone?: string;
    full_number?: string;
    country?: string | number;
    country_text?: string;
    country_name?: string;
  }> = [];

  if (rawData) {
    if (Array.isArray(rawData.numbers)) {
      numbersList = rawData.numbers;
    } else if (rawData.numbers && Array.isArray(rawData.numbers.data)) {
      numbersList = rawData.numbers.data;
    } else if (Array.isArray(rawData)) {
      numbersList = rawData;
    }
  }

  let normalized = numbersList.map((n) => {
    const numStr = String(n.number || n.phone || "").replace(/\D/g, "");
    let fullStr = String(n.full_number || n.number || n.phone || "");
    if (!fullStr.startsWith("+") && numStr) {
      fullStr = "+" + numStr;
    }
    return {
      number: numStr,
      full_number: fullStr,
      country: String(n.country || ""),
      country_text: String(n.country_text || n.country_name || n.country || "Global")
    };
  }).filter(n => n.full_number.length >= 6);

  // If live endpoints returned no numbers or failed, load fallback set
  if (normalized.length === 0) {
    console.warn("Using fallback virtual numbers dataset");
    normalized = FALLBACK_NUMBERS;
  }

  return NextResponse.json({
    response: "1",
    numbers: normalized,
  });
}
