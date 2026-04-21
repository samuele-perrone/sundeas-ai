const BASE = 'https://live.trading212.com/api/v0'

export interface T212Position {
  ticker: string
  quantity: number
  averagePrice: number
  currentPrice: number
  ppl: number
  fxPpl: number | null
  initialFillDate: string
  maxBuy: number
  maxSell: number
}

export interface T212Cash {
  free: number
  invested: number
  ppl: number
  result: number
  total: number
  pieCash: number
}

function authHeader(apiKey: string, apiSecret?: string): string {
  if (apiSecret) {
    return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
  }
  return apiKey
}

async function t212Fetch<T>(apiKey: string, path: string, retries = 3, apiSecret?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: authHeader(apiKey, apiSecret) },
    next: { revalidate: 0 },
  })
  if (res.status === 429 && retries > 0) {
    const retryAfter = Number(res.headers.get('retry-after') ?? 5)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return t212Fetch<T>(apiKey, path, retries - 1, apiSecret)
  }
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`T212 ${res.status}: ${text}`)
  }
  return res.json()
}

export function validateKey(apiKey: string, apiSecret?: string) {
  return t212Fetch<T212Position[]>(apiKey, '/equity/portfolio', 3, apiSecret)
}

export function getPortfolio(apiKey: string, apiSecret?: string) {
  return t212Fetch<T212Position[]>(apiKey, '/equity/portfolio', 3, apiSecret)
}

export function getCash(apiKey: string, apiSecret?: string) {
  return t212Fetch<T212Cash>(apiKey, '/equity/account/cash', 3, apiSecret)
}

/** "VWRP_EQ" → "VWRP", "AAPL_US_EQ" → "AAPL" */
export function tickerDisplay(ticker: string) {
  return ticker.split('_')[0]
}
