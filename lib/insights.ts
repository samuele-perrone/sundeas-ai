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

export interface HoldingSignal {
  ticker: string;
  verdict: 'BUY' | 'SELL' | 'HOLD';
  rationale: string; // one short phrase, max 10 words
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
  holdingSignals: HoldingSignal[]; // per-holding educational signal
}

const DAILY_FOCUS: Record<number, { label: string; instruction: string }> = {
  0: {
    label: "Long-term perspective",
    instruction: `Zoom out to the long term. For marketContext, explain what long-term historical data says about the asset classes in this portfolio — average annual returns, drawdown recovery times, inflation-adjusted performance. For assessment, reflect on how this portfolio is positioned for a 10–20 year horizon. For recommendation, give one thought on how a long-term investor in this position might think about their next move. For suggestions, focus on assets that have historically complemented this type of portfolio over long periods.`,
  },
  1: {
    label: "Week ahead",
    instruction: `Focus on what's happening in markets this week. For marketContext, identify any notable economic data releases, central bank decisions, or earnings reports this week that are relevant to the sectors or asset classes in this portfolio. For assessment, explain how these events might affect the holdings. For recommendation, give one piece of educational context about how investors typically position around these kinds of events. For suggestions, focus on defensive or counter-cyclical assets relevant to the upcoming week.`,
  },
  2: {
    label: "Holding deep-dive",
    instruction: `Pick the largest holding and explain it in depth. For marketContext, describe what index or strategy this ETF tracks, which sectors dominate it, approximate ongoing charge (if known), and how it's performed in recent years. For assessment, explain what this one holding's dominance means for the portfolio's overall exposure — sectors, geographies, currencies. For recommendation, give one educational thought on concentration in a single fund. For suggestions, focus on what this holding lacks (e.g. missing sectors, geographies, or bond exposure).`,
  },
  3: {
    label: "Risk & concentration",
    instruction: `Focus entirely on risk. For marketContext, explain the main macro risks currently facing the sectors and geographies in this portfolio. For assessment, analyse concentration risk: how correlated are the holdings, what happens if UK equities drop 30%, and are there hidden overlaps between funds. For recommendation, give one educational thought on how investors historically manage concentration risk. For suggestions, focus on uncorrelated assets or strategies that have historically provided ballast in equity downturns.`,
  },
  4: {
    label: "Diversification gaps",
    instruction: `Focus on what's missing. For marketContext, briefly note how global equity markets (US, emerging markets, Asia) have performed relative to UK equities recently. For assessment, explain which asset classes, geographies, or sectors are entirely absent from this portfolio and what exposure that means the investor lacks. For recommendation, give one educational thought on why geographic diversification has historically mattered. For suggestions, be specific about the exact gaps (e.g. US equities, bonds, commodities, small-cap) and why each one is educationally worth understanding.`,
  },
  5: {
    label: "Weekly wrap",
    instruction: `Wrap up the week. For marketContext, summarise what happened in markets this week that is relevant to these holdings — any notable moves in UK equities, interest rate news, or sector rotation. For assessment, reflect on how the portfolio would have fared this week and why. For recommendation, give one educational thought about what to watch going into the weekend or next week. For suggestions, focus on any opportunities or risks that the week's events have highlighted for this type of portfolio.`,
  },
  6: {
    label: "Investing concepts",
    instruction: `Teach something useful. Pick one investing concept directly relevant to this portfolio — e.g. pound-cost averaging, rebalancing, the equity risk premium, home bias, or sequence-of-returns risk. For marketContext, introduce the concept and why it applies here. For assessment, explain how this portfolio illustrates or is affected by this concept. For recommendation, give one educational thought on how understanding this concept might change how the investor thinks about their portfolio. For suggestions, focus on tools or approaches related to this concept (e.g. if covering home bias, suggest global diversifiers).`,
  },
};

export async function generateDailyInsight(
  holdings: HoldingSummary[],
  totalValue: number,
  currency = "GBP",
  date?: string
): Promise<PortfolioInsight> {
  const today = date ? new Date(date) : new Date();
  const dayOfWeek = today.getDay();
  const focus = DAILY_FOCUS[dayOfWeek];
  const dateStr = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const holdingsList = holdings
    .map(
      (h) =>
        `- ${h.name} (${h.ticker}): ${h.allocationPct.toFixed(1)}% of portfolio` +
        `, P&L ${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(1)}%` +
        (h.targetWeight ? `, target ${h.targetWeight}%` : "")
    )
    .join("\n");

  const prompt = `You are an investment education assistant. Today is ${dateStr}.

Portfolio (total value: ${currency} ${totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}):
${holdingsList}

TODAY'S FOCUS: ${focus.label}
${focus.instruction}

Respond with a JSON object with exactly these six fields:
- "marketContext": 2-3 sentences — follow the focus instructions above.
- "assessment": 2-3 sentences — follow the focus instructions above.
- "recommendation": 1-2 sentences — follow the focus instructions above.
- "riskNote": 1 sentence on the single most relevant risk given today's focus angle.
- "suggestions": an array of 2-3 objects, each with "title" (ETF, asset class, or concept to explore) and "reason" (1-2 sentences — follow the focus instructions above).
- "holdingSignals": an array with one entry per holding in the portfolio, each with:
  - "ticker": the holding's ticker exactly as provided
  - "verdict": one of "BUY" (adding more may be worth considering given current conditions), "SELL" (reducing may be worth considering), or "HOLD" (maintain current position)
  - "rationale": one short phrase of max 10 words explaining the signal (e.g. "strong momentum, consider topping up" or "overweight relative to target")

Important: frame everything as educational information, not personal financial advice. Do not say "you should" — use "it may be worth considering", "historically", "educational context" or similar language. Be specific and concrete — avoid generic statements that would apply to any portfolio. Make the content genuinely different from a generic daily briefing.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude did not return valid JSON");

  const parsed = JSON.parse(jsonMatch[0]) as PortfolioInsight;
  if (!parsed.holdingSignals) parsed.holdingSignals = [];
  return parsed;
}

export async function saveInsight(portfolioId: string, insight: PortfolioInsight) {
  const admin = createAdminClient();
  await admin.from("insights").insert({
    portfolio_id: portfolioId,
    content: insight.recommendation,
    market_context: insight as unknown as Record<string, unknown>,
  });
}
