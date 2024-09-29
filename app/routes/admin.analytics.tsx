import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

interface AnalyticsData {
  totalVisitors: number;
  totalAnimals: number;
  popularHabitats: { name: string; visitCount: number }[];
  popularAnimals: { name: string; viewCount: number }[];
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);

  const totalVisitors = await db.user.count({ where: { role: 'VISITOR' } });
  const totalAnimals = await db.animal.count();

  const popularHabitats = await db.habitat.findMany({
    select: {
      name: true,
      _count: { select: { animals: true } },
    },
    orderBy: {
      animals: { _count: 'desc' },
    },
    take: 5,
  });

  const popularAnimals = await db.animalView.findMany({
    select: {
      animal: { select: { name: true } },
      viewCount: true,
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
  });

  const analyticsData: AnalyticsData = {
    totalVisitors,
    totalAnimals,
    popularHabitats: popularHabitats.map(h => ({ name: h.name, visitCount: h._count.animals })),
    popularAnimals: popularAnimals.map(a => ({ name: a.animal.name, viewCount: a.viewCount })),
  };

  return json(analyticsData);
};

export default function AdminAnalytics() {
  const data = useLoaderData<AnalyticsData>();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{data.totalVisitors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{data.totalAnimals}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Popular Habitats</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.popularHabitats.map((habitat, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{habitat.name}</span>
                  <span className="font-bold">{habitat.visitCount} animals</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Popular Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.popularAnimals.map((animal, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <span>{animal.name}</span>
                  <span className="font-bold">{animal.viewCount} views</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}