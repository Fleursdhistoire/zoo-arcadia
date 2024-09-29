import { Outlet } from '@remix-run/react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';

export default function VeterinarianLayout() {
  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}