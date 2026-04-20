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

async function t212Fetch<T>(apiKey: string, path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: apiKey },
    next: { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`T212 ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

export function validateKey(apiKey: string) {
  return t212Fetch<T212Cash>(apiKey, '/equity/account/cash')
}

export function getPortfolio(apiKey: string) {
  return t212Fetch<T212Position[]>(apiKey, '/equity/portfolio')
}

export function getCash(apiKey: string) {
  return t212Fetch<T212Cash>(apiKey, '/equity/account/cash')
}

/** "VWRP_EQ" → "VWRP", "AAPL_US_EQ" → "AAPL" */
export function tickerDisplay(ticker: string) {
  return ticker.split('_')[0]
}
