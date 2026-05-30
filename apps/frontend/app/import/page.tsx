import { ImportScreen } from '@/components/screens/import-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function ImportPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <ImportScreen />
      <BottomNav />
    </main>
  );
}
