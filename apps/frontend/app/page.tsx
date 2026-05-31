import { HomeScreen } from '@/components/screens/home-screen';
import { AppShell } from '@/components/app-shell';

export default function HomePage() {
  return (
    <AppShell>
      <HomeScreen />
    </AppShell>
  );
}
