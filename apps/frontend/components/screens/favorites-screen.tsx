'use client';

import { useState } from 'react';
import { Search, SortAsc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';

type SortType = 'name' | 'price';

export function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Product[]>(mockProducts.slice(0, 3));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');

  const filteredFavorites = favorites
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return a.price - b.price;
    });

  const handleDelete = (productId: string) => {
    setFavorites(favorites.filter((p) => p.id !== productId));
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <h1 className="text-xl font-bold text-foreground">관심 품목</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="관심 품목에서 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort Buttons */}
      <div className="flex gap-2">
        <Button
          variant={sortBy === 'name' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('name')}
        >
          <SortAsc className="mr-1 h-4 w-4" />
          이름순
        </Button>
        <Button
          variant={sortBy === 'price' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('price')}
        >
          <SortAsc className="mr-1 h-4 w-4" />
          가격순
        </Button>
      </div>

      {/* Favorites List */}
      <div className="flex flex-col gap-3">
        {filteredFavorites.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showDeleteButton
            onDelete={() => handleDelete(product.id)}
          />
        ))}
      </div>

      {filteredFavorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">관심 품목이 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            상품 상세 페이지에서 하트를 눌러 추가해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
