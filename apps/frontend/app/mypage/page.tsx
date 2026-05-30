import { MyPageScreen } from '@/components/screens/mypage-screen';
import { BottomNav } from '@/components/bottom-nav';

export default function MyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <MyPageScreen />
      <BottomNav />
    </main>
  );
}
