'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Search, SortAsc, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockGroups, mockProductOffers, mockProducts } from '@/lib/mock-data';
import {
  readFavoriteOffers,
  removeFavoriteOffer,
  type FavoriteOffer,
} from '@/lib/favorite-storage';
import type { Product, ProductOffer, SafetyStatus } from '@/lib/types';

type SortType = 'name' | 'price';
type FavoriteView = 'all' | 'group';
type GroupView = 'favorites' | 'purchases';
type FavoritePriceInfo = Pick<ProductOffer, 'store' | 'price' | 'shipping' | 'url'>;

interface FavoriteListItem {
  id: string;
  product: Product;
  priceInfo?: FavoritePriceInfo;
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
  .map((offer) => ({
    productId: offer.productId,
    store: offer.store,
    price: offer.price,
    shipping: offer.shipping,
    url: offer.url,
    savedAt: '2026-05-30T00:00:00+09:00',
  }));

const mockGroupFavoriteProductIds: Record<string, string[]> = {
  '1': ['1', '3'],
  '2': ['2', '5'],
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
      },
    ];
  });

  const productItems: FavoriteListItem[] = products
    .filter((product) => !offeredProductIds.has(product.id))
    .map((product) => ({
      id: product.id,
      product,
      priceInfo: getBestProductOffer(product.id),
    }));

  return [...offerItems, ...productItems];
}

export function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>(mockProducts.slice(0, 3));
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
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [favoriteView, setFavoriteView] = useState<FavoriteView>('all');
  const [selectedGroupId, setSelectedGroupId] = useState(mockGroups[0]?.id ?? '');

  useEffect(() => {
    const nextFavoriteOffers = mergeFavoriteOffers(readFavoriteOffers());

    setFavoriteOffers(nextFavoriteOffers);
  }, []);

  const groupFavorites = mockProducts.filter((product) =>
    groupFavoriteProductIds[selectedGroupId]?.includes(product.id)
  );
  const visibleFavorites = favoriteView === 'all' ? favorites : groupFavorites;
  const visibleFavoriteItems = getFavoriteListItems(
    visibleFavorites,
    favoriteOffers,
    favoriteView === 'all'
  );
  const visiblePurchaseRecords =
    favoriteView === 'group'
      ? purchaseRecords
          .filter((purchaseRecord) => purchaseRecord.groupId === selectedGroupId)
          .sort((a, b) => {
            if (sortBy === 'name') {
              return a.product.name.localeCompare(b.product.name);
            }

            const totalPriceA = a.priceInfo.price + a.priceInfo.shipping;
            const totalPriceB = b.priceInfo.price + b.priceInfo.shipping;

            return totalPriceA - totalPriceB;
          })
      : [];

  const filteredFavorites = visibleFavoriteItems
    .filter((item) => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.product.name.localeCompare(b.product.name);
      const priceA = a.priceInfo?.price ?? a.product.price;
      const priceB = b.priceInfo?.price ?? b.product.price;

      return priceA - priceB;
    });

  const handleDelete = (productId: string, store?: string) => {
    if (favoriteView === 'group') {
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
      groupId: favoriteView === 'group' ? selectedGroupId : undefined,
    });
  };

  const handleConfirmPurchase = () => {
    if (!pendingPurchase) {
      return;
    }

    const nextPurchaseRecord: PurchaseRecord = {
      id: `purchase-${Date.now()}`,
      groupId: pendingPurchase.groupId ?? selectedGroupId,
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
    setGroupView('purchases');
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">관심 품목</h1>
        <Tabs
          value={favoriteView}
          onValueChange={(value) => {
            setFavoriteView(value as FavoriteView);
            if (value === 'all') {
              setGroupView('favorites');
            }
          }}
        >
          <TabsList className="h-8 rounded-md">
            <TabsTrigger value="all" className="px-3 text-xs">
              전체
            </TabsTrigger>
            <TabsTrigger value="group" className="px-3 text-xs">
              그룹별
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {favoriteView === 'group' && (
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="그룹 선택" />
          </SelectTrigger>
          <SelectContent>
            {mockGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="관심 품목에서 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'name' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('name')}
        >
          <SortAsc className="mr-1 h-4 w-4" />
          이름순
        </Button>
        <Button
          variant={sortBy === 'price' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('price')}
        >
          <SortAsc className="mr-1 h-4 w-4" />
          가격순
        </Button>
        {favoriteView === 'group' && (
          <Button
            variant={groupView === 'purchases' ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              setGroupView((currentGroupView) =>
                currentGroupView === 'purchases' ? 'favorites' : 'purchases'
              )
            }
          >
            <ShoppingBag className="mr-1 h-4 w-4" />
            구매내역
          </Button>
        )}
      </div>

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
      {favoriteView === 'group' && groupView === 'purchases' ? (
        <div className="flex flex-col gap-3">
          {visiblePurchaseRecords.map((purchaseRecord) => {
            const totalPrice = purchaseRecord.priceInfo.price + purchaseRecord.priceInfo.shipping;

            return (
              <div
                key={purchaseRecord.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {purchaseRecord.product.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {purchaseRecord.buyerName}님이 {purchaseRecord.priceInfo.store}에서 구매
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">
                        {totalPrice.toLocaleString()}원
                      </span>
                      <span>
                        {new Date(purchaseRecord.purchasedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
      ) : (
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
      )}

      {groupView !== 'purchases' && filteredFavorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">관심 품목이 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            {favoriteView === 'all'
              ? '상품 상세 페이지에서 하트를 눌러 추가해보세요.'
              : '선택한 그룹에 등록된 관심 품목이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
}
