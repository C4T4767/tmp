import { HomeScreen } from '@/components/screens/home-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <HomeScreen />
      <BottomNav />
    </main>
  );
}
