'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  ExternalLink,
  AlertTriangle,
  Check,
  ChevronDown,
  Users,
  ShoppingBag,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafetyBadge } from '@/components/safety-badge';
import { mockProducts, mockProductOffers, mockGroups } from '@/lib/mock-data';
import Link from 'next/link';
import type { SafetyStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  readFavoriteOffers,
  removeFavoriteOffer,
  saveFavoriteOffer,
} from '@/lib/favorite-storage';

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
  safe: { label: '안전', className: 'bg-success/10 text-success border-success/20' },
  caution: { label: '주의', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
  blocked: { label: '반입차단', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'user-risk': { label: '내 정보 주의', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
  'group-caution': { label: '그룹원 주의', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
};

const reviewTopicStyle = {
  positive: 'border-success/20 bg-success/10 text-success',
  negative: 'border-destructive/20 bg-destructive/10 text-destructive',
  other: 'border-border bg-muted text-muted-foreground',
};

const personalRiskReasons: Record<string, string> = {
  '1': '내 온보딩 정보 기준으로 비타민 C 고함량 성분은 복용 중인 약이나 위장 민감도에 따라 주의가 필요합니다.',
  '4': '내 온보딩 정보에 카페인 민감 항목이 있어 카페인 성분에 주의가 필요합니다.',
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(mockGroups[0]?.id ?? '');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [savedOfferStores, setSavedOfferStores] = useState<string[]>([]);
  const [expandedReviewOfferIds, setExpandedReviewOfferIds] = useState<string[]>([]);
  
  const product = mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
  const priceInfos = mockProductOffers
    .filter((offer) => offer.productId === product.id)
    .sort((a, b) => a.rank - b.rank);
  const selectedGroup = mockGroups.find((g) => g.id === selectedGroupId);
  const groupRiskReason = mockGroupIngredientRiskReasons[selectedGroupId]?.[product.id];
  
  const hasBlockedIngredient = product.ingredients.some((i) => i.status === 'blocked');
  const hasUserRisk = product.ingredients.some((i) => i.status === 'user-risk');
  const hasGroupCaution =
    Boolean(groupRiskReason) || product.ingredients.some((i) => i.status === 'group-caution');
  
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

    const nextFavoriteOffers = saveFavoriteOffer(product.id, bestOffer);
    setSavedOfferStores(
      nextFavoriteOffers
        .filter((favoriteOffer) => favoriteOffer.productId === product.id)
        .map((favoriteOffer) => favoriteOffer.store)
    );
  };

  const handleSaveOffer = (offer: (typeof priceInfos)[number]) => {
    const nextFavoriteOffers = saveFavoriteOffer(product.id, offer);
    setSavedOfferStores(
      nextFavoriteOffers
        .filter((favoriteOffer) => favoriteOffer.productId === product.id)
        .map((favoriteOffer) => favoriteOffer.store)
    );
  };

  const handleReviewToggle = (offerId: string) => {
    setExpandedReviewOfferIds((currentOfferIds) =>
      currentOfferIds.includes(offerId)
        ? currentOfferIds.filter((currentOfferId) => currentOfferId !== offerId)
        : [...currentOfferIds, offerId]
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="ml-2 text-lg font-semibold text-foreground">상품 상세</h2>
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{product.name}</h1>
      </div>

      {/* Add to Favorites */}
      <Card>
        <CardContent className="p-4">
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border-2 p-4 transition-colors',
              isFavorite
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div className="flex items-center gap-3">
              <Heart
                className={cn(
                  'h-5 w-5',
                  isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="font-medium text-foreground">
                {isFavorite ? '관심품목에 담김' : '관심품목 담기'}
              </span>
              {isFavorite && (
                <span className="text-sm text-muted-foreground">
                  {favoriteStoreLabel}
                </span>
              )}
            </div>
            {isFavorite && <Check className="h-5 w-5 text-primary" />}
          </button>
        </CardContent>
      </Card>

      {/* Safety Check Target */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">안전 확인 대상</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border-2 border-primary bg-primary/5 p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedGroup ? selectedGroup.name : '그룹을 선택하세요'}
                  </p>
                  {selectedGroup && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {selectedGroup.memberCount}명 기준으로 확인
                    </p>
                  )}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isGroupDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {isGroupDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-card shadow-lg">
                {mockGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setIsGroupDropdownOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between p-3 text-left text-sm hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg',
                      selectedGroupId === group.id && 'bg-primary/5'
                    )}
                  >
                    <span className="text-foreground">{group.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {group.memberCount}명
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Risk Assessment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">종합 위험 판단</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {/* Import Ban Status */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">국내 반입차단 여부</span>
            <SafetyBadge status={hasBlockedIngredient ? 'blocked' : 'safe'} />
          </div>

          {/* My Info Risk */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-foreground">내 정보 기준 위험 여부</span>
            <SafetyBadge status={hasUserRisk ? 'user-risk' : 'safe'} />
          </div>

          {/* Group Risk */}
          {selectedGroup && (
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-foreground">
                {selectedGroup.name} 기준 위험 여부
              </span>
              <SafetyBadge status={hasGroupCaution ? 'group-caution' : 'safe'} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning Boxes */}
      {hasBlockedIngredient && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              국내 반입차단 대상 성분이 포함되어 있어 구매 링크를 제공하지 않습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {hasUserRisk && !hasGroupCaution && !hasBlockedIngredient && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning-foreground" />
            <p className="text-sm font-medium text-warning-foreground">
              사용자님의 건강 정보 기준 주의가 필요한 성분이 포함되어 있습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {hasUserRisk && hasGroupCaution && !hasBlockedIngredient && selectedGroup && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning-foreground" />
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-warning-foreground">
                  내 정보와 {selectedGroup.name} 그룹원 정보 모두에서 주의가 필요합니다.
                </p>
                <p className="mt-1 text-xs leading-5 text-warning-foreground/90">
                  {personalRiskReasons[product.id] ??
                    '사용자님의 건강 정보 기준 주의가 필요한 성분이 포함되어 있습니다.'}
                </p>
              </div>
              {groupRiskReason && (
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
                  <p className="text-sm font-medium text-warning-foreground">
                    {groupRiskReason.memberName}님은 {groupRiskReason.condition} 정보가 있어{' '}
                    {groupRiskReason.ingredientName} 성분에 주의가 필요합니다.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {groupRiskReason.reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasGroupCaution && !hasUserRisk && selectedGroup && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-warning-foreground">
                {selectedGroup.name} 그룹원 중 일부에게 주의가 필요한 성분이 포함되어 있습니다.
              </p>
              {groupRiskReason && (
                <p className="text-sm text-warning-foreground/90">
                  {groupRiskReason.memberName}님은 {groupRiskReason.condition} 정보가 있어
                  {' '}
                  {groupRiskReason.ingredientName} 성분에 주의가 필요합니다.
                </p>
              )}
              {groupRiskReason && (
                <p className="text-xs leading-5 text-muted-foreground">
                  {groupRiskReason.reason}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">성분 분석 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {product.ingredients.map((ingredient, idx) => {
              const config = ingredientStatusConfig[ingredient.status];
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    config.className
                  )}
                >
                  <span className="font-medium">
                    {ingredient.name}
                    {ingredient.amount && ingredient.unit && (
                      <span className="ml-2 text-sm font-normal opacity-75">
                        {ingredient.amount}
                        {ingredient.unit}
                      </span>
                    )}
                  </span>
                  <span className="text-sm">{config.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Price Comparison */}
      {showPriceSection && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">가격 비교</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {priceInfos.map((price) => {
                const isSavedOffer = savedOfferStores.includes(price.store);
                const isReviewExpanded = expandedReviewOfferIds.includes(price.id);

                return (
                  <div
                    key={price.id}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{price.store}</p>
                        <p className="text-sm text-muted-foreground">
                          배송비: {price.shipping.toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <p className="text-lg font-bold text-primary">
                          {price.price.toLocaleString()}원
                        </p>
                        <Button
                          size="sm"
                          variant={isSavedOffer ? 'default' : 'outline'}
                          onClick={() => handleSaveOffer(price)}
                        >
                          {isSavedOffer ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : (
                            <ShoppingBag className="mr-1 h-3 w-3" />
                          )}
                          {isSavedOffer ? '담김' : '담기'}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={price.url} target="_blank" rel="noopener noreferrer">
                            이동하기
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {price.reviewSummary && (
                      <div className="mt-3 border-t border-border pt-3">
                        <button
                          type="button"
                          onClick={() => handleReviewToggle(price.id)}
                          className="flex w-full flex-col gap-2 rounded-md px-1 py-1 text-left sm:flex-row sm:items-center sm:justify-between"
                        >
                          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                            <MessageSquareText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">댓글 반응</span>
                          </span>
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-xs font-semibold text-success">
                              긍정 {price.reviewSummary.positive}%
                            </span>
                            <span className="text-xs font-semibold text-destructive">
                              부정 {price.reviewSummary.negative}%
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              기타 {price.reviewSummary.other}%
                            </span>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                isReviewExpanded && 'rotate-180'
                              )}
                            />
                          </span>
                        </button>

                        {isReviewExpanded && (
                          <div className="mt-3 rounded-md bg-background p-3">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {price.reviewSummary.summary}
                            </p>
                            <div className="mt-3 flex flex-col gap-2">
                              {price.reviewSummary.topics.map((topic) => (
                                <div
                                  key={`${price.id}-${topic.name}`}
                                  className={cn(
                                    'rounded-md border px-2 py-2',
                                    reviewTopicStyle[topic.sentiment],
                                  )}
                                >
                                  <p className="text-xs font-semibold">{topic.name}</p>
                                  <p className="mt-1 text-xs leading-relaxed">{topic.summary}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
