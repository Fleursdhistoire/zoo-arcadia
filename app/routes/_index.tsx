import { useState } from 'react';
import { Form, useActionData, useNavigation, useLoaderData } from '@remix-run/react';
import { json, ActionFunction, LoaderFunction } from '@remix-run/node';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import ReviewCard from '~/components/ReviewCard';
import { db } from '~/utils/db.server';

interface Review {
  id: number;
  name: string;
  comment: string;
  isVisible: boolean;
}

export const loader: LoaderFunction = async () => {
  const reviews = await db.review.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
  return json({ reviews });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const comment = formData.get('comment');

  if (typeof name !== 'string' || typeof comment !== 'string') {
    return json({ error: 'Invalid form data' }, { status: 400 });
  }

  await db.review.create({
    data: {
      name,
      comment,
      isVisible: false, // New reviews are not visible by default
    },
  });

  return json({ success: true });
};

export default function HomePage() {
  const { reviews: initialReviews } = useLoaderData<{ reviews: Review[] }>();
  const [reviews] = useState<Review[]>(initialReviews);
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigation = useNavigation();

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Bienvenue au Zoo Arcadia</h1>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">À propos de notre zoo</h2>
          <div className="flex flex-col md:flex-row items-center">
            <img src="/images/zoo-entrance.webp" alt="Entrée du Zoo Arcadia" className="w-full md:w-1/2 rounded-lg mb-4 md:mr-4" />
            <p className="text-gray-700">
              Le Zoo Arcadia, situé près de la forêt de Brocéliande en Bretagne, est un havre de paix pour les animaux depuis 1960. 
              Notre mission est de préserver la faune tout en offrant une expérience éducative et divertissante à nos visiteurs.
              Nous sommes fiers d&apos;être un zoo écologique, entièrement indépendant au niveau énergétique.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Nos habitats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Savane</h3>
              <img src="/images/savane.webp" alt="Habitat de la savane" className="w-full h-48 object-cover rounded mb-2" />
              <p>Découvrez nos lions, girafes et zèbres dans leur habitat naturel.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Jungle</h3>
              <img src="/images/jungle.webp" alt="Habitat de la jungle" className="w-full h-48 object-cover rounded mb-2" />
              <p>Explorez notre jungle luxuriante, domicile des singes et des perroquets.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Marais</h3>
              <img src="/images/marais.webp" alt="Habitat du marais" className="w-full h-48 object-cover rounded mb-2" />
              <p>Observez nos crocodiles et flamants roses dans leur environnement marécageux.</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Nos services</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Visites guidées des habitats (gratuit)</li>
            <li>Visite du zoo en petit train</li>
            <li>Restauration sur place</li>
            <li>Boutique de souvenirs</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-4">Avis de nos visiteurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} name={review.name} comment={review.comment} />
            ))}
          </div>
          
          <h3 className="text-xl font-semibold text-green-700 mb-4">Laissez votre avis</h3>
          <Form method="post" className="max-w-md">
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Votre nom</label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 font-bold mb-2">Votre commentaire</label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
              disabled={navigation.state === 'submitting'}
            >
              {navigation.state === 'submitting' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </Form>
          {actionData?.error && (
            <p className="text-red-500 mt-2">{actionData.error}</p>
          )}
          {actionData?.success && (
            <p className="text-green-500 mt-2">Merci pour votre avis ! Il sera visible après validation.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
