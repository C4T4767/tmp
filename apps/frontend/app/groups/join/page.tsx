import { GroupJoinScreen } from '@/components/screens/group-join-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function GroupJoinPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <GroupJoinScreen />
      <BottomNav />
    </main>
  );
}
