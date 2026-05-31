import { ProductDetailScreen } from '@/components/screens/product-detail-screen';
import { AppShell } from '@/components/app-shell';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  
  return (
    <AppShell>
      <ProductDetailScreen productId={id} />
    </AppShell>
  );
}
