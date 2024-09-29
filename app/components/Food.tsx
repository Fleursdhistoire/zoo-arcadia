import React from 'react';
import { Form } from '@remix-run/react';
import { Animal as AnimalType, FoodCalculationParams } from '~/types.js';

interface FoodProps {
  animals: AnimalType[];
  calculateRecommendedFoodQuantity: (animal: FoodCalculationParams) => number;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function Food({ animals, calculateRecommendedFoodQuantity, onSubmit }: FoodProps) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Calcul de la nourriture</h2>
      {animals.map((animal) => {
        const foodParams: FoodCalculationParams = {
          species: animal.species,
          weight: animal.weight,
          age: animal.age,
          activityLevel: animal.activityLevel,
          dietaryNeeds: animal.dietaryNeeds || null
        };
        return (
          <div key={animal.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="font-bold text-lg mb-2">
              {animal.name} ({animal.species})
            </h3>
            <p>Âge: {animal.age} ans</p>
            <p>Poids: {animal.weight} kg</p>
            <p>Niveau d&apos;activité: {animal.activityLevel}</p>
            <p>
              Besoins diététiques spécifiques: {animal.dietaryNeeds || "Aucun"}
            </p>
            <p>
              Quantité de nourriture recommandée:{" "}
              {calculateRecommendedFoodQuantity(foodParams)} g
            </p>
            <Form method="post" onSubmit={onSubmit} className="mt-2">
              <input
                type="hidden"
                name="_action"
                value="updateRecommendedFoodQuantity"
              />
              <input type="hidden" name="animalId" value={animal.id} />
              <div className="flex items-center">
                <input
                  type="number"
                  name="recommendedFoodQuantity"
                  defaultValue={calculateRecommendedFoodQuantity(foodParams)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                >
                  Mettre à jour
                </button>
              </div>
            </Form>
          </div>
        );
      })}
    </section>
  );
}
