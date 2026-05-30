import { GroupCreateScreen } from '@/components/screens/group-create-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function GroupCreatePage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <GroupCreateScreen />
      <BottomNav />
    </main>
  );
}
