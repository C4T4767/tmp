'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  Heart,
  MessageSquareText,
  Package,
  Search,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SafetyBadge } from '@/components/safety-badge';
import { mockGroups, mockProductOffers, mockProducts } from '@/lib/mock-data';
import type { ProductOffer, SafetyStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  readFavoriteOffers,
  removeFavoriteOffer,
  saveFavoriteOffer,
} from '@/lib/favorite-storage';
import {
  getAlternativeProducts,
  getGeneralRecommendationSections,
  type RecommendedProduct,
} from '@/lib/product-recommendations';

interface ProductDetailScreenProps {
  productId: string;
}

const mockGroupIngredientRiskReasons: Record<
  string,
  Record<string, { memberName: string; condition: string; ingredientName: string; reason: string }>
> = {
  '1': {
    '1': {
      memberName: '김영희',
      condition: '임신',
      ingredientName: '비타민 A',
      reason: '임신 중에는 비타민 A 과다 섭취에 주의가 필요해 그룹원 확인이 필요합니다.',
    },
  },
  '2': {
    '4': {
      memberName: '김철수',
      condition: '고지혈증',
      ingredientName: '카페인',
      reason: '카페인은 심박과 혈압에 영향을 줄 수 있어 고지혈증 관리 중인 그룹원에게 주의가 필요합니다.',
    },
  },
};

const ingredientStatusConfig: Record<SafetyStatus, { label: string; className: string }> = {
  safe: { label: '안전', className: 'border-secondary bg-secondary/45 text-primary' },
  caution: { label: '주의 필요', className: 'border-warning/20 bg-warning/10 text-warning-foreground' },
  blocked: { label: '반입차단', className: 'border-destructive/20 bg-destructive/10 text-destructive' },
  'user-risk': {
    label: '내 정보 주의',
    className: 'border-destructive/15 bg-destructive/5 text-destructive',
  },
  'group-caution': {
    label: '그룹원 주의',
    className: 'border-warning/20 bg-warning/10 text-warning-foreground',
  },
};

const reviewTopicStyle = {
  positive: 'text-success',
  negative: 'text-destructive',
  other: 'text-muted-foreground',
};

const personalRiskReasons: Record<string, string> = {
  '1': '내 정보 기준으로 비타민 C 성분에 추가 확인이 필요합니다. 복용 중인 약이나 건강 정보와 함께 확인해 주세요.',
  '4': '내 온보딩 정보에 카페인 민감 항목이 있어 카페인 성분에 주의가 필요합니다.',
};

