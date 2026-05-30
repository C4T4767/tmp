'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SafetyBadge } from '@/components/safety-badge';
import type { Product } from '@/lib/types';
import { Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export function ProductCard({ product, showDeleteButton, onDelete }: ProductCardProps) {
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
              <p className="mt-1 text-lg font-bold text-primary">
                {product.price.toLocaleString()}원
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <SafetyBadge status={product.status} />
              <div className="flex gap-2">
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
