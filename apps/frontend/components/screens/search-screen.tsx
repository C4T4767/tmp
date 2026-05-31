'use client';

import { useState } from 'react';
import { Search, ArrowLeft, AlertTriangle, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockProductOffers, mockProducts } from '@/lib/mock-data';
import Link from 'next/link';
import type { Product } from '@/lib/types';

interface SearchScreenProps {
  initialQuery?: string;
}

interface ProductSearchResult {
  product: Product;
  matchedIngredientName?: string;
}

function getProductOffers(productId: string) {
  return mockProductOffers
    .filter((offer) => offer.productId === productId)
    .sort((a, b) => a.price + a.shipping - (b.price + b.shipping));
}

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

function ProductComparisonRow({ result }: { result: ProductSearchResult }) {
  const { product, matchedIngredientName } = result;
  const offers = getProductOffers(product.id);
  const lowestOfferId = offers[0]?.id;
  const isBlockedProduct = product.status === 'blocked';

  return (
    <Link
      href={`/product/${product.id}`}
      className="block border-b border-border py-4 transition-colors last:border-b-0 hover:bg-muted/30"
    >
      <div className="flex gap-3">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-sm font-bold leading-5 text-foreground">
            {product.name}
          </h2>
          {matchedIngredientName && (
            <p className="mt-1 text-xs font-medium text-primary">
              성분명 매칭: {matchedIngredientName}
            </p>
          )}
          {product.purposeTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.purposeTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {isBlockedProduct ? (
          <div className="flex w-32 flex-shrink-0 items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-destructive">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold">금지품목</p>
              <p className="mt-0.5 text-[11px] leading-4">가격 제공 불가</p>
            </div>
          </div>
        ) : (
          <div className="flex w-32 flex-shrink-0 flex-col gap-2">
            {offers.slice(0, 3).map((offer) => {
              const isLowest = offer.id === lowestOfferId;
              const totalPrice = offer.price + offer.shipping;

              return (
                <div
                  key={offer.id}
                  className="rounded-md border border-border bg-background px-2 py-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[11px] font-medium text-muted-foreground">
                      {offer.store}
                    </span>
                    {isLowest && (
                      <span className="rounded-sm bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                        최저
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-primary">
                    <span className="text-sm font-bold">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                    배송비 포함
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

export function SearchScreen({ initialQuery = '' }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<ProductSearchResult[]>(
    getProductSearchResults(initialQuery)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(getProductSearchResults(searchQuery));
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">검색 결과</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="상품명을 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      {/* Results */}
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {results.length}개의 상품을 찾았습니다
        </p>
        <div className="rounded-lg border border-border bg-card px-3">
          {results.map((result) => (
            <ProductComparisonRow key={result.product.id} result={result} />
          ))}
        </div>
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            <p className="text-sm text-muted-foreground">다른 검색어를 입력해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}
