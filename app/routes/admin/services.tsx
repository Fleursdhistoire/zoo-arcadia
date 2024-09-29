import { useState } from 'react';
import { useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const action = formData.get('_action');

  if (action === 'create') {
    await db.service.create({ data: { name, description } });
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);
    await db.service.delete({ where: { id } });
  }

  return null;
};

export default function AdminServices() {
  const { services } = useLoaderData<{ services: Service[] }>();
  const [newService, setNewService] = useState({ name: '', description: '' });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gérer les Services</h2>
      
      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="flex gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nom du service"
            value={newService.name}
            onChange={(e) => setNewService({ ...newService, name: e.target.value })}
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </Form>

      <ul className="space-y-4">
        {services.map((service) => (
          <li key={service.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <p>{service.description}</p>
            </div>
            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={service.id} />
              <button type="submit" className="text-red-500">Supprimer</button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}