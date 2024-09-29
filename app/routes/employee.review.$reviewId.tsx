import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form, useNavigation } from '@remix-run/react';
import { requireUserId } from '~/utils/session.server';
import { db } from '~/utils/db.server';

interface Review {
  id: number;
  name: string;
  comment: string;
  isVisible: boolean;
  createdAt: Date;
}

interface ActionData {
  error?: string;
  success?: boolean;
  review?: Review;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  const { reviewId } = params;

  if (!reviewId || isNaN(parseInt(reviewId))) {
    throw new Response("Invalid Review ID", { status: 400 });
  }

  const review = await db.review.findUnique({
    where: { id: parseInt(reviewId) },
  });

  if (!review) {
    throw new Response("Review not found", { status: 404 });
  }

  return json({ review });
};

export const action: ActionFunction = async ({ request, params }) => {
  console.log("Action function started");
  console.log("Params:", params);

  try {
    await requireUserId(request);
    console.log("User ID requirement passed");

    const { reviewId } = params;
    console.log("Extracted reviewId:", reviewId);

    if (!reviewId) {
      console.log("Error: Review ID is required");
      return json<ActionData>({ error: "Review ID is required" }, { status: 400 });
    }

    const parsedReviewId = parseInt(reviewId);
    console.log("Parsed reviewId:", parsedReviewId);

    if (isNaN(parsedReviewId)) {
      console.log("Error: Invalid Review ID");
      return json<ActionData>({ error: "Invalid Review ID" }, { status: 400 });
    }

    const formData = await request.formData();
    const isVisible = formData.get('isVisible') === 'on';
    console.log("Form data - isVisible:", isVisible);

    const updatedReview = await db.review.update({
      where: { id: parsedReviewId },
      data: { isVisible },
    });
    console.log("Review updated successfully:", updatedReview);

    return json<ActionData>({ success: true, review: updatedReview });
  } catch (error) {
    console.error("Error in action function:", error);
    return json<ActionData>({ error: "Failed to update review" }, { status: 500 });
  }
};

export default function EmployeeReview() {
  const { review } = useLoaderData<{ review: Review }>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const isUpdating = navigation.state === "submitting";

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Review Details</h2>
      {actionData?.error && (
        <p className="text-red-500 mb-4">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="text-green-500 mb-4">Review updated successfully</p>
      )}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-2"><strong className="text-gray-700">Name:</strong> {review.name}</p>
        <p className="mb-2"><strong className="text-gray-700">Comment:</strong> {review.comment}</p>
        <p className="mb-2"><strong className="text-gray-700">Created At:</strong> {review.createdAt.toLocaleString()}</p>
        <p className="mb-4"><strong className="text-gray-700">Visible:</strong> {review.isVisible ? 'Yes' : 'No'}</p>
        <Form method="post" className="mt-4">
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isVisible"
              defaultChecked={review.isVisible}
              className="mr-2"
            />
            <span className="text-gray-700">Make Visible</span>
          </label>
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Visibility'}
          </button>
        </Form>
      </div>
    </div>
  );
}