import React from 'react';
import { Form } from '@remix-run/react';
import { Animal } from '~/types.js';


interface ControlProps {
  animals: Animal[];
  onAnimalSelect: (animalId: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function Control({ animals, onAnimalSelect, onSubmit }: ControlProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">
        Contrôles de santé quotidiens
      </h2>
      <Form method="post" onSubmit={onSubmit} className="mb-8">
        <input type="hidden" name="_action" value="createDailyHealthCheck" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="animalId"
              className="block text-sm font-medium text-gray-700"
            >
              Animal
            </label>
            <select
              id="animalId"
              name="animalId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              onChange={(e) => onAnimalSelect(parseInt(e.target.value))}
              required
            >
              <option value="">Sélectionnez un animal</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} ({animal.species})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              État de santé
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="Bon">Bon</option>
              <option value="Moyen">Moyen</option>
              <option value="Mauvais">Mauvais</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Ajoutez des notes sur l'état de santé de l'animal..."
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Enregistrer le contrôle de santé
        </button>
      </Form>
    </section>
  );
}
