import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface Review {
  id: number;
  name: string;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  
  const reviews = await db.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return json({ reviews });
};

export default function EmployeeReviews() {
  const { reviews } = useLoaderData<{ reviews: Review[] }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Manage Reviews</h2>
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="bg-white p-4 rounded-lg shadow">
            <p className="font-bold">{review.name}</p>
            <p className="text-gray-600">{review.comment.substring(0, 100)}...</p>
            <p className="text-sm text-gray-500">
              Created: {new Date(review.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              Visible: {review.isVisible ? 'Yes' : 'No'}
            </p>
            <Link
              to={`/employee/review/${review.id}`}
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              Manage Review
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}