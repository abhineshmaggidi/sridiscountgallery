import { Product } from '@/types';

/**
 * Compare multiple products side by side
 */
export interface ComparisonData {
  products: Product[];
  commonSpecs: string[];
  differences: Array<{
    specName: string;
    values: string[];
  }>;
}

export function compareProducts(products: Product[]): ComparisonData {
  if (products.length < 2) {
    throw new Error('Need at least 2 products to compare');
  }

  // Find common spec keys
  const allSpecKeys = products.map(p => p.specSheet.map(([key]) => key));
  const commonSpecs = allSpecKeys[0].filter(key =>
    allSpecKeys.every(specs => specs.includes(key))
  );

  // Find differences
  const differences: Array<{ specName: string; values: string[] }> = [];
  
  commonSpecs.forEach(specName => {
    const values = products.map(product => {
      const spec = product.specSheet.find(([key]) => key === specName);
      return spec ? spec[1] : 'N/A';
    });

    // Only include if values are different
    if (new Set(values).size > 1) {
      differences.push({ specName, values });
    }
  });

  return {
    products,
    commonSpecs,
    differences
  };
}

/**
 * Get best value product based on price and rating
 */
export function getBestValue(products: Product[]): Product {
  return products.reduce((best, current) => {
    const bestScore = (best.rating / best.price) * 1000;
    const currentScore = (current.rating / current.price) * 1000;
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Calculate price difference percentage
 */
export function getPriceDifference(price1: number, price2: number): string {
  const diff = ((price1 - price2) / price2) * 100;
  return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
}
