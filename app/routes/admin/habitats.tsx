import { useState } from 'react';
import { useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';

interface Habitat {
  id: number;
  name: string;
  description: string;
  image: string;
}

export const loader: LoaderFunction = async () => {
  const habitats = await db.habitat.findMany();
  return json({ habitats });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as string;
  const action = formData.get('_action');

  if (action === 'create') {
    await db.habitat.create({ data: { name, description, image } });
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);
    await db.habitat.delete({ where: { id } });
  }

  return null;
};

export default function AdminHabitats() {
  const { habitats } = useLoaderData<{ habitats: Habitat[] }>();
  const [newHabitat, setNewHabitat] = useState({ name: '', description: '', image: '' });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gérer les Habitats</h2>
      
      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nom de l'habitat"
            value={newHabitat.name}
            onChange={(e) => setNewHabitat({ ...newHabitat, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newHabitat.description}
            onChange={(e) => setNewHabitat({ ...newHabitat, description: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="image"
            placeholder="URL de l'image"
            value={newHabitat.image}
            onChange={(e) => setNewHabitat({ ...newHabitat, image: e.target.value })}
            className="p-2 border rounded"
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </Form>

      <ul className="space-y-4">
        {habitats.map((habitat) => (
          <li key={habitat.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h3 className="font-semibold">{habitat.name}</h3>
              <p>{habitat.description}</p>
              <img src={habitat.image} alt={habitat.name} className="w-32 h-32 object-cover mt-2" />
            </div>
            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={habitat.id} />
              <button type="submit" className="text-red-500">Supprimer</button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}