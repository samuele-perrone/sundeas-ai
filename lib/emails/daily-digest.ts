import type { HoldingSummary, PortfolioInsight } from "@/lib/insights";

export function dailyDigestEmail({
  portfolioName,
  totalValue,
  totalPnl,
  holdings,
  insight,
  appUrl,
  date,
}: {
  portfolioName: string;
  totalValue: number;
  totalPnl: number;
  holdings: HoldingSummary[];
  insight: PortfolioInsight;
  appUrl: string;
  date: string;
}) {
  const pnlSign = totalPnl >= 0 ? "+" : "";
  const pnlColour = totalPnl >= 0 ? "#059669" : "#dc2626";

  const holdingRows = holdings
    .map((h) => {
      const pnlColour = h.pnlPct >= 0 ? "#059669" : "#dc2626";
      return `
      <tr style="border-bottom:1px solid #fde4cc;">
        <td style="padding:10px 0;font-size:13px;color:#1c0f08;font-weight:600;">${h.name}</td>
        <td style="padding:10px 0;font-size:13px;color:#9a6e58;text-align:right;">${h.allocationPct.toFixed(1)}%</td>
        <td style="padding:10px 0;font-size:13px;color:${pnlColour};text-align:right;">${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(1)}%</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fef8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef8f4;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:28px;">
          <span style="font-size:20px;font-weight:700;color:#1c0f08;">
            Sundeas<span style="color:#e8611a;">.</span>AI
          </span>
          <span style="font-size:13px;color:#9a6e58;margin-left:10px;">${date}</span>
        </td></tr>

        <!-- Portfolio summary card -->
        <tr><td style="background:#fff;border:1px solid #fde4cc;border-radius:16px;padding:28px 28px 20px;">

          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9a6e58;text-transform:uppercase;letter-spacing:.06em;">
            ${portfolioName}
          </p>
          <p style="margin:0 0 20px;font-size:28px;font-weight:700;color:#1c0f08;line-height:1.1;">
            £${totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span style="font-size:15px;font-weight:500;color:${pnlColour};margin-left:8px;">
              ${pnlSign}£${Math.abs(totalPnl).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} all-time
            </span>
          </p>

          <!-- Holdings table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #fde4cc;">
            <tr>
              <th style="padding:8px 0;font-size:11px;color:#9a6e58;text-align:left;font-weight:600;">Holding</th>
              <th style="padding:8px 0;font-size:11px;color:#9a6e58;text-align:right;font-weight:600;">Allocation</th>
              <th style="padding:8px 0;font-size:11px;color:#9a6e58;text-align:right;font-weight:600;">P&amp;L</th>
            </tr>
            ${holdingRows}
          </table>
        </td></tr>

        <!-- Spacer -->
        <tr><td style="height:16px;"></td></tr>

        <!-- Market context -->
        <tr><td style="background:#fff;border:1px solid #fde4cc;border-radius:16px;padding:24px 28px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#e8611a;text-transform:uppercase;letter-spacing:.08em;">Market context</p>
          <p style="margin:0;font-size:14px;line-height:1.65;color:#1c0f08;">${insight.marketContext}</p>
        </td></tr>

        <!-- Spacer -->
        <tr><td style="height:12px;"></td></tr>

        <!-- Assessment -->
        <tr><td style="background:#fff;border:1px solid #fde4cc;border-radius:16px;padding:24px 28px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#e8611a;text-transform:uppercase;letter-spacing:.08em;">Portfolio assessment</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#1c0f08;">${insight.assessment}</p>
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#e8611a;text-transform:uppercase;letter-spacing:.08em;">Today's suggestion</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.65;color:#1c0f08;">${insight.recommendation}</p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#9a6e58;border-top:1px solid #fde4cc;padding-top:14px;">
            <strong style="color:#1c0f08;">Risk note:</strong> ${insight.riskNote}
          </p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding-top:24px;text-align:center;">
          <a href="${appUrl}/portfolio"
            style="display:inline-block;background:#e8611a;color:#fff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:999px;">
            View full portfolio →
          </a>
        </td></tr>

        <!-- Disclaimer -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="font-size:11px;color:#9a6e58;margin:0;line-height:1.6;">
            This is not financial advice. Past performance is not a guarantee of future results.<br>
            Sundeas AI provides educational information only.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
