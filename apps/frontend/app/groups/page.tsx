import { GroupsScreen } from '@/components/screens/groups-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function GroupsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[411px] bg-background">
      <GroupsScreen />
      <BottomNav />
    </main>
  );
}
