'use client';

import { useState } from 'react';
import { ArrowLeft, Heart, ExternalLink, AlertTriangle, Check, ChevronDown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SafetyBadge } from '@/components/safety-badge';
import { mockProducts, mockPriceInfos, mockReviewSummary, mockGroups } from '@/lib/mock-data';
import Link from 'next/link';
import type { SafetyStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProductDetailScreenProps {
  productId: string;
}

const ingredientStatusConfig: Record<SafetyStatus, { label: string; className: string }> = {
  safe: { label: '안전', className: 'bg-success/10 text-success border-success/20' },
  caution: { label: '주의', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
  blocked: { label: '반입차단', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'user-risk': { label: '내 정보 위험', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'group-caution': { label: '그룹원 주의', className: 'bg-warning/10 text-warning-foreground border-warning/20' },
};

export function ProductDetailScreen({ productId }: ProductDetailScreenProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<'me' | 'group'>('me');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  
  const product = mockProducts.find((p) => p.id === productId) ?? mockProducts[0];
  const selectedGroup = mockGroups.find((g) => g.id === selectedGroupId);
  
  const hasBlockedIngredient = product.ingredients.some((i) => i.status === 'blocked');
  const hasUserRisk = product.ingredients.some((i) => i.status === 'user-risk');
  const hasGroupCaution = product.ingredients.some((i) => i.status === 'group-caution');
  
  const showPriceSection = !hasBlockedIngredient && !hasUserRisk;

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
            onClick={() => setIsFavorite(!isFavorite)}
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
          {/* Me Option */}
          <button
            onClick={() => setSelectedTarget('me')}
            className={cn(
              'flex items-center gap-3 rounded-lg border-2 p-4 transition-colors text-left',
              selectedTarget === 'me'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2',
                selectedTarget === 'me' ? 'border-primary bg-primary' : 'border-muted-foreground'
              )}
            >
              {selectedTarget === 'me' && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span className="font-medium text-foreground">나</span>
          </button>

          {/* Group Option */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setSelectedTarget('group')}
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 p-4 transition-colors text-left',
                selectedTarget === 'group'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2',
                  selectedTarget === 'group' ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}
              >
                {selectedTarget === 'group' && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span className="font-medium text-foreground">그룹 선택</span>
            </button>

            {selectedTarget === 'group' && (
              <div className="relative ml-8">
                <button
                  onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {selectedGroup ? selectedGroup.name : '그룹을 선택하세요'}
                    </span>
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
          {selectedTarget === 'group' && selectedGroup && (
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

      {hasUserRisk && !hasBlockedIngredient && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm font-medium text-destructive">
              사용자님의 건강 정보 기준 주의가 필요한 성분이 포함되어 있어 구매 링크를 제공하지 않습니다.
            </p>
          </CardContent>
        </Card>
      )}

      {hasGroupCaution && selectedTarget === 'group' && selectedGroup && showPriceSection && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-warning-foreground" />
            <p className="text-sm font-medium text-warning-foreground">
              {selectedGroup.name} 그룹원 중 일부에게 주의가 필요한 성분이 포함되어 있습니다.
            </p>
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
                  <span className="font-medium">{ingredient.name}</span>
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
              {mockPriceInfos.map((price, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">{price.store}</p>
                    <p className="text-sm text-muted-foreground">
                      배송비: {price.shipping.toLocaleString()}원
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary">
                      {price.price.toLocaleString()}원
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <a href={price.url} target="_blank" rel="noopener noreferrer">
                        이동하기
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">댓글 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex gap-4">
            <div className="flex-1 rounded-lg bg-success/10 p-3 text-center">
              <p className="text-2xl font-bold text-success">{mockReviewSummary.positive}%</p>
              <p className="text-xs text-muted-foreground">긍정</p>
            </div>
            <div className="flex-1 rounded-lg bg-destructive/10 p-3 text-center">
              <p className="text-2xl font-bold text-destructive">{mockReviewSummary.negative}%</p>
              <p className="text-xs text-muted-foreground">부정</p>
            </div>
            <div className="flex-1 rounded-lg bg-muted p-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{mockReviewSummary.other}%</p>
              <p className="text-xs text-muted-foreground">기타</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{mockReviewSummary.summary}</p>
        </CardContent>
      </Card>
    </div>
  );
}
