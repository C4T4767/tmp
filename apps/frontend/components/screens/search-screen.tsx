'use client';

import { useState } from 'react';
import { Search, ArrowLeft, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockProductOffers, mockProducts } from '@/lib/mock-data';
import Link from 'next/link';
import type { Product } from '@/lib/types';

interface SearchScreenProps {
  initialQuery?: string;
}

function getProductOffers(productId: string) {
  return mockProductOffers
    .filter((offer) => offer.productId === productId)
    .sort((a, b) => a.price + a.shipping - (b.price + b.shipping));
}

function ProductComparisonRow({ product }: { product: Product }) {
  const offers = getProductOffers(product.id);
  const lowestOfferId = offers[0]?.id;

  return (
    <article className="border-b border-border py-4 last:border-b-0">
      <div className="flex gap-3">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border border-border bg-muted">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-sm font-bold leading-5 text-foreground">
            {product.name}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {offers.length}개 판매처 가격 비교
          </p>
        </div>

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
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export function SearchScreen({ initialQuery = '' }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState(
    initialQuery
      ? mockProducts.filter((p) =>
          p.name.toLowerCase().includes(initialQuery.toLowerCase())
        )
      : mockProducts
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = mockProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
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
          {results.map((product) => (
            <ProductComparisonRow key={product.id} product={product} />
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
