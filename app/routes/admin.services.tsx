import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface Service {
  id: number;
  name: string;
  description: string;
}

interface LoaderData {
  services: Service[];
}

interface ActionData {
  error?: string;
  success?: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const services = await db.service.findMany();
  return json<LoaderData>({ services });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'create') {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name || !description) {
      return json<ActionData>({ error: 'Name and description are required' }, { status: 400 });
    }

    try {
      await db.service.create({ data: { name, description } });
      return json<ActionData>({ success: true });
    } catch (error) {
      return json<ActionData>({ error: 'Failed to create service' }, { status: 500 });
    }
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);

    try {
      await db.service.delete({ where: { id } });
      return json<ActionData>({ success: true });
    } catch (error) {
      return json<ActionData>({ error: 'Failed to delete service' }, { status: 500 });
    }
  }

  return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
};

export default function AdminServices() {
  const { services } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Manage Services</h2>

      {actionData?.error && (
        <p className="text-red-500 mb-4">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 mb-4">Operation successful</p>
      )}

      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Service Name</label>
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
        <button
          type="submit"
          className="bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Service'}
        </button>
      </Form>

      <ul className="space-y-4">
        {services.map((service) => (
          <li key={service.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{service.name}</h3>
            <p>{service.description}</p>
            <Form method="post" className="mt-2">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={service.id} />
              <button
                type="submit"
                className="bg-red-600 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline hover:bg-red-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}