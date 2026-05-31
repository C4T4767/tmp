'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowUpDown,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Store,
  UserRound,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockGroups, mockProductOffers, mockProducts } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  readFavoriteOffers,
  removeFavoriteOffer,
  type FavoriteOffer,
} from '@/lib/favorite-storage';
import type { Product, ProductOffer, SafetyStatus } from '@/lib/types';

type SortType = 'latest' | 'price';
type FavoriteView = 'all' | 'group';
type GroupView = 'favorites' | 'purchases';
type FavoritePriceInfo = Pick<ProductOffer, 'store' | 'price' | 'shipping' | 'url'>;

const PERSONAL_COLLECTION_ID = 'personal';

interface FavoriteListItem {
  id: string;
  product: Product;
  priceInfo?: FavoritePriceInfo;
  savedAt?: string;
}

interface PurchaseRecord {
  id: string;
  groupId: string;
  buyerName: string;
  product: Product;
  priceInfo: FavoritePriceInfo;
  purchasedAt: string;
}

interface PendingPurchase {
  product: Product;
  priceInfo: FavoritePriceInfo;
  groupId?: string;
}

const mockFavoriteOffers: FavoriteOffer[] = mockProductOffers
  .filter((offer) => offer.productId === '1' && ['iHerb', 'Amazon'].includes(offer.store))
  .map((offer, index) => ({
    productId: offer.productId,
    store: offer.store,
    price: offer.price,
    shipping: offer.shipping,
    url: offer.url,
    savedAt: `2026-05-${String(30 - index).padStart(2, '0')}T00:00:00+09:00`,
  }));

const mockGroupFavoriteProductIds: Record<string, string[]> = {
  '1': ['1', '3', '4', '2'],
  '2': ['2', '5', '4', '3'],
};

const mockGroupRiskProductIds: Record<string, string[]> = {
  '1': ['1'],
  '2': ['5'],
};

function getFavoriteDisplayProduct(
  product: Product,
  favoriteView: FavoriteView,
  selectedGroupId: string
): Product {
  if (selectedGroupId === PERSONAL_COLLECTION_ID) {
    return product;
  }

  if (favoriteView !== 'group') {
    const status: SafetyStatus = product.status === 'blocked' ? 'blocked' : 'safe';
    return { ...product, status };
  }

  if (mockGroupRiskProductIds[selectedGroupId]?.includes(product.id)) {
    return { ...product, status: 'group-caution' };
  }

  const status: SafetyStatus = product.status === 'blocked' ? 'blocked' : 'safe';
  return { ...product, status };
}

function getBestProductOffer(productId: string): FavoritePriceInfo | undefined {
  return mockProductOffers
    .filter((offer) => offer.productId === productId)
    .sort((a, b) => a.rank - b.rank)[0];
}

function getFavoritePriceInfo(
  productId: string,
  favoriteOffers: FavoriteOffer[]
): FavoritePriceInfo | undefined {
  return (
    favoriteOffers.find((favoriteOffer) => favoriteOffer.productId === productId) ??
    getBestProductOffer(productId)
  );
}

function getFavoriteOfferKey(favoriteOffer: Pick<FavoriteOffer, 'productId' | 'store'>) {
  return `${favoriteOffer.productId}-${favoriteOffer.store}`;
}

function mergeFavoriteOffers(savedFavoriteOffers: FavoriteOffer[]): FavoriteOffer[] {
  const favoriteOfferKeys = new Set<string>();

  return [...savedFavoriteOffers, ...mockFavoriteOffers].filter((favoriteOffer) => {
    const favoriteOfferKey = getFavoriteOfferKey(favoriteOffer);

    if (favoriteOfferKeys.has(favoriteOfferKey)) {
      return false;
    }

    favoriteOfferKeys.add(favoriteOfferKey);
    return true;
  });
}

function getFavoriteListItems(
  products: Product[],
  favoriteOffers: FavoriteOffer[],
  includeAllOfferItems: boolean
): FavoriteListItem[] {
  const offeredProductIds = new Set(favoriteOffers.map((favoriteOffer) => favoriteOffer.productId));
  const visibleProductIds = new Set(products.map((product) => product.id));

  const offerItems = favoriteOffers.flatMap((favoriteOffer): FavoriteListItem[] => {
    const product = mockProducts.find((mockProduct) => mockProduct.id === favoriteOffer.productId);

    if (!product || (!includeAllOfferItems && !visibleProductIds.has(product.id))) {
      return [];
    }

    return [
      {
        id: getFavoriteOfferKey(favoriteOffer),
        product,
        priceInfo: favoriteOffer,
        savedAt: favoriteOffer.savedAt,
      },
    ];
  });

  const productItems: FavoriteListItem[] = products
    .filter((product) => !offeredProductIds.has(product.id))
    .map((product, index) => ({
      id: product.id,
      product,
      priceInfo: getBestProductOffer(product.id),
      savedAt: `2026-05-${String(29 - index).padStart(2, '0')}T00:00:00+09:00`,
    }));

  return [...offerItems, ...productItems];
}

