import { mockProductOffers, mockProducts } from './mock-data';
import type { Product, ProductOffer } from './types';

export interface RecommendedProduct {
  product: Product;
  sharedPurposeTags: string[];
  bestOffer?: ProductOffer;
  reason: string;
}

export interface RecommendationSection {
  title: string;
  items: RecommendedProduct[];
}

const mockViewedTogetherProductIds: Record<string, string[]> = {
  '1': ['2', '5'],
  '2': ['1', '4'],
  '4': ['1', '2'],
  '5': ['1', '2'],
};

export function getBestOffer(productId: string) {
  return mockProductOffers
    .filter((offer) => offer.productId === productId)
    .sort((a, b) => a.price + a.shipping - (b.price + b.shipping))[0];
}

export function getAlternativeProducts(productId: string, limit = 3): RecommendedProduct[] {
  return getSimilarPurposeProducts(productId, limit);
}

export function getGeneralRecommendationSections(productId: string): RecommendationSection[] {
  const similarPurposeProducts = getSimilarPurposeProducts(productId, 2);
  const similarProductIds = new Set(similarPurposeProducts.map((item) => item.product.id));
  const viewedTogetherProducts = getViewedTogetherProducts(productId, similarProductIds, 2);

  return [
    {
      title: '유사 상품',
      items: similarPurposeProducts,
    },
    {
      title: '함께 본 상품',
      items: viewedTogetherProducts,
    },
  ].filter((section) => section.items.length > 0);
}

function getSimilarPurposeProducts(productId: string, limit: number): RecommendedProduct[] {
  const currentProduct = mockProducts.find((product) => product.id === productId);

  if (!currentProduct) {
    return [];
  }

  const currentIngredientNames = new Set(
    currentProduct.ingredients.map((ingredient) => ingredient.name)
  );

  return mockProducts
    .filter((product) => product.id !== currentProduct.id && product.status !== 'blocked')
    .map((product) => {
      const sharedPurposeTags = product.purposeTags.filter((tag) =>
        currentProduct.purposeTags.includes(tag)
      );
      const sharedIngredientCount = product.ingredients.filter((ingredient) =>
        currentIngredientNames.has(ingredient.name)
      ).length;
      const bestOffer = getBestOffer(product.id);
      const safetyScore = product.status === 'safe' ? 2 : 1;
      const score = sharedPurposeTags.length * 10 + sharedIngredientCount * 3 + safetyScore;

      return {
        product,
        sharedPurposeTags,
        sharedIngredientCount,
        bestOffer,
        score,
      };
    })
    .filter(
      (candidate) =>
        candidate.sharedPurposeTags.length > 0 || candidate.sharedIngredientCount > 0
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const totalPriceA = a.bestOffer ? a.bestOffer.price + a.bestOffer.shipping : a.product.price;
      const totalPriceB = b.bestOffer ? b.bestOffer.price + b.bestOffer.shipping : b.product.price;

      return totalPriceA - totalPriceB;
    })
    .slice(0, limit)
    .map(({ product, sharedPurposeTags, bestOffer, sharedIngredientCount }) => ({
      product,
      sharedPurposeTags,
      bestOffer,
      reason:
        sharedPurposeTags.length > 0
          ? sharedPurposeTags.join(', ')
          : sharedIngredientCount > 0
            ? '비슷한 성분 구성'
            : '함께 비교하기 좋은 상품',
    }));
}

function getViewedTogetherProducts(
  productId: string,
  excludedProductIds: Set<string>,
  limit: number
): RecommendedProduct[] {
  const recommendedIds = mockViewedTogetherProductIds[productId] ?? [];

  return recommendedIds
    .map((recommendedId) => mockProducts.find((product) => product.id === recommendedId))
    .filter((product): product is Product =>
      Boolean(product && product.status !== 'blocked' && !excludedProductIds.has(product.id))
    )
    .slice(0, limit)
    .map((product) => ({
      product,
      sharedPurposeTags: [],
      bestOffer: getBestOffer(product.id),
      reason: '최근 사용자 조회 활동 기반',
    }));
}
