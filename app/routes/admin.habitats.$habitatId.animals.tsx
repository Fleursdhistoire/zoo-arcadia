import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface Animal {
  id: number;
  name: string;
  species: string;
}

interface LoaderData {
  habitat: {
    id: number;
    name: string;
  };
  animalsInHabitat: Animal[];
  otherAnimals: Animal[];
}

export const loader: LoaderFunction = async ({ params, request }) => {
  await requireUserId(request);
  const habitatId = parseInt(params.habitatId as string);

  const habitat = await db.habitat.findUnique({
    where: { id: habitatId },
    select: { id: true, name: true },
  });

  if (!habitat) {
    throw new Response('Habitat not found', { status: 404 });
  }

  const animalsInHabitat = await db.animal.findMany({
    where: { habitatId },
    select: { id: true, name: true, species: true },
  });

  const otherAnimals = await db.animal.findMany({
    where: { habitatId: { not: habitatId } },
    select: { id: true, name: true, species: true },
  });

  return json<LoaderData>({ habitat, animalsInHabitat, otherAnimals });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'moveAnimal') {
    const animalId = parseInt(formData.get('animalId') as string);
    const habitatId = parseInt(formData.get('habitatId') as string);

    try {
      await db.animal.update({
        where: { id: animalId },
        data: { habitatId },
      });
      return json({ success: true });
    } catch (error) {
      return json({ error: 'Failed to move animal' }, { status: 500 });
    }
  }

  if (action === 'removeAnimal') {
    const animalId = parseInt(formData.get('animalId') as string);

    try {
      await db.animal.update({
        where: { id: animalId },
        data: { habitatId: null },
      });
      return json({ success: true });
    } catch (error) {
      return json({ error: 'Failed to remove animal from habitat' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
};

export default function ManageHabitatAnimals() {
  const { habitat, animalsInHabitat, otherAnimals } = useLoaderData<LoaderData>();
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Manage Animals in {habitat.name}</h2>

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{actionData.error}</span>
        </div>
      )}
      {actionData?.success && (
        <p className="text-green-500 mb-4">Operation successful</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Animals in this Habitat</h3>
          <ul className="space-y-2">
            {animalsInHabitat.map((animal) => (
              <li key={animal.id} className="flex justify-between items-center bg-white p-2 rounded shadow">
                <span>{animal.name} ({animal.species})</span>
                <Form method="post">
                  <input type="hidden" name="_action" value="removeAnimal" />
                  <input type="hidden" name="animalId" value={animal.id} />
                  <button
                    type="submit"
                    className="bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline hover:bg-red-700"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Other Animals</h3>
          <ul className="space-y-2">
            {otherAnimals.map((animal) => (
              <li key={animal.id} className="flex justify-between items-center bg-white p-2 rounded shadow">
                <span>{animal.name} ({animal.species})</span>
                <Form method="post">
                  <input type="hidden" name="_action" value="moveAnimal" />
                  <input type="hidden" name="animalId" value={animal.id} />
                  <input type="hidden" name="habitatId" value={habitat.id} />
                  <button
                    type="submit"
                    className="bg-green-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    Move Here
                  </button>
                </Form>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}