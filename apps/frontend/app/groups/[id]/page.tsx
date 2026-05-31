import { GroupDetailScreen } from '@/components/screens/group-detail-screen';
import { BottomNav } from '@/components/bottom-nav';

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;
  
  return (
    <main className="mx-auto min-h-screen max-w-[411px] bg-background">
      <GroupDetailScreen groupId={id} />
      <BottomNav />
    </main>
  );
}
