import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { db } from '~/utils/db.server';

interface Service {
  id: number;
  name: string;
  description: string;
}

export const loader: LoaderFunction = async () => {
  const services = await db.service.findMany();
  return json({ services });
};

export default function Services() {
  const { services } = useLoaderData<{ services: Service[] }>();

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Nos Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-green-700 mb-3">{service.name}</h2>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}