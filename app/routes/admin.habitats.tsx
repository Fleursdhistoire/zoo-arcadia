import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation, Link } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server.js';
import { db } from '~/utils/db.server.js';

interface Habitat {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface LoaderData {
  habitats: Habitat[];
}

interface ActionData {
  error?: string;
  success?: boolean;
  animals?: { id: number; name: string; species: string }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const habitats = await db.habitat.findMany();
  return json<LoaderData>({ habitats });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'create') {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;

    if (!name || !description || !image) {
      return json<ActionData>({ error: 'Name, description, and image are required' }, { status: 400 });
    }

    try {
      await db.habitat.create({ data: { name, description, image } });
      return json<ActionData>({ success: true });
    } catch (error) {
      console.error('Error creating habitat:', error);
      return json<ActionData>({ error: 'Failed to create habitat' }, { status: 500 });
    }
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);

    try {
      const habitat = await db.habitat.findUnique({
        where: { id },
        include: { animals: { select: { id: true, name: true, species: true } } }
      });

      if (!habitat) {
        return json<ActionData>({ error: 'Habitat not found' }, { status: 404 });
      }

      if (habitat.animals.length > 0) {
        return json<ActionData>({
          error: 'Cannot delete habitat with associated animals',
          animals: habitat.animals
        }, { status: 400 });
      }

      await db.habitat.delete({ where: { id } });
      return json<ActionData>({ success: true });
    } catch (error) {
      console.error('Error deleting habitat:', error);
      return json<ActionData>({ error: 'Failed to delete habitat: ' + (error as Error).message }, { status: 500 });
    }
  }

  return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
};

export default function AdminHabitats() {
  const { habitats } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Manage Habitats</h2>

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{actionData.error}</span>
          {actionData.animals && (
            <div className="mt-2">
              <p>Animals still in this habitat:</p>
              <ul className="list-disc list-inside">
                {actionData.animals.map(animal => (
                  <li key={animal.id}>{animal.name} ({animal.species})</li>
                ))}
              </ul>
              <p className="mt-2">Please move these animals to another habitat before deleting.</p>
            </div>
          )}
        </div>
      )}
      {actionData?.success && (
        <p className="text-green-500 mb-4">Operation successful</p>
      )}

      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Habitat Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Image URL</label>
          <input
            type="text"
            id="image"
            name="image"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Habitat'}
        </button>
      </Form>

      <ul className="space-y-4">
        {habitats.map((habitat) => (
          <li key={habitat.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{habitat.name}</h3>
            <p>{habitat.description}</p>
            <img src={habitat.image} alt={habitat.name} className="mt-2 w-full h-32 object-cover rounded" />
            <Form method="post" className="mt-2">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={habitat.id} />
              <button
                type="submit"
                className="bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <Link
                to="/veterinarian/dashboard"
                className="bg-blue-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 ml-2"
              >
                Manage Animals
              </Link>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}