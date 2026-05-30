'use client';

import { useState } from 'react';
import { ArrowLeft, Link2, Clipboard, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function ImportScreen() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ name: string; status: string } | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setResult({
      name: 'Nature Made Super B-Complex',
      status: '분석 완료',
    });
    setIsAnalyzing(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {
      console.log('[v0] Clipboard access denied');
    }
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
        <h1 className="text-lg font-semibold">상품 링크로 분석하기</h1>
      </div>

      {/* Description */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-5 w-5 text-primary" />
            URL로 상품 분석
          </CardTitle>
          <CardDescription>
            해외 쇼핑몰 상품 URL을 붙여넣으면 상품명과 성분 정보를 분석합니다.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* URL Input */}
      <div className="flex flex-col gap-3">
        <Input
          type="url"
          placeholder="상품 URL을 붙여넣으세요"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                분석 중...
              </>
            ) : (
              '분석하기'
            )}
          </Button>
          <Button variant="outline" onClick={handlePasteFromClipboard}>
            <Clipboard className="mr-2 h-4 w-4" />
            클립보드에서 가져오기
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-success" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{result.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.status}</p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/product/1">상세페이지 보기</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
