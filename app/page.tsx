import EstimationForm from '@/components/EstimationForm';
import Navigation from '@/components/Navigation';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 py-12">
        <EstimationForm />
        <Toaster />
      </main>
    </div>
  );
}