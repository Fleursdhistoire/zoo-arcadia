import { useLoaderData, Form } from '@remix-run/react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  email: string;
  role: string;
}

export const loader: LoaderFunction = async () => {
  const users = await db.user.findMany({ select: { id: true, email: true, role: true } });
  return json({ users });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const action = formData.get('_action');

  if (action === 'create') {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({ data: { email, password: hashedPassword, role } });
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);
    await db.user.delete({ where: { id } });
  }

  return null;
};

export default function AdminUsers() {
  const { users } = useLoaderData<{ users: User[] }>();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gérer les Utilisateurs</h2>
      
      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            className="p-2 border rounded"
            required
          />
          <select name="role" className="p-2 border rounded" required>
            <option value="">Sélectionner un rôle</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employé</option>
            <option value="VETERINARIAN">Vétérinaire</option>
          </select>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Ajouter</button>
        </div>
      </Form>

      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h3 className="font-semibold">{user.email}</h3>
              <p>Rôle: {user.role}</p>
            </div>
            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={user.id} />
              <button type="submit" className="text-red-500">Supprimer</button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}