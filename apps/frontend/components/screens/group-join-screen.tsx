'use client';

import { useState } from 'react';
import { ArrowLeft, Search, Users, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface SearchResult {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
}

export function GroupJoinScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSearchResults([
      { id: '3', name: '건강 관리 모임', leaderName: '이영희', memberCount: 12 },
      { id: '4', name: '영양제 연구회', leaderName: '박지성', memberCount: 25 },
    ]);
    setIsSearching(false);
  };

  const handleJoin = async (groupId: string) => {
    setIsJoining(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setJoinedId(groupId);
    setIsJoining(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/groups">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">그룹 참가</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="그룹명 또는 초대코드를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : '검색'}
        </Button>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            {searchResults.length}개의 그룹을 찾았습니다
          </p>
          {searchResults.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-4">
                {joinedId === group.id ? (
                  <div className="flex items-center gap-3 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">가입 신청이 완료되었습니다.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          그룹장: {group.leaderName} · {group.memberCount}명
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoin(group.id)}
                      disabled={isJoining}
                    >
                      {isJoining ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '가입 신청'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          <p className="text-sm text-muted-foreground">
            다른 그룹명이나 초대코드를 입력해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
