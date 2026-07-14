import type { UserSettings } from '@/types/models';

/** Estimate marketplace fees on resale price. */
export function estimateFees(
  resalePrice: number,
  feePercent: number,
  feeFixed: number,
): number {
  return round2((resalePrice * feePercent) / 100 + feeFixed);
}

/** Net profit after buy price, fees, and shipping in/out. */
export function estimateNetProfit(input: {
  buyPrice: number;
  estResale: number;
  feePercent: number;
  feeFixed: number;
  shippingIn: number;
  shippingOut: number;
}): { fees: number; netProfit: number; roiPercent: number } {
  const fees = estimateFees(input.estResale, input.feePercent, input.feeFixed);
  const netProfit = round2(
    input.estResale - input.buyPrice - fees - input.shippingIn - input.shippingOut,
  );
  const invested = input.buyPrice + input.shippingIn;
  const roiPercent = invested > 0 ? round2((netProfit / invested) * 100) : 0;
  return { fees, netProfit, roiPercent };
}

export function percentBelowMarket(buyPrice: number, fairValue: number): number {
  if (fairValue <= 0) return 0;
  return round2(((fairValue - buyPrice) / fairValue) * 100);
}

export function formatGbp(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: abs >= 100 ? 0 : 2,
  });
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatRoi(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${Math.round(value)}%`;
}

export function usesDefaultGates(
  settings: UserSettings,
  netProfit: number,
  roiPercent: number,
): boolean {
  return netProfit >= settings.minProfitGbp && roiPercent >= settings.minRoiPercent;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
