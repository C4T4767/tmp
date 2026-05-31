'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, ArrowLeft, AlertTriangle, Package, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockProductOffers, mockProducts } from '@/lib/mock-data';
import type { Product, ProductOffer } from '@/lib/types';

interface SearchScreenProps {
  initialQuery?: string;
}

interface ProductSearchResult {
  product: Product;
  matchedIngredientName?: string;
}

type SortBasis = 'lowest' | 'shipping';
type SafetyBasis = 'illegal-clear' | 'caution-clear';

function getProductSearchResults(keyword: string): ProductSearchResult[] {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return mockProducts.map((product) => ({ product }));
  }

  return mockProducts.reduce<ProductSearchResult[]>((results, product) => {
    const isProductNameMatched = product.name.toLowerCase().includes(normalizedKeyword);
    const matchedIngredient = product.ingredients.find((ingredient) =>
      ingredient.name.toLowerCase().includes(normalizedKeyword)
    );

    if (!isProductNameMatched && !matchedIngredient) {
      return results;
    }

    results.push({
      product,
      ...(isProductNameMatched || !matchedIngredient
        ? {}
        : { matchedIngredientName: matchedIngredient.name }),
    });

    return results;
  }, []);
}

function getSortedOffers(productId: string, sortBasis: SortBasis) {
  return mockProductOffers
    .filter((offer) => offer.productId === productId)
    .sort((a, b) => {
      if (sortBasis === 'shipping') {
        return a.shipping - b.shipping || a.price - b.price;
      }

      return a.price + a.shipping - (b.price + b.shipping);
    });
}

function hasIllegalIngredient(product: Product) {
  return (
    product.status === 'blocked' ||
    product.ingredients.some((ingredient) => ingredient.status === 'blocked')
  );
}

function hasCautionIngredient(product: Product) {
  return product.ingredients.some((ingredient) => ingredient.status !== 'safe');
}

function filterBySafetyBasis(results: ProductSearchResult[], safetyBasis: SafetyBasis) {
  if (safetyBasis === 'caution-clear') {
    return results.filter(
      (result) => !hasIllegalIngredient(result.product) && !hasCautionIngredient(result.product)
    );
  }

  return results.filter((result) => !hasIllegalIngredient(result.product));
}

function SegmentToggle<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="grid h-10 grid-cols-2 rounded-xl border border-primary/25 bg-primary p-1 shadow-sm"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 text-[11px] font-bold transition-colors ${
              isSelected
                ? 'bg-primary-foreground text-primary shadow-sm'
                : 'text-primary-foreground/70'
            }`}
            aria-pressed={isSelected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function SafetyBadges({
  product,
  safetyBasis,
}: {
  product: Product;
  safetyBasis: SafetyBasis;
}) {
  const hasIllegal = hasIllegalIngredient(product);
  const hasCaution = hasCautionIngredient(product);

  if (hasIllegal) {
    return (
      <div className="flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-bold text-destructive">
          <AlertTriangle className="h-3 w-3" />
          불법성분 탐지
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
        <CheckCircle2 className="h-3 w-3" />
        불법성분 미탐지
      </span>
      {hasCaution ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-bold text-destructive">
          <AlertTriangle className="h-3 w-3" />
          주의 성분
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
          <CheckCircle2 className="h-3 w-3" />
          {safetyBasis === 'caution-clear' ? '주의성분 없음' : '주의 없음'}
        </span>
      )}
    </div>
  );
}

function ProductResultRow({
  result,
  offer,
  sortBasis,
  safetyBasis,
}: {
  result: ProductSearchResult;
  offer?: ProductOffer;
  sortBasis: SortBasis;
  safetyBasis: SafetyBasis;
}) {
  const { product, matchedIngredientName } = result;
  const totalPrice = offer ? offer.price + offer.shipping : product.price;

  return (
    <Link
      href={`/product/${product.id}`}
      className="block border-b border-border py-5 transition-colors last:border-b-0 hover:bg-muted/30"
    >
      <div className="grid grid-cols-[68px_1fr_auto] items-center gap-3">
        <div className="flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.name} 상품 이미지`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <Package className="h-7 w-7 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-[13px] font-bold leading-5 text-foreground">
            {product.name}
          </h2>
          <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted-foreground">
            {product.variantLabel}
          </p>
          {matchedIngredientName && (
            <p className="mt-1 text-[11px] font-bold text-primary">
              성분명 매칭: {matchedIngredientName}
            </p>
          )}
          {product.purposeTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.purposeTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2">
            <SafetyBadges product={product} safetyBasis={safetyBasis} />
          </div>
        </div>

        <div className="w-[82px] text-right">
          <p className="text-[17px] font-black leading-6 text-foreground">
            {totalPrice.toLocaleString()}원
          </p>
          <p className="mt-1 text-[10px] font-bold text-muted-foreground">
            {sortBasis === 'shipping' ? '배송 기준' : '최저 기준'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function SearchScreen({ initialQuery = '' }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductSearchResult[]>(
    getProductSearchResults(initialQuery)
  );
  const [sortBasis, setSortBasis] = useState<SortBasis>('shipping');
  const [safetyBasis, setSafetyBasis] = useState<SafetyBasis>('illegal-clear');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setResults(getProductSearchResults(searchQuery));
  };

  const filteredResults = filterBySafetyBasis(results, safetyBasis);
  const displayCount = searchQuery.trim() && filteredResults.length > 0 ? 120 : filteredResults.length;

  return (
    <div className="flex flex-col gap-5 p-5 pb-24">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">검색 결과</h1>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-7 w-7 -translate-y-1/2 text-foreground/75" />
          <Input
            type="text"
            placeholder="상품명 또는 성분명을 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[60px] rounded-xl border-border bg-muted/60 pl-14 text-lg font-medium shadow-none placeholder:text-muted-foreground"
          />
        </div>
      </form>

      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="pt-2 text-base font-medium text-foreground">
            {displayCount}개의 상품을 찾았습니다
          </p>
          <SegmentToggle
            value={sortBasis}
            options={[
              { value: 'lowest', label: '최저 기준' },
              { value: 'shipping', label: '배송 기준' },
            ]}
            onChange={setSortBasis}
            ariaLabel="검색 결과 정렬 기준"
          />
        </div>

        <div className="mb-2">
          <SegmentToggle
            value={safetyBasis}
            options={[
              { value: 'illegal-clear', label: '불법성분 미탐지' },
              { value: 'caution-clear', label: '주의성분 없음' },
            ]}
            onChange={setSafetyBasis}
            ariaLabel="안전 탐지 필터 기준"
          />
        </div>

        <div className="bg-background">
          {filteredResults.map((result) => (
            <ProductResultRow
              key={result.product.id}
              result={result}
              offer={getSortedOffers(result.product.id, sortBasis)[0]}
              sortBasis={sortBasis}
              safetyBasis={safetyBasis}
            />
          ))}
        </div>

        {filteredResults.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-bold text-foreground">조건에 맞는 상품이 없습니다.</p>
            <p className="mt-1 text-sm text-muted-foreground">다른 검색어 또는 탐지 기준을 선택해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
