import { FavoritesScreen } from '@/components/screens/favorites-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function FavoritesPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[411px] bg-background">
      <FavoritesScreen />
      <BottomNav />
    </main>
  );
}
