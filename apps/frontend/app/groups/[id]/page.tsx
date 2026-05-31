import { GroupDetailScreen } from '@/components/screens/group-detail-screen';
import { AppShell } from '@/components/app-shell';

interface GroupDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = await params;
  
  return (
    <AppShell>
      <GroupDetailScreen groupId={id} />
    </AppShell>
  );
}
