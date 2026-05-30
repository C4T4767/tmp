import { ProductDetailScreen } from '@/components/screens/product-detail-screen';
import { BottomNav } from '@/components/bottom-nav';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  return (
    <main className="mx-auto min-h-screen max-w-md bg-background">
      <ProductDetailScreen productId={id} />
      <BottomNav />
    </main>
  );
}
