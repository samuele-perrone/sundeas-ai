import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface HoldingSummary {
  ticker: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
  allocationPct: number;
  pnlPct: number;
  targetWeight?: number | null;
}

export interface PortfolioInsight {
  marketContext: string;   // what's happening in markets relevant to holdings
  assessment: string;      // hold vs rebalance — plain English
  recommendation: string;  // single clear action or non-action
  riskNote: string;        // one sentence on concentration / risk
  suggestions: {           // where to consider investing / what to explore
    title: string;
    reason: string;
  }[];
}

export async function generateDailyInsight(
  holdings: HoldingSummary[],
  totalValue: number,
  currency = "GBP"
): Promise<PortfolioInsight> {
  const holdingsList = holdings
    .map(
      (h) =>
        `- ${h.name} (${h.ticker}): ${h.allocationPct.toFixed(1)}% of portfolio` +
        `, P&L ${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(1)}%` +
        (h.targetWeight ? `, target ${h.targetWeight}%` : "")
    )
    .join("\n");

  const prompt = `You are an investment education assistant. A user's portfolio has just been synced. Provide a short, plain-English daily briefing to help them understand their portfolio in the context of current market conditions.

Portfolio (total value: ${currency} ${totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}):
${holdingsList}

Respond with a JSON object with exactly these five fields:
- "marketContext": 2-3 sentences on current market trends relevant to these specific holdings (indices, sectors, or asset classes represented). Be specific to their tickers.
- "assessment": 2-3 sentences on whether their current allocation looks reasonable given market conditions, and whether any holding has drifted significantly from a sensible weighting.
- "recommendation": 1-2 sentences — a single clear, actionable educational suggestion (e.g. "Consider holding and continuing regular contributions" or "Your tech allocation has grown to X% — it may be worth reviewing your target weighting").
- "riskNote": 1 sentence on the main concentration or risk factor in this portfolio.
- "suggestions": an array of 2-3 objects, each with "title" (name of an ETF, asset class, or sector worth exploring) and "reason" (1-2 sentences explaining what gap in this portfolio it could address and why it's educationally relevant to consider — not a buy recommendation).

Important: frame everything as educational information, not personal financial advice. Do not say "you should" — use "it may be worth considering" or "historically" or similar educational language. For suggestions, focus on diversification gaps, missing asset classes, or geographic concentration. Be concise.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as PortfolioInsight;
}

export async function saveInsight(portfolioId: string, insight: PortfolioInsight) {
  const admin = createAdminClient();
  await admin.from("insights").insert({
    portfolio_id: portfolioId,
    content: insight.recommendation,
    market_context: insight as unknown as Record<string, unknown>,
  });
}
