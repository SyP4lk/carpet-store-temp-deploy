import { NextResponse } from "next/server";
import { getDictionary } from "@/localization/dictionary";
import { Locale } from "@/localization/config";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS?.split(",").map((id) => id.trim()) || [];

export async function POST(req: Request) {
  try {
    const { name, phone, stock } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "❌ Missing params" },
        { status: 400 }
      );
    }

    const locale = (req.headers.get("x-locale") || "en") as Locale;
    const dict = await getDictionary(locale);

    const contactText = `
<b>${dict.cart.order.newOrder}</b>

👤 <b>${dict.cart.order.name}:</b> ${name}
📞 <b>${dict.cart.order.phone}:</b> ${phone}
${stock ? `\n📦 <b>${dict.cart.order.stock}:</b> ${stock}` : ""}
━━━━━━━━━━━━━━━
`;

    await Promise.all(
      CHAT_IDS.map((chatId) =>
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: contactText,
            parse_mode: "HTML",
          }),
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Send contact error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