function getFavoriteItemPrice(item: FavoriteListItem) {
  return (item.priceInfo?.price ?? item.product.price) + (item.priceInfo?.shipping ?? 0);
}

function getFavoriteItemSavedTime(item: FavoriteListItem) {
  return new Date(item.savedAt ?? '1970-01-01T00:00:00Z').getTime();
}

export function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>(mockProducts.slice(0, 4));
  const [favoriteOffers, setFavoriteOffers] = useState<FavoriteOffer[]>(mockFavoriteOffers);
  const [groupFavoriteProductIds, setGroupFavoriteProductIds] = useState(mockGroupFavoriteProductIds);
  const [groupView, setGroupView] = useState<GroupView>('favorites');
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([
    {
      id: 'purchase-1',
      groupId: '1',
      buyerName: '김영희',
      product: mockProducts[0],
      priceInfo: {
        store: 'iHerb',
        price: 25900,
        shipping: 4500,
        url: 'https://iherb.com',
      },
      purchasedAt: '2026-05-30T00:00:00+09:00',
    },
    {
      id: 'purchase-2',
      groupId: '1',
      buyerName: '홍길동',
      product: mockProducts[3],
      priceInfo: {
        store: 'iHerb',
        price: 18500,
        shipping: 4500,
        url: 'https://iherb.com',
      },
      purchasedAt: '2026-05-28T00:00:00+09:00',
    },
    {
      id: 'purchase-3',
      groupId: '1',
      buyerName: '김민준',
      product: mockProducts[1],
      priceInfo: {
        store: 'Amazon',
        price: 32500,
        shipping: 5000,
        url: 'https://amazon.com',
      },
      purchasedAt: '2026-05-24T00:00:00+09:00',
    },
    {
      id: 'purchase-4',
      groupId: '1',
      buyerName: '이서연',
      product: mockProducts[4],
      priceInfo: {
        store: 'Amazon',
        price: 45000,
        shipping: 5000,
        url: 'https://amazon.com',
      },
      purchasedAt: '2026-05-19T00:00:00+09:00',
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('latest');
  const [favoriteView, setFavoriteView] = useState<FavoriteView>('all');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  useEffect(() => {
    const nextFavoriteOffers = mergeFavoriteOffers(readFavoriteOffers());

    setFavoriteOffers(nextFavoriteOffers);
  }, []);

  const isPersonalCollection = selectedGroupId === PERSONAL_COLLECTION_ID;
  const isGroupCollectionList = favoriteView === 'group' && !selectedGroupId;
  const personalPurchaseCount = purchaseRecords.filter(
    (purchaseRecord) => purchaseRecord.groupId === PERSONAL_COLLECTION_ID
  ).length;
  const personalCollectionItemCount = getFavoriteListItems(
    favorites,
    favoriteOffers,
    true
  ).length;
  const favoriteCollections = [
    {
      id: PERSONAL_COLLECTION_ID,
      name: '나',
      subtitle: '나만 저장한 관심품목',
      products: favorites,
      itemCount: personalCollectionItemCount,
      purchaseCount: personalPurchaseCount,
    },
    ...mockGroups.map((group) => {
      const products = mockProducts.filter((product) =>
        groupFavoriteProductIds[group.id]?.includes(product.id)
      );
      const purchaseCount = purchaseRecords.filter(
        (purchaseRecord) => purchaseRecord.groupId === group.id
      ).length;

      return {
        id: group.id,
        name: group.name,
        subtitle: `${group.memberCount}명 · 온보딩 ${group.onboardedCount}명`,
        products,
        itemCount: products.length,
        purchaseCount,
      };
    }),
  ];
  const selectedCollection = favoriteCollections.find(
    (collection) => collection.id === selectedGroupId
  );
  const visibleFavoriteCollections = favoriteCollections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const groupFavorites = mockProducts.filter((product) =>
    groupFavoriteProductIds[selectedGroupId]?.includes(product.id)
  );
  const visibleFavorites =
    favoriteView === 'all' || isPersonalCollection ? favorites : groupFavorites;
  const visibleFavoriteItems = getFavoriteListItems(
    visibleFavorites,
    favoriteOffers,
    favoriteView === 'all' || isPersonalCollection
  );
  const visiblePurchaseRecords =
    favoriteView === 'group' && selectedGroupId
      ? purchaseRecords
          .filter((purchaseRecord) => purchaseRecord.groupId === selectedGroupId)
          .sort((a, b) => {
            if (sortBy === 'latest') {
              return (
                new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
              );
            }

            const totalPriceA = a.priceInfo.price + a.priceInfo.shipping;
            const totalPriceB = b.priceInfo.price + b.priceInfo.shipping;

            return totalPriceA - totalPriceB;
          })
      : [];

  const filteredFavorites = visibleFavoriteItems
    .filter((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return getFavoriteItemSavedTime(b) - getFavoriteItemSavedTime(a);
      }

      return getFavoriteItemPrice(a) - getFavoriteItemPrice(b);
    });
  const handleDelete = (productId: string, store?: string) => {
    if (favoriteView === 'group' && selectedGroupId !== PERSONAL_COLLECTION_ID) {
      setGroupFavoriteProductIds((currentGroupFavoriteProductIds) => ({
        ...currentGroupFavoriteProductIds,
        [selectedGroupId]: currentGroupFavoriteProductIds[selectedGroupId]?.filter(
          (favoriteProductId) => favoriteProductId !== productId
        ) ?? [],
      }));
      return;
    }

    if (store) {
      removeFavoriteOffer(productId, store);
      setFavoriteOffers((currentFavoriteOffers) => {
        const nextFavoriteOffers = currentFavoriteOffers.filter(
          (favoriteOffer) =>
            favoriteOffer.productId !== productId || favoriteOffer.store !== store
        );

        if (!nextFavoriteOffers.some((favoriteOffer) => favoriteOffer.productId === productId)) {
          setFavorites((currentFavorites) =>
            currentFavorites.filter((product) => product.id !== productId)
          );
        }

        return nextFavoriteOffers;
      });
      return;
    }

    removeFavoriteOffer(productId);
    setFavorites((currentFavorites) =>
      currentFavorites.filter((product) => product.id !== productId)
    );
  };

  const handleVisitStore = (
    product: Product,
    priceInfo?: FavoritePriceInfo
  ) => {
    if (!priceInfo) {
      return;
    }

    setPendingPurchase({
      product,
      priceInfo,
      groupId: favoriteView === 'group' && selectedGroupId ? selectedGroupId : undefined,
    });
  };

  const handleConfirmPurchase = () => {
    if (!pendingPurchase) {
      return;
    }

    const confirmedCollectionId = pendingPurchase.groupId ?? PERSONAL_COLLECTION_ID;
    const nextPurchaseRecord: PurchaseRecord = {
      id: `purchase-${Date.now()}`,
      groupId: confirmedCollectionId,
      buyerName: '홍길동',
      product: pendingPurchase.product,
      priceInfo: pendingPurchase.priceInfo,
      purchasedAt: new Date().toISOString(),
    };

    setPurchaseRecords((currentPurchaseRecords) => [
      nextPurchaseRecord,
      ...currentPurchaseRecords,
    ]);
    setPendingPurchase(null);
    setFavoriteView('group');
    setSelectedGroupId(confirmedCollectionId);
    setGroupView('purchases');
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <header className="space-y-1">
        <h1 className="text-[1.72rem] font-bold leading-tight text-primary">관심 상품</h1>
        <p className="text-[0.82rem] font-medium leading-5 text-muted-foreground">
          저장한 상품과 구매 기록을 한곳에서 확인해요.
        </p>
      </header>

      <div className="space-y-2">
        <Tabs
          value={favoriteView}
          onValueChange={(value) => {
            setFavoriteView(value as FavoriteView);
            setSearchQuery('');
            setIsSearchOpen(false);
            setIsSortMenuOpen(false);
            if (value === 'all') {
              setGroupView('favorites');
              setSelectedGroupId('');
              return;
            }

            setGroupView('favorites');
            setSelectedGroupId('');
          }}
          className="w-[224px]"
        >
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-full bg-[#dbeafa] p-1 shadow-[inset_0_1px_2px_rgba(10,37,64,0.06)]">
            <TabsTrigger
              value="all"
              className="rounded-full text-[0.86rem] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-[0_4px_12px_rgba(10,37,64,0.12)]"
            >
              전체
            </TabsTrigger>
            <TabsTrigger
              value="group"
              className="rounded-full text-[0.86rem] font-semibold data-[state=active]:bg-white data-[state=active]:shadow-[0_4px_12px_rgba(10,37,64,0.12)]"
            >
              그룹별
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="상품 검색"
              onClick={() => {
                setIsSearchOpen((currentIsSearchOpen) => !currentIsSearchOpen);
                setIsSortMenuOpen(false);
              }}
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors',
                isSearchOpen || searchQuery
                  ? 'bg-white shadow-[0_4px_12px_rgba(10,37,64,0.10)]'
                  : 'bg-transparent'
              )}
            >
              <Search className="h-5 w-5 stroke-[2.1]" />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="정렬"
                onClick={() => {
                  setIsSortMenuOpen((currentIsSortMenuOpen) => !currentIsSortMenuOpen);
                  setIsSearchOpen(false);
                }}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors',
                  isSortMenuOpen ? 'bg-white shadow-[0_4px_12px_rgba(10,37,64,0.10)]' : 'bg-transparent'
                )}
              >
                <ArrowUpDown className="h-5 w-5 stroke-[2.1]" />
              </button>
              {isSortMenuOpen && (
                <div className="absolute right-0 top-11 z-20 w-28 overflow-hidden rounded-2xl bg-white p-1 shadow-[0_14px_32px_rgba(10,37,64,0.16)]">
                  {[
                    { value: 'latest' as const, label: '최신순' },
                    { value: 'price' as const, label: '가격순' },
                  ].map((sortOption) => (
                    <button
                      key={sortOption.value}
                      type="button"
                      onClick={() => {
                        setSortBy(sortOption.value);
                        setIsSortMenuOpen(false);
                      }}
                      className={cn(
                        'h-9 w-full rounded-xl text-sm font-semibold transition-colors',
                        sortBy === sortOption.value
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:bg-secondary/70'
                      )}
                    >
                      {sortOption.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
        </div>

        {(isSearchOpen || searchQuery) && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="text"
              placeholder={isGroupCollectionList ? '컬렉션 검색' : '상품명 검색'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-full border-white/80 bg-white/90 pl-10 text-sm shadow-[0_6px_18px_rgba(10,37,64,0.08)]"
            />
          </div>
        )}
      </div>

      {isGroupCollectionList && (
        <section className="grid grid-cols-2 gap-x-4 gap-y-5">
          {visibleFavoriteCollections.map((collection) => {
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => {
                  setSelectedGroupId(collection.id);
                  setGroupView('favorites');
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="min-w-0 text-left transition-transform active:scale-[0.98]"
              >
                <div className="grid aspect-square grid-cols-2 gap-[3px] overflow-hidden rounded-[22px] bg-white p-[3px] shadow-[0_12px_28px_rgba(10,37,64,0.09)]">
                  {Array.from({ length: 4 }).map((_, index) => {
                    const product = collection.products[index];

                    return (
                      <div
                        key={`${collection.id}-${index}`}
                        className={cn(
                          'aspect-square min-h-0 min-w-0',
                          product?.imageUrl ? 'bg-white' : 'bg-[#eef3f8]'
                        )}
                      >
                        {product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-contain p-2.5"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-[linear-gradient(135deg,#f4f7fa_0%,#e8eef4_100%)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="px-1 pt-2">
                  <p className="line-clamp-1 text-[0.95rem] font-semibold text-primary">
                    {collection.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    관심 {collection.itemCount}개 · 구매 {collection.purchaseCount}건
                  </p>
                </div>
              </button>
            );
          })}
        </section>
      )}

      {favoriteView === 'group' && selectedCollection && (
        <section className="rounded-[22px] bg-white/80 p-3 shadow-[0_10px_24px_rgba(10,37,64,0.07)]">
          <button
            type="button"
            onClick={() => {
              setSelectedGroupId('');
              setGroupView('favorites');
              setSearchQuery('');
              setIsSearchOpen(false);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            컬렉션 목록
          </button>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold leading-tight text-primary">
                {selectedCollection.name}
              </h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {selectedCollection.subtitle}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
              구매 {visiblePurchaseRecords.length}건
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-[#dbeafa] p-1">
            {[
              { value: 'favorites' as const, label: '관심품목' },
              { value: 'purchases' as const, label: '구매내역' },
            ].map((viewOption) => (
              <button
                key={viewOption.value}
                type="button"
                onClick={() => setGroupView(viewOption.value)}
                className={cn(
                  'h-9 rounded-full text-sm font-semibold transition-colors',
                  groupView === viewOption.value
                    ? 'bg-white text-primary shadow-[0_4px_12px_rgba(10,37,64,0.12)]'
                    : 'text-primary/70'
                )}
              >
                {viewOption.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {pendingPurchase && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                방금 이 상품을 구매하셨나요?
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {pendingPurchase.priceInfo.store}에서 {pendingPurchase.product.name} 상품을 확인했습니다.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleConfirmPurchase}>
                  구매했어요
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPendingPurchase(null)}
                >
                  아니요
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Favorites List */}
      {!isGroupCollectionList && favoriteView === 'group' && groupView === 'purchases' ? (
        <div className="flex flex-col gap-3">
          {visiblePurchaseRecords.map((purchaseRecord) => {
            const totalPrice = purchaseRecord.priceInfo.price + purchaseRecord.priceInfo.shipping;
            const purchasedDate = new Date(purchaseRecord.purchasedAt).toLocaleDateString(
              'ko-KR',
              {
                month: 'short',
                day: 'numeric',
              }
            );

            return (
              <article
                key={purchaseRecord.id}
                className="overflow-hidden rounded-[18px] bg-white shadow-[0_12px_28px_rgba(10,37,64,0.08)]"
              >
                <div className="flex gap-3 p-3.5">
                  <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f5f9fd]">
                    {purchaseRecord.product.imageUrl ? (
                      <img
                        src={purchaseRecord.product.imageUrl}
                        alt={`${purchaseRecord.product.name} 상품 이미지`}
                        className="h-full w-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <ShoppingBag className="h-7 w-7 text-primary/45" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[0.95rem] font-semibold leading-snug text-foreground">
                          {purchaseRecord.product.name}
                        </p>
                        {purchaseRecord.product.variantLabel && (
                          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
                            {purchaseRecord.product.variantLabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p className="text-lg font-bold leading-none text-primary">
                        {totalPrice.toLocaleString()}원
                      </p>
                      <Link
                        href={`/product/${purchaseRecord.product.id}`}
                        className="inline-flex items-center gap-0.5 rounded-full bg-secondary px-2.5 py-1 text-[0.72rem] font-semibold text-primary"
                      >
                        상세
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-t border-[#edf2f7] bg-[#fbfdff] px-3.5 py-2.5 text-[0.72rem] font-medium text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1">
                    <Store className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{purchaseRecord.priceInfo.store}</span>
                  </span>
                  <span className="flex min-w-0 items-center justify-center gap-1">
                    <UserRound className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{purchaseRecord.buyerName}</span>
                  </span>
                  <span className="flex min-w-0 items-center justify-end gap-1">
                    <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
                    <span className="truncate">{purchasedDate}</span>
                  </span>
                </div>
              </article>
            );
          })}
          {visiblePurchaseRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">구매내역이 없습니다.</p>
              <p className="text-sm text-muted-foreground">
                판매처 바로가기 후 구매 여부를 기록해보세요.
              </p>
            </div>
          )}
        </div>
      ) : !isGroupCollectionList ? (
        <div className="flex flex-col gap-3">
          {filteredFavorites.map((favoriteItem) => {
            const displayProduct = getFavoriteDisplayProduct(
              favoriteItem.product,
              favoriteView,
              selectedGroupId
            );
            const priceInfo =
              favoriteItem.priceInfo ?? getFavoritePriceInfo(favoriteItem.product.id, favoriteOffers);

            return (
              <ProductCard
                key={favoriteItem.id}
                product={displayProduct}
                priceInfo={priceInfo}
                showDeleteButton
                onDelete={() => handleDelete(favoriteItem.product.id, priceInfo?.store)}
                onVisitStore={() => handleVisitStore(favoriteItem.product, priceInfo)}
              />
            );
          })}
        </div>
      ) : null}

      {isGroupCollectionList && visibleFavoriteCollections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">컬렉션이 없습니다.</p>
          <p className="text-sm text-muted-foreground">검색어를 다시 확인해보세요.</p>
        </div>
      )}

      {!isGroupCollectionList && groupView !== 'purchases' && filteredFavorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">관심 품목이 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            {favoriteView === 'all'
              ? '상품 상세 페이지에서 하트를 눌러 추가해보세요.'
              : '선택한 컬렉션에 등록된 관심 품목이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
