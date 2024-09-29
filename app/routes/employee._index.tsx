import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface Employee {
  id: number;
  email: string;
  role: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  
  const employees = await db.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: { id: true, email: true, role: true }
  });

  return json({ employees });
};

export default function EmployeeIndex() {
  const { employees } = useLoaderData<{ employees: Employee[] }>();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Liste des employés</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <li key={employee.id} className="p-4 hover:bg-gray-50">
              <p className="font-semibold text-lg text-gray-700">ID de l&apos;employé: {employee.id}</p>
              <p className="text-gray-600">{employee.email}</p>
              <p className="text-gray-600">Rôle: {employee.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}