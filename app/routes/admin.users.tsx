import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';
import bcrypt from 'bcryptjs';

interface User {
  id: number;
  email: string;
  role: string;
}

interface LoaderData {
  users: User[];
}

interface ActionData {
  error?: string;
  success?: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const users = await db.user.findMany({ select: { id: true, email: true, role: true } });
  return json<LoaderData>({ users });
};

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request);
  const formData = await request.formData();
  const action = formData.get('_action');

  if (action === 'create') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!email || !password || !role) {
      return json<ActionData>({ error: 'All fields are required' }, { status: 400 });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.user.create({ data: { email, password: hashedPassword, role } });
      return json<ActionData>({ success: true });
    } catch (error) {
      return json<ActionData>({ error: 'Failed to create user' }, { status: 500 });
    }
  } else if (action === 'delete') {
    const id = parseInt(formData.get('id') as string);

    try {
      await db.user.delete({ where: { id } });
      return json<ActionData>({ success: true });
    } catch (error) {
      return json<ActionData>({ error: 'Failed to delete user' }, { status: 500 });
    }
  }

  return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
};

export default function AdminUsers() {
  const { users } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {actionData?.error && (
        <p className="text-red-500 mb-4">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 mb-4">Operation successful</p>
      )}

      <Form method="post" className="mb-8">
        <input type="hidden" name="_action" value="create" />
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Role</label>
          <select
            id="role"
            name="role"
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-green-500"
            required
          >
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="VISITOR">Visitor</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add User'}
        </button>
      </Form>

      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="bg-white p-4 rounded-lg shadow">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <Form method="post" className="mt-2">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="id" value={user.id} />
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