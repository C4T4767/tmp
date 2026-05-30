import type { ProductOffer } from './types';

export const FAVORITE_OFFERS_STORAGE_KEY = 'safe-buy.favorite-offers';

export interface FavoriteOffer {
  productId: string;
  store: string;
  price: number;
  shipping: number;
  url: string;
  savedAt: string;
}

export function readFavoriteOffers(): FavoriteOffer[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(FAVORITE_OFFERS_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isFavoriteOffer);
  } catch {
    return [];
  }
}

export function saveFavoriteOffer(productId: string, offer: ProductOffer): FavoriteOffer[] {
  const nextFavoriteOffer: FavoriteOffer = {
    productId,
    store: offer.store,
    price: offer.price,
    shipping: offer.shipping,
    url: offer.url,
    savedAt: new Date().toISOString(),
  };

  const nextFavoriteOffers = [
    nextFavoriteOffer,
    ...readFavoriteOffers().filter(
      (favoriteOffer) =>
        favoriteOffer.productId !== productId || favoriteOffer.store !== offer.store
    ),
  ];

  writeFavoriteOffers(nextFavoriteOffers);

  return nextFavoriteOffers;
}

export function removeFavoriteOffer(productId: string, store?: string): FavoriteOffer[] {
  const nextFavoriteOffers = readFavoriteOffers().filter((favoriteOffer) => {
    if (favoriteOffer.productId !== productId) {
      return true;
    }

    return store ? favoriteOffer.store !== store : false;
  });

  writeFavoriteOffers(nextFavoriteOffers);

  return nextFavoriteOffers;
}

function writeFavoriteOffers(favoriteOffers: FavoriteOffer[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FAVORITE_OFFERS_STORAGE_KEY, JSON.stringify(favoriteOffers));
}

function isFavoriteOffer(value: unknown): value is FavoriteOffer {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const favoriteOffer = value as FavoriteOffer;

  return (
    typeof favoriteOffer.productId === 'string' &&
    typeof favoriteOffer.store === 'string' &&
    typeof favoriteOffer.price === 'number' &&
    typeof favoriteOffer.shipping === 'number' &&
    typeof favoriteOffer.url === 'string' &&
    typeof favoriteOffer.savedAt === 'string'
  );
}
