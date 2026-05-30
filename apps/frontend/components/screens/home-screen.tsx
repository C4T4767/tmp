'use client';

import { useState } from 'react';
import { Search, Link as LinkIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { mockProducts } from '@/lib/mock-data';
import Link from 'next/link';

export function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const recentProducts = mockProducts.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary">SafeBuy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          해외직구 상품, 구매 전에 성분 안전성을 확인하세요.
        </p>
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

      {/* Link Analysis Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <LinkIcon className="h-5 w-5 text-primary" />
            링크로 분석하기
          </CardTitle>
          <CardDescription>
            해외 쇼핑몰 상품 URL을 붙여넣어 성분을 분석할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button asChild variant="default" className="w-full">
            <Link href="/import">링크로 가져오기</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Products */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">최근 분석 상품</h2>
        <div className="flex flex-col gap-3">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
