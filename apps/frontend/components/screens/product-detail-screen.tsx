'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
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
  safe: { label: '안전', className: 'border-[#d8e4f2] bg-[#f5f9fd] text-primary' },
  caution: { label: '주의 필요', className: 'border-[#f2d8a8] bg-[#fff8ec] text-primary' },
  blocked: { label: '반입차단', className: 'border-[#f1b8b2] bg-[#fff1ef] text-[#b42318]' },
  'user-risk': {
    label: '내 정보 주의',
    className: 'border-[#f1b8b2] bg-[#fff1ef] text-[#b42318]',
  },
  'group-caution': {
    label: '그룹원 주의',
    className: 'border-[#f2d8a8] bg-[#fff8ec] text-primary',
  },
};

const reviewTopicStyle = {
  positive: 'border-[#ccefdc] bg-[#f1fbf5] text-[#12814d]',
  negative: 'border-[#f1b8b2] bg-[#fff1ef] text-[#b42318]',
  other: 'border-[#d8e4f2] bg-white text-primary',
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
        className="flex gap-3 rounded-[18px] bg-white p-3 shadow-[0_8px_24px_rgba(10,37,64,0.05)] active:bg-[#f8fbff]"
      >
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#f8fbff]">
          {recommendedProduct.imageUrl ? (
            <img
              src={recommendedProduct.imageUrl}
              alt={`${recommendedProduct.name} 상품 이미지`}
              className="h-full w-full object-contain p-2"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="line-clamp-2 text-sm font-semibold text-foreground">
              {recommendedProduct.name}
            </span>
            <SafetyBadge status={recommendedProduct.status} className="flex-shrink-0" />
          </span>
          <span className="mt-2 inline-flex rounded-full bg-[#f4f7fb] px-2 py-1 text-[0.7rem] font-medium text-primary/65">
            {reason}
          </span>
          <span className="mt-1 block text-sm font-semibold text-primary">
            배송비 포함 {formatWon(totalPrice)}
          </span>
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24">
      <section className="pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center text-primary/80 transition-colors active:text-primary"
            aria-label="이전 화면"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.9} />
          </button>
        </div>

        <div className="mt-5 rounded-[22px] bg-white p-4 shadow-[0_10px_28px_rgba(10,37,64,0.07)]">
          <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[20px] bg-[#f8fbff]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={`${product.name} 상품 이미지`}
                  className="h-full w-full object-contain p-2"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Package className="h-8 w-8 text-primary/35" />
              )}
            </div>
            <div className="min-w-0">
              <SafetyBadge status={product.status} className="mb-2" />
              <h1 className="line-clamp-3 text-[1.22rem] font-semibold leading-tight text-primary">
                {product.name}
              </h1>
              <p className="mt-2 text-[0.82rem] font-medium leading-5 text-muted-foreground">
                {product.variantLabel}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="inline-flex h-9 min-w-0 items-center gap-2 rounded-full border border-[#d9e3f2] bg-white px-3 text-[0.78rem] font-medium text-primary active:bg-[#f8fbff]"
            >
              <Heart
                className={cn('h-4 w-4 flex-shrink-0', isFavorite && 'fill-current')}
              />
              <span className="truncate">
                {isFavorite ? `관심품목 담김 · ${favoriteStoreLabel}` : '관심품목 담기'}
              </span>
            </button>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-6">
        <section className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
          <p className="mb-3 text-[0.78rem] font-medium text-muted-foreground">안전 확인 대상</p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGroupDropdownOpen((isOpen) => !isOpen)}
              className="flex w-full items-center justify-between rounded-[16px] bg-[#f8fbff] p-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-primary shadow-[0_6px_18px_rgba(10,37,64,0.05)]">
                  <Users className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[0.98rem] font-semibold text-primary">
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
          <div className="flex items-center justify-between">
            <h2 className="text-[1.08rem] font-semibold text-primary">안전 확인 결과</h2>
            <span className="text-[0.72rem] font-medium text-muted-foreground">3개 항목</span>
          </div>
          <div className="mt-3 divide-y divide-[#edf2f8] rounded-[20px] bg-white px-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]">
            <div className="flex items-center justify-between gap-3 py-4">
              <div>
                <SafetyBadge status={hasBlockedIngredient ? 'blocked' : 'safe'} />
                <p className="mt-2 text-[0.94rem] font-medium text-primary">국내 반입차단 여부</p>
              </div>
              <Check className="h-5 w-5 text-primary/35" />
            </div>

            <div className="flex items-center justify-between gap-3 py-4">
              <div>
                <SafetyBadge status={hasUserRisk ? 'user-risk' : 'safe'} />
                <p className="mt-2 text-[0.94rem] font-medium text-primary">내 정보 기준 위험</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-primary/35" />
            </div>

            {selectedGroup && (
              <div className="flex items-center justify-between gap-3 py-4">
                <div>
                  <SafetyBadge status={hasGroupCaution ? 'group-caution' : 'safe'} />
                  <p className="mt-2 text-[0.94rem] font-medium text-primary">
                    {selectedGroup.name} 기준 위험
                  </p>
                </div>
                <Users className="h-5 w-5 text-primary/35" />
              </div>
            )}
          </div>
        </section>

        {(hasUserRisk || hasGroupCaution || hasBlockedIngredient) && (
          <section className="rounded-[18px] bg-[#fff8ec] p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 text-warning-foreground" />
              <p className="text-[0.96rem] font-semibold text-primary">주의가 필요한 성분이 있어요</p>
            </div>
            <div className="mt-3 space-y-2">
              {groupRiskReason && (
                <div className="rounded-[14px] bg-white p-3">
                  <p className="text-[0.86rem] font-semibold leading-5 text-primary">
                    {groupRiskReason.memberName} · {groupRiskReason.condition}
                  </p>
                  <p className="mt-1 text-[0.78rem] font-medium leading-5 text-muted-foreground">
                    {groupRiskReason.ingredientName} 성분 확인이 필요해요.
                  </p>
                </div>
              )}
              {hasUserRisk && personalRiskReasons[product.id] && (
                <div className="rounded-[14px] bg-white p-3">
                  <p className="text-[0.86rem] font-semibold leading-5 text-primary">내 정보 기준</p>
                  <p className="mt-1 text-[0.78rem] font-medium leading-5 text-muted-foreground">
                    {personalRiskReasons[product.id]}
                  </p>
                </div>
              )}
              {hasBlockedIngredient && (
                <div className="rounded-[14px] bg-white p-3">
                  <p className="text-[0.86rem] font-semibold leading-5 text-destructive">
                    국내 반입차단 성분 포함
                  </p>
                  <p className="mt-1 text-[0.78rem] font-medium leading-5 text-muted-foreground">
                    구매 링크를 제공하지 않습니다.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-[1.08rem] font-semibold text-primary">성분 분석 결과</h2>
            <span className="text-[0.72rem] font-medium text-muted-foreground">
              {product.ingredients.length}개
            </span>
          </div>
          <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2.5">
              {product.ingredients.map((ingredient) => {
                const config = ingredientStatusConfig[ingredient.status];

                return (
                  <div
                    key={`${ingredient.name}-${ingredient.amount}`}
                    className={cn(
                      'min-h-[5.75rem] w-32 rounded-2xl border p-3 shadow-[0_6px_18px_rgba(10,37,64,0.035)]',
                      config.className
                    )}
                  >
                    <span className="inline-flex rounded-full bg-white/80 px-2 py-0.5 text-[0.66rem] font-medium shadow-[0_3px_8px_rgba(10,37,64,0.05)]">
                      {config.label}
                    </span>
                    <p className="mt-3 line-clamp-1 text-[0.92rem] font-semibold">
                      {ingredient.name}
                    </p>
                    {ingredient.amount && ingredient.unit && (
                      <p className="mt-1 text-[0.78rem] font-medium opacity-70">
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
            <div className="flex items-center justify-between">
              <h2 className="text-[1.08rem] font-semibold text-primary">가격 비교</h2>
              <span className="text-[0.72rem] font-medium text-muted-foreground">
                배송비 포함
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {priceInfos.map((price) => {
                const isSavedOffer = savedOfferStores.includes(price.store);
                const isReviewExpanded = expandedReviewOfferIds.includes(price.id);
                const totalPrice = price.price + price.shipping;

                return (
                  <div
                    key={price.id}
                    className="rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(10,37,64,0.05)]"
                  >
                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[1rem] font-semibold text-primary">{price.store}</p>
                          {price.rank === 1 && (
                            <span className="rounded-full bg-[#e8f8ef] px-2 py-0.5 text-[0.66rem] font-semibold text-[#12814d]">
                              최저
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[0.68rem] font-medium text-primary/62">
                            상품 {formatWon(price.price)}
                          </span>
                          <span className="rounded-full bg-[#f4f7fb] px-2 py-1 text-[0.68rem] font-medium text-primary/62">
                            배송 {formatWon(price.shipping)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[1.12rem] font-bold text-primary">
                          {formatWon(totalPrice)}
                        </p>
                        <a
                          href={price.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center justify-end gap-1 text-[0.74rem] font-semibold text-primary/70"
                        >
                          이동하기
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      {price.reviewSummary && (
                        <button
                          type="button"
                          onClick={() => handleReviewToggle(price.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#f8fbff] px-3 py-2 text-left text-[0.72rem] font-medium text-muted-foreground"
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
                      <button
                        type="button"
                        className={cn(
                          'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.76rem] font-semibold transition-transform active:scale-[0.96]',
                          isSavedOffer
                            ? 'bg-primary text-white'
                            : 'border border-[#d9e3f2] bg-white text-primary'
                        )}
                        onClick={() => handleSaveOffer(price)}
                      >
                        {isSavedOffer ? (
                          <Check className="mr-1 h-3.5 w-3.5" />
                        ) : (
                          <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                        )}
                        {isSavedOffer ? '담김' : '담기'}
                      </button>
                    </div>

                    {price.reviewSummary && isReviewExpanded && (
                      <div className="mt-3 rounded-[16px] border border-[#d8e4f2] bg-[#fbfdff] p-3.5">
                        <p className="text-[0.78rem] font-medium leading-5 text-primary/74">
                          {price.reviewSummary.summary}
                        </p>
                        <div className="mt-3 divide-y divide-[#e5edf7]">
                          {price.reviewSummary.topics.map((topic) => (
                            <div
                              key={`${price.id}-${topic.name}`}
                              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 py-2 first:pt-0 last:pb-0"
                            >
                              <span
                                className={cn(
                                  'inline-flex h-7 items-center justify-center rounded-full border px-2 text-[0.7rem] font-semibold',
                                  reviewTopicStyle[topic.sentiment]
                                )}
                              >
                                {topic.name}
                              </span>
                              <p className="text-[0.76rem] font-medium leading-5 text-primary/68">
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
              <h2 className="text-[1.08rem] font-semibold text-primary">대체상품 검색</h2>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {alternativeProducts.map(renderRecommendedProduct)}
            </div>
          </section>
        )}

        {!hasBlockedIngredient && recommendationSections.length > 0 && (
          <section>
            <h2 className="text-[1.08rem] font-semibold text-primary">유사 상품 추천</h2>
            <div className="mt-3 flex flex-col gap-4">
              {recommendationSections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 text-[0.8rem] font-medium text-muted-foreground">{section.title}</h3>
                  <div className="flex flex-col gap-3">
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
