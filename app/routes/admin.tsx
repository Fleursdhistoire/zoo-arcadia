import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData, Link, Outlet } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server.js';
import { db } from '~/utils/db.server.js';

import { BarChart as BarChartIcon, Users, Box, FileText, Clipboard, Home, Stethoscope, User, BarChart2 } from 'lucide-react';
import { Button } from '~/components/ui/button.js';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card.js';


interface AdminDashboardData {
  message: string;
  totalReviews: number;
  pendingReviews: number;
  totalServices: number;
  totalHabitats: number;
  animalViews: {
    animalName: string;
    viewCount: number;
  }[];
  monthlyVisitors: {
    month: string;
    count: number;
  }[];
  habitatDistribution: {
    habitatName: string;
    animalCount: number;
  }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: parseInt(userId) } });

  if (user?.role !== "ADMIN") {
    return redirect("/");
  }

  const totalReviews = await db.review.count();
  const pendingReviews = await db.review.count({ where: { isVisible: false } });
  const totalServices = await db.service.count();
  const totalHabitats = await db.habitat.count();

  const animalViews = await db.animalView.findMany({
    select: {
      animal: { select: { name: true } },
      viewCount: true,
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });

  let habitatDistribution = await db.habitat.findMany({
    select: {
      name: true,
      _count: { select: { animals: true } },
    },
  });

  // If habitatDistribution is empty, use mock data
  if (habitatDistribution.length === 0) {
    habitatDistribution = [
      { name: 'Savanna', _count: { animals: 10 } },
      { name: 'Rainforest', _count: { animals: 15 } },
      { name: 'Desert', _count: { animals: 5 } },
      { name: 'Arctic', _count: { animals: 8 } },
      { name: 'Ocean', _count: { animals: 20 } },
    ];
  }

  // Placeholder data for monthly visitors
  const monthlyVisitors = [
    { month: 'Jan', count: 1000 },
    { month: 'Feb', count: 1200 },
    { month: 'Mar', count: 1500 },
    { month: 'Apr', count: 1300 },
    { month: 'May', count: 1700 },
    { month: 'Jun', count: 2000 },
  ];

  console.log('Loader data:', { totalReviews, pendingReviews, totalServices, totalHabitats, animalViews, habitatDistribution });

  return json<AdminDashboardData>({ 
    message: "Bienvenue sur le tableau de bord administrateur",
    totalReviews,
    pendingReviews,
    totalServices,
    totalHabitats,
    animalViews: animalViews.map((view: { animal: { name: string }, viewCount: number }) => ({
      animalName: view.animal.name,
      viewCount: view.viewCount,
    })),
    monthlyVisitors,
    habitatDistribution: habitatDistribution.map((habitat: { name: string, _count: { animals: number } }) => ({
      habitatName: habitat.name,
      animalCount: habitat._count.animals,
    })),
  });
};



export default function AdminLayout() {
  const data = useLoaderData<AdminDashboardData>();
  console.log('Component data:', data);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Admin Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Total Reviews</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data.totalReviews}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Pending Reviews</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data.pendingReviews}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Total Services</CardTitle>
              <Box className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data.totalServices}</div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">Total Habitats</CardTitle>
              <BarChartIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{data.totalHabitats}</div>
            </CardContent>
          </Card>
        </div>
        
        
        <Outlet context={data} />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/employee/reviews">
              <Clipboard className="h-6 w-6 mb-2" />
              <span>Manage Reviews</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/admin/services">
              <Box className="h-6 w-6 mb-2" />
              <span>Manage Services</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/admin/habitats">
              <Home className="h-6 w-6 mb-2" />
              <span>Manage Habitats</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/admin/users">
              <User className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/veterinarian/dashboard">
              <Stethoscope className="h-6 w-6 mb-2" />
              <span>Veterinarian Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/employee/dashboard">
              <Users className="h-6 w-6 mb-2" />
              <span>Employee Dashboard</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-full bg-white text-gray-800 hover:bg-gray-200 flex flex-col items-center justify-center p-4">
            <Link to="/admin/analytics">
              <BarChart2 className="h-6 w-6 mb-2" />
              <span>Detailed Statistics</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}