export interface PricePromotion {
  id: string;
  repair_type_id: string | null;
  model_id: string | null;
  promo_price: number | null;
  discount_percent: number | null;
  badge_text: string;
  info_text: string;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

/** Is the promotion currently within its active window? */
export const isPromoLive = (promo: PricePromotion, now: Date = new Date()): boolean => {
  if (!promo.is_active) return false;
  const today = now.toISOString().split('T')[0];
  if (promo.starts_at && today < promo.starts_at) return false;
  if (promo.ends_at && today > promo.ends_at) return false;
  return true;
};

/** Find the most specific live promotion for a repair type + model. */
export const findPromo = (
  promos: PricePromotion[],
  repairTypeId?: string | null,
  modelId?: string | null,
  now: Date = new Date()
): PricePromotion | null => {
  if (!repairTypeId) return null;
  const relevant = promos.filter(
    p =>
      isPromoLive(p, now) &&
      p.repair_type_id === repairTypeId &&
      (!p.model_id || p.model_id === modelId)
  );
  if (relevant.length === 0) return null;
  // Model-specific promotion wins over an all-models one
  return relevant.sort((a, b) => (b.model_id ? 1 : 0) - (a.model_id ? 1 : 0))[0];
};

/** Apply a promotion to a base price. */
export const applyPromo = (basePrice: number, promo: PricePromotion | null): number => {
  if (!promo || basePrice <= 0) return basePrice;
  if (promo.discount_percent && promo.discount_percent > 0) {
    return Math.max(0, Math.round(basePrice * (1 - promo.discount_percent / 100)));
  }
  if (promo.promo_price != null && promo.promo_price > 0) {
    return Math.round(promo.promo_price);
  }
  return basePrice;
};

/** Days left until the promotion ends (null when open-ended). */
export const promoDaysLeft = (promo: PricePromotion, now: Date = new Date()): number | null => {
  if (!promo.ends_at) return null;
  const end = new Date(`${promo.ends_at}T23:59:59`);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};
