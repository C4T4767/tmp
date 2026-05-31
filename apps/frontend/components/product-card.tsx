'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SafetyBadge } from '@/components/safety-badge';
import type { Product } from '@/lib/types';
import { ArrowUpRight, ChevronRight, Heart, Package, Store } from 'lucide-react';

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
    <Card className="overflow-hidden rounded-[18px] border-white/80 bg-white shadow-[0_14px_32px_rgba(10,37,64,0.10)] transition-[box-shadow,transform] active:scale-[1.01] hover:shadow-[0_18px_40px_rgba(10,37,64,0.13)]">
      <CardContent className="relative p-4">
        {showDeleteButton && onDelete && (
          <button
            type="button"
            aria-label="관심 해제"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-[#ef4056] transition-transform active:scale-110"
          >
            <Heart className="h-6 w-6 fill-current stroke-current stroke-[2.2]" />
          </button>
        )}

        <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3">
          <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-xl bg-[#f5f9fd]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={`${product.name} 상품 이미지`}
                className="h-full w-full object-contain p-2"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Package className="h-8 w-8 text-primary/45" />
            )}
          </div>

          <div className="min-w-0 pr-8">
            <Link href={`/product/${product.id}`} className="block">
              <h3 className="line-clamp-2 text-[1rem] font-semibold leading-snug text-foreground">
                {product.name}
              </h3>
            </Link>

            {product.variantLabel && (
              <p className="mt-1 line-clamp-1 text-[0.82rem] font-medium text-muted-foreground">
                {product.variantLabel}
              </p>
            )}

            {product.purposeTags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {product.purposeTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/10 bg-primary/[0.04] px-1.5 py-0.5 text-[0.64rem] font-medium text-primary/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-2">
              <p className="text-[1.22rem] font-bold leading-tight text-primary">
                {displayPrice.toLocaleString()}원
              </p>
              <SafetyBadge
                status={product.status}
                className="rounded-md px-1.5 py-0 text-[0.62rem] font-semibold"
              />
            </div>

            {priceInfo && (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.76rem] text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <Store className="h-3 w-3" />
                  {priceInfo.store}
                </span>
                <span>배송비 {priceInfo.shipping.toLocaleString()}원</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          {priceInfo && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="h-8 rounded-full border-primary/80 bg-white text-[0.88rem] font-semibold shadow-none hover:bg-secondary"
            >
              <a
                href={priceInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onVisitStore}
              >
                구매하기
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="h-8 rounded-full px-2.5 text-[0.72rem] font-semibold shadow-none"
          >
            <Link href={`/product/${product.id}`}>
              상세보기
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
