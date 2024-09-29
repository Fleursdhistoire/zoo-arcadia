import { Outlet, Link, useLocation } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { requireUserId } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  return json({});
};

export default function EmployeeLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee Portal</h2>
          <ul className="space-y-2">
            <li>
              <Link to="/employee" className={`block p-2 rounded ${location.pathname === '/employee' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/employee/dashboard" className={`block p-2 rounded ${location.pathname === '/employee/dashboard' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/employee/reviews" className={`block p-2 rounded ${location.pathname.startsWith('/employee/review') ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                Manage Reviews
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}