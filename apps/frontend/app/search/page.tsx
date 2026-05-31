import { SearchScreen } from '@/components/screens/search-screen';
import { AppShell } from '@/components/app-shell';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <AppShell>
      <SearchScreen initialQuery={params.q ?? ''} />
    </AppShell>
  );
}
