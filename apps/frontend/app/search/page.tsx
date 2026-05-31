import { SearchScreen } from '@/components/screens/search-screen';
import { BottomNav } from '@/components/bottom-nav';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <main className="mx-auto min-h-screen max-w-[411px] bg-background">
      <SearchScreen initialQuery={params.q ?? ''} />
      <BottomNav />
    </main>
  );
}
