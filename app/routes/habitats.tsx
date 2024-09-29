import { useState } from 'react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { db } from '~/utils/db.server';

interface Animal {
  id: number;
  name: string;
  species: string;
  image: string;
  status: string;
}

interface Habitat {
  id: number;
  name: string;
  description: string;
  image: string;
  animals: Animal[];
}

export const loader: LoaderFunction = async () => {
  const habitats = await db.habitat.findMany({
    include: {
      animals: {
        include: {
          animalViews: true
        }
      }
    }
  });
  return json({ habitats });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const animalId = formData.get('animalId');

  if (typeof animalId !== 'string') {
    return json({ error: 'Invalid animal ID' }, { status: 400 });
  }

  await db.animalView.upsert({
    where: { animalId: parseInt(animalId) },
    update: { viewCount: { increment: 1 } },
    create: { animalId: parseInt(animalId), viewCount: 1 },
  });

  return json({ success: true });
};

export default function Habitats() {
  const { habitats } = useLoaderData<{ habitats: Habitat[] }>();
  const [selectedHabitat, setSelectedHabitat] = useState<Habitat | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const submit = useSubmit();

  const handleAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    const formData = new FormData();
    formData.append('animalId', animal.id.toString());
    submit(formData, { method: 'post' });
  };

  return (
    <div className="bg-green-50 min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-green-800 mb-6">Nos Habitats</h1>
        {!selectedHabitat ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitats.map((habitat) => (
              <button
                key={habitat.id}
                className="bg-white rounded-lg shadow-md overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                onClick={() => setSelectedHabitat(habitat)}
              >
                <img src={habitat.image} alt={habitat.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h2 className="text-2xl font-semibold text-green-700 mb-3">{habitat.name}</h2>
                  <p className="text-gray-600">{habitat.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedHabitat(null)} className="mb-4 bg-green-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">Retour aux habitats</button>
            <h2 className="text-3xl font-semibold text-green-700 mb-4">{selectedHabitat.name}</h2>
            <p className="text-gray-600 mb-6">{selectedHabitat.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedHabitat.animals.map((animal) => (
                <button
                  key={animal.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={() => handleAnimalClick(animal)}
                >
                  <img src={animal.image} alt={animal.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-green-700 mb-2">{animal.name}</h3>
                    <p className="text-gray-600">Espèce: {animal.species}</p>
                    <p className="text-gray-600">État: {animal.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedAnimal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">{selectedAnimal.name}</h3>
              <img src={selectedAnimal.image} alt={selectedAnimal.name} className="w-full h-64 object-cover rounded mb-4" />
              <p className="text-gray-600 mb-2">Espèce: {selectedAnimal.species}</p>
              <p className="text-gray-600 mb-4">État: {selectedAnimal.status}</p>
              <button onClick={() => setSelectedAnimal(null)} className="bg-green-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">Fermer</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}