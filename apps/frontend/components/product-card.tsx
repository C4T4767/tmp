'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SafetyBadge } from '@/components/safety-badge';
import type { Product } from '@/lib/types';
import { ExternalLink, Package, Store } from 'lucide-react';

interface ProductCardPriceInfo {
  store: string;
  price: number;
  shipping: number;
  url: string;
}

interface ProductCardProps {
  product: Product;
  priceInfo?: ProductCardPriceInfo;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  onVisitStore?: () => void;
}

export function ProductCard({
  product,
  priceInfo,
  showDeleteButton,
  onDelete,
  onVisitStore,
}: ProductCardProps) {
  const displayPrice = priceInfo?.price ?? product.price;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>
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
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-primary">
                  {displayPrice.toLocaleString()}원
                </p>
                <SafetyBadge status={product.status} />
              </div>
              {priceInfo && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Store className="h-3 w-3" />
                    {priceInfo.store}
                  </span>
                  <span>배송비 {priceInfo.shipping.toLocaleString()}원</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-end">
              <div className="flex flex-wrap justify-end gap-2">
                {priceInfo && (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={priceInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onVisitStore}
                    >
                      구매하기
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                )}
                {showDeleteButton && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete();
                    }}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    삭제
                  </Button>
                )}
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/product/${product.id}`}>상세보기</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