function formatWon(value: number) {
  return `${value.toLocaleString()}원`;
}

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(mockGroups[0]?.id ?? '');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [savedOfferStores, setSavedOfferStores] = useState<string[]>([]);
  const [expandedReviewOfferIds, setExpandedReviewOfferIds] = useState<string[]>([]);
  const [isSaveDrawerOpen, setIsSaveDrawerOpen] = useState(false);
  const [pendingSaveOffer, setPendingSaveOffer] = useState<ProductOffer | null>(null);
  const [selectedSaveGroupId, setSelectedSaveGroupId] = useState<string>(mockGroups[0]?.id ?? '');

  const product = mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
  const priceInfos = mockProductOffers
    .filter((offer) => offer.productId === product.id)
    .sort((a, b) => a.rank - b.rank);
  const alternativeProducts = getAlternativeProducts(product.id);
  const recommendationSections = getGeneralRecommendationSections(product.id);
  const selectedGroup = mockGroups.find((group) => group.id === selectedGroupId);
  const groupRiskReason = mockGroupIngredientRiskReasons[selectedGroupId]?.[product.id];

  const hasBlockedIngredient = product.ingredients.some((ingredient) => ingredient.status === 'blocked');
  const hasUserRisk = product.ingredients.some((ingredient) => ingredient.status === 'user-risk');
  const hasGroupCaution =
    Boolean(groupRiskReason) ||
    product.ingredients.some((ingredient) => ingredient.status === 'group-caution');
  const showPriceSection = !hasBlockedIngredient;
  const bestOffer = priceInfos[0];
  const isFavorite = savedOfferStores.length > 0;
  const favoriteStoreLabel =
    savedOfferStores.length === 1
      ? `${savedOfferStores[0]} 기준`
      : `${savedOfferStores.length}개 판매처 담김`;

  useEffect(() => {
    const favoriteOffers = readFavoriteOffers().filter((offer) => offer.productId === product.id);
    setSavedOfferStores(favoriteOffers.map((offer) => offer.store));
  }, [product.id]);

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFavoriteOffer(product.id);
      setSavedOfferStores([]);
      return;
    }

    if (!bestOffer) {
      return;
    }

    setPendingSaveOffer(bestOffer);
    setSelectedSaveGroupId(mockGroups[0]?.id ?? '');
    setIsSaveDrawerOpen(true);
  };

  const handleSaveOffer = (offer: ProductOffer) => {
    setPendingSaveOffer(offer);
    setSelectedSaveGroupId(mockGroups[0]?.id ?? '');
    setIsSaveDrawerOpen(true);
  };

  const handleConfirmSaveOffer = () => {
    if (!pendingSaveOffer) {
      return;
    }

    const nextFavoriteOffers = saveFavoriteOffer(product.id, pendingSaveOffer);
    setSavedOfferStores(
      nextFavoriteOffers
        .filter((favoriteOffer) => favoriteOffer.productId === product.id)
        .map((favoriteOffer) => favoriteOffer.store)
    );
    setIsSaveDrawerOpen(false);
    setPendingSaveOffer(null);
  };

  const handleReviewToggle = (offerId: string) => {
    setExpandedReviewOfferIds((currentOfferIds) =>
      currentOfferIds.includes(offerId)
        ? currentOfferIds.filter((currentOfferId) => currentOfferId !== offerId)
        : [...currentOfferIds, offerId]
    );
  };

  const renderRecommendedProduct = ({
    product: recommendedProduct,
    bestOffer,
    reason,
  }: RecommendedProduct) => {
    const totalPrice = bestOffer ? bestOffer.price + bestOffer.shipping : recommendedProduct.price;

    return (
      <Link
        key={recommendedProduct.id}
        href={`/product/${recommendedProduct.id}`}
        className="flex gap-3 rounded-lg border border-border bg-card p-3 active:bg-muted"
      >
        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 text-sm font-semibold text-foreground">
              {recommendedProduct.name}
            </span>
            <SafetyBadge status={recommendedProduct.status} className="flex-shrink-0" />
          </span>
          <span className="mt-2 block text-xs leading-5 text-muted-foreground">{reason}</span>
          <span className="mt-1 block text-sm font-semibold text-primary">
            배송비 포함 {formatWon(totalPrice)}
          </span>
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="bg-primary text-primary-foreground">
        <div className="flex h-11 items-center justify-between border-b border-white/15 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground active:bg-white/10"
            aria-label="이전 화면"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            href="/"
            className="inline-flex size-9 items-center justify-center rounded-full text-primary-foreground active:bg-white/10"
            aria-label="홈으로 이동"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <div className="px-5 pb-16 pt-5">
          <h1 className="max-w-[18rem] text-[1.62rem] font-bold leading-tight">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/72">{product.variantLabel}</p>
          <div className="mt-5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="inline-flex h-9 min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium text-primary-foreground active:bg-white/15"
            >
              <Heart
                className={cn('h-4 w-4 flex-shrink-0', isFavorite && 'fill-current')}
              />
              <span className="truncate">
                {isFavorite ? `관심품목 담김 · ${favoriteStoreLabel}` : '관심품목 담기'}
              </span>
            </button>
            <span className="inline-flex h-8 items-center rounded-full border border-white/15 px-3 text-[11px] text-primary-foreground/78">
              최저가 기준
            </span>
            <span className="inline-flex h-8 items-center rounded-full border border-white/15 px-3 text-[11px] text-primary-foreground/78">
              배송비 기준
            </span>
          </div>
        </div>
      </section>

      <div className="-mt-10 flex flex-col gap-7 px-5">
        <section className="rounded-xl bg-card p-4 shadow-lg shadow-primary/10">
          <p className="mb-3 text-xs text-muted-foreground">안전 확인 대상</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGroupDropdownOpen((isOpen) => !isOpen)}
              className="flex w-full items-center justify-between rounded-lg bg-background p-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Users className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-base font-semibold text-foreground">
                    {selectedGroup ? selectedGroup.name : '그룹 선택'}
                  </span>
                  {selectedGroup && (
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {selectedGroup.memberCount}명 기준으로 확인
                    </span>
                  )}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-foreground transition-transform',
                  isGroupDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isGroupDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {mockGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsGroupDropdownOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-3 text-left text-sm active:bg-muted',
                      selectedGroupId === group.id && 'bg-secondary/60'
                    )}
                  >
                    <span className="font-medium text-foreground">{group.name}</span>
                    <span className="text-xs text-muted-foreground">{group.memberCount}명</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">종합 위험 판단</h2>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-[2rem_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-primary">
                  <Check className="h-4 w-4" />
                </span>
                <span className="mt-2 h-12 border-l border-dashed border-muted-foreground/35" />
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <SafetyBadge status={hasBlockedIngredient ? 'blocked' : 'safe'} />
                <p className="mt-2 text-sm font-medium text-foreground">국내 반입차단 여부</p>
              </div>
            </div>

            <div className="grid grid-cols-[2rem_1fr] gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-7 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <span className="mt-2 h-12 border-l border-dashed border-muted-foreground/35" />
              </div>
              <div className="rounded-lg border border-warning/15 bg-warning/5 p-4">
                <SafetyBadge status={hasUserRisk ? 'user-risk' : 'safe'} />
                <p className="mt-2 text-sm font-medium text-foreground">내 정보 기준 위험</p>
              </div>
            </div>

            {selectedGroup && (
              <div className="grid grid-cols-[2rem_1fr] gap-3">
                <div className="flex justify-center">
                  <span className="flex size-7 items-center justify-center rounded-md bg-warning/15 text-warning-foreground">
                    <Users className="h-4 w-4" />
                  </span>
                </div>
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
                  <SafetyBadge status={hasGroupCaution ? 'group-caution' : 'safe'} />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedGroup.name} 기준 위험
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {(hasUserRisk || hasGroupCaution || hasBlockedIngredient) && (
          <section className="rounded-lg border border-warning/20 bg-warning/5 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-warning-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-6 text-foreground">
                  내 정보와 우리 가족 그룹원 정보 모두에서 주의가 필요합니다.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  내 정보 및 가족 그룹원의 섭취 정보와 건강 정보가 상세한 성분이 포함되어 있습니다.
                  섭취 전 전문가와 상담을 권장합니다.
                </p>
                {groupRiskReason && (
                  <div className="mt-4 rounded-lg bg-card p-3">
                    <p className="text-sm font-semibold leading-6 text-foreground">
                      {groupRiskReason.memberName}님은 {groupRiskReason.condition} 정보가 있어{' '}
                      {groupRiskReason.ingredientName} 성분에 주의가 필요합니다.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {groupRiskReason.reason}
                    </p>
                  </div>
                )}
                {hasUserRisk && (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {personalRiskReasons[product.id]}
                  </p>
                )}
                {hasBlockedIngredient && (
                  <p className="mt-3 text-xs font-semibold leading-5 text-destructive">
                    국내 반입차단 대상 성분이 포함되어 구매 링크를 제공하지 않습니다.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">성분 분석 결과</h2>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
              옆으로 보기
            </span>
          </div>
          <div className="-mx-5 mt-4 overflow-x-auto px-5">
            <div className="flex w-max gap-2 pb-2">
              {product.ingredients.map((ingredient) => {
                const config = ingredientStatusConfig[ingredient.status];

                return (
                  <div
                    key={`${ingredient.name}-${ingredient.amount}`}
                    className={cn(
                      'h-[8.75rem] w-[6.4rem] rounded-xl border p-3',
                      config.className
                    )}
                  >
                    <span className="inline-flex rounded-md bg-card/70 px-2 py-1 text-[11px] font-medium">
                      {config.label}
                    </span>
                    <p className="mt-4 text-sm font-semibold leading-5">{ingredient.name}</p>
                    {ingredient.amount && ingredient.unit && (
                      <p className="mt-1 text-sm opacity-75">
                        {ingredient.amount}
                        {ingredient.unit}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {showPriceSection && (
          <section>
            <h2 className="text-xl font-semibold text-foreground">가격 비교</h2>
            <div className="mt-4 divide-y divide-border rounded-xl bg-card">
              {priceInfos.map((price) => {
                const isSavedOffer = savedOfferStores.includes(price.store);
                const isReviewExpanded = expandedReviewOfferIds.includes(price.id);

                return (
                  <div key={price.id} className="p-4">
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-bold text-foreground">{price.store}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          배송비: {formatWon(price.shipping)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{formatWon(price.price)}</p>
                        <a
                          href={price.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center justify-end gap-1 text-xs font-medium text-primary"
                        >
                          이동하기
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      {price.reviewSummary && (
                        <button
                          type="button"
                          onClick={() => handleReviewToggle(price.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left text-xs text-muted-foreground"
                        >
                          <MessageSquareText className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            긍정 {price.reviewSummary.positive}% · 부정{' '}
                            {price.reviewSummary.negative}% · 기타 {price.reviewSummary.other}%
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 flex-shrink-0 transition-transform',
                              isReviewExpanded && 'rotate-180'
                            )}
                          />
                        </button>
                      )}
                      <Button
                        size="sm"
                        variant={isSavedOffer ? 'default' : 'outline'}
                        className="h-8 px-3 text-xs"
                        onClick={() => handleSaveOffer(price)}
                      >
                        {isSavedOffer ? (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        ) : (
                          <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                        )}
                        {isSavedOffer ? '담김' : '담기'}
                      </Button>
                    </div>

                    {price.reviewSummary && isReviewExpanded && (
                      <div className="mt-3 rounded-lg bg-muted p-3">
                        <p className="text-xs leading-5 text-muted-foreground">
                          {price.reviewSummary.summary}
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                          {price.reviewSummary.topics.map((topic) => (
                            <div key={`${price.id}-${topic.name}`}>
                              <p className={cn('text-xs font-semibold', reviewTopicStyle[topic.sentiment])}>
                                {topic.name}
                              </p>
                              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                {topic.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {hasBlockedIngredient && alternativeProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">대체상품 검색</h2>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {alternativeProducts.map(renderRecommendedProduct)}
            </div>
          </section>
        )}

        {!hasBlockedIngredient && recommendationSections.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground">이런 상품은 어떤가요</h2>
            <div className="mt-3 flex flex-col gap-5">
              {recommendationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <div className="mt-2 flex flex-col gap-3">
                    {section.items.map(renderRecommendedProduct)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Drawer open={isSaveDrawerOpen} onOpenChange={setIsSaveDrawerOpen}>
        <DrawerContent className="mx-auto max-w-[411px] rounded-t-xl bg-white px-5 pb-7 pt-2">
          <DrawerHeader className="px-0 pb-3 text-left">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/25" />
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-sm font-medium text-primary">
                어떤 그룹에 담을까요?
              </DrawerTitle>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="inline-flex size-7 items-center justify-center rounded-full text-primary/70 active:bg-muted"
                  aria-label="닫기"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </DrawerClose>
            </div>
            <DrawerDescription className="sr-only">
              관심품목을 저장할 그룹을 선택합니다.
            </DrawerDescription>
          </DrawerHeader>

          <div className="divide-y divide-border">
            {mockGroups.map((group) => {
              const isSelected = selectedSaveGroupId === group.id;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedSaveGroupId(group.id)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-4 items-center justify-center text-primary">
                      <Users className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate text-sm font-semibold text-primary">
                      {group.name} ({group.memberCount})
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-full border',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/35 bg-white'
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <span className="size-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              className="flex w-full items-center gap-3 py-4 text-left text-sm font-medium text-primary"
            >
              <span className="text-base leading-none">+</span>
              새 그룹 만들기
            </button>
          </div>

          <Button className="mt-5 h-12 w-full shadow-lg shadow-primary/20" onClick={handleConfirmSaveOffer}>
            지정하기
          </Button>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
