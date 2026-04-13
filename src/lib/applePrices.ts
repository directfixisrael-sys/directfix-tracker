// Apple official repair prices in Israel (approximate, for comparison)
// Source: Apple support pricing pages
const applePrices: Record<string, Record<string, number>> = {
  'iPhone 16 Pro Max': { 'מסך': 1799, 'סוללה': 449, 'גב זכוכית': 1199, 'שקע טעינה': 799 },
  'iPhone 16 Pro': { 'מסך': 1599, 'סוללה': 449, 'גב זכוכית': 1099, 'שקע טעינה': 799 },
  'iPhone 16 Plus': { 'מסך': 1399, 'סוללה': 449, 'גב זכוכית': 899, 'שקע טעינה': 699 },
  'iPhone 16': { 'מסך': 1299, 'סוללה': 449, 'גב זכוכית': 799, 'שקע טעינה': 699 },
  'iPhone 15 Pro Max': { 'מסך': 1699, 'סוללה': 449, 'גב זכוכית': 1099, 'שקע טעינה': 799 },
  'iPhone 15 Pro': { 'מסך': 1499, 'סוללה': 449, 'גב זכוכית': 999, 'שקע טעינה': 799 },
  'iPhone 15 Plus': { 'מסך': 1299, 'סוללה': 449, 'גב זכוכית': 799, 'שקע טעינה': 699 },
  'iPhone 15': { 'מסך': 1199, 'סוללה': 449, 'גב זכוכית': 699, 'שקע טעינה': 699 },
  'iPhone 14 Pro Max': { 'מסך': 1599, 'סוללה': 419, 'גב זכוכית': 999, 'שקע טעינה': 699 },
  'iPhone 14 Pro': { 'מסך': 1399, 'סוללה': 419, 'גב זכוכית': 899, 'שקע טעינה': 699 },
  'iPhone 14 Plus': { 'מסך': 1199, 'סוללה': 419, 'גב זכוכית': 699, 'שקע טעינה': 599 },
  'iPhone 14': { 'מסך': 1099, 'סוללה': 419, 'גב זכוכית': 599, 'שקע טעינה': 599 },
  'iPhone 13 Pro Max': { 'מסך': 1399, 'סוללה': 389, 'גב זכוכית': 899, 'שקע טעינה': 599 },
  'iPhone 13 Pro': { 'מסך': 1199, 'סוללה': 389, 'גב זכוכית': 799, 'שקע טעינה': 599 },
  'iPhone 13': { 'מסך': 1099, 'סוללה': 389, 'גב זכוכית': 599, 'שקע טעינה': 499 },
  'iPhone 13 Mini': { 'מסך': 999, 'סוללה': 389, 'גב זכוכית': 499, 'שקע טעינה': 499 },
  'iPhone 12 Pro Max': { 'מסך': 1299, 'סוללה': 389, 'גב זכוכית': 799, 'שקע טעינה': 599 },
  'iPhone 12 Pro': { 'מסך': 1199, 'סוללה': 389, 'גב זכוכית': 699, 'שקע טעינה': 599 },
  'iPhone 12': { 'מסך': 1099, 'סוללה': 389, 'גב זכוכית': 599, 'שקע טעינה': 499 },
  'iPhone 12 Mini': { 'מסך': 999, 'סוללה': 389, 'גב זכוכית': 499, 'שקע טעינה': 499 },
  'iPhone 11 Pro Max': { 'מסך': 1199, 'סוללה': 359, 'גב זכוכית': 699, 'שקע טעינה': 499 },
  'iPhone 11 Pro': { 'מסך': 1099, 'סוללה': 359, 'גב זכוכית': 599, 'שקע טעינה': 499 },
  'iPhone 11': { 'מסך': 899, 'סוללה': 359, 'גב זכוכית': 499, 'שקע טעינה': 399 },
};

// Map repair type names to Apple pricing categories
const repairTypeMap: Record<string, string> = {
  'מסך מקורי': 'מסך',
  'מסך תואם': 'מסך',
  'החלפת מסך': 'מסך',
  'סוללה': 'סוללה',
  'החלפת סוללה': 'סוללה',
  'גב זכוכית': 'גב זכוכית',
  'החלפת גב': 'גב זכוכית',
  'שקע טעינה': 'שקע טעינה',
  'החלפת שקע טעינה': 'שקע טעינה',
};

export const getApplePrice = (modelName: string, repairTypeName: string): number | null => {
  // Try exact match first
  const modelPrices = applePrices[modelName];
  if (!modelPrices) return null;

  // Map our repair type to Apple category
  const category = repairTypeMap[repairTypeName];
  if (!category) {
    // Try partial match
    for (const key of Object.keys(repairTypeMap)) {
      if (repairTypeName.includes(key) || key.includes(repairTypeName)) {
        const mapped = repairTypeMap[key];
        return modelPrices[mapped] || null;
      }
    }
    return null;
  }

  return modelPrices[category] || null;
};

export const getSavingsPercent = (ourPrice: number, applePrice: number): number => {
  if (applePrice <= 0) return 0;
  return Math.round(((applePrice - ourPrice) / applePrice) * 100);
};
