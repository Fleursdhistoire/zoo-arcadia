import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface DashboardData {
  totalAnimals: number;
  totalHabitats: number;
  pendingReviews: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  
  const totalAnimals = await db.animal.count();
  const totalHabitats = await db.habitat.count();
  const pendingReviews = await db.review.count({ where: { isVisible: false } });

  return json({ totalAnimals, totalHabitats, pendingReviews });
};

export default function EmployeeDashboard() {
  const { totalAnimals, totalHabitats, pendingReviews } = useLoaderData<DashboardData>();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Total Animals" value={totalAnimals} />
        <DashboardCard title="Total Habitats" value={totalHabitats} />
        <DashboardCard title="Pending Reviews" value={pendingReviews} />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}