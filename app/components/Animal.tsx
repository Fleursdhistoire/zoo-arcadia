import React from 'react';
import { Form } from '@remix-run/react';

interface AnimalProps {
  animals: Array<{
    id: number;
    name: string;
    species: string;
    status: string;
    habitat?: {
      id: number;
      name: string;
    } | null; 
  }>;
  habitats: Array<{
    id: number;
    name: string;
  }>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function Animal({ animals, habitats, onSubmit }: AnimalProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Animaux</h2>
      {animals.length === 0 ? (
        <p className="text-red-500">
          Aucun animal n&apos;est actuellement enregistré dans le système.
        </p>
      ) : (
        <div className="space-y-4">
          {animals.map((animal) => (
            <div key={animal.id} className="bg-white p-4 rounded-lg shadow">
              <Form method="post" onSubmit={onSubmit}>
                <input type="hidden" name="id" value={animal.id} />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor={`name-${animal.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <input
                      type="text"
                      id={`name-${animal.id}`}
                      name="name"
                      defaultValue={animal.name}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`species-${animal.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Espèce
                    </label>
                    <input
                      type="text"
                      id={`species-${animal.id}`}
                      name="species"
                      defaultValue={animal.species}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`status-${animal.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Statut
                    </label>
                    <input
                      type="text"
                      id={`status-${animal.id}`}
                      name="status"
                      defaultValue={animal.status}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`habitat-${animal.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Habitat
                    </label>
                    <select
                      id={`habitat-${animal.id}`}
                      name="habitatId"
                      defaultValue={animal.habitat?.id || ""}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">Aucun habitat</option>
                      {habitats.map((habitat) => (
                        <option key={habitat.id} value={habitat.id}>
                          {habitat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    name="_action"
                    value="updateAnimal"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Mettre à jour
                  </button>
                  <button
                    type="submit"
                    name="_action"
                    value="deleteAnimal"
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </Form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
