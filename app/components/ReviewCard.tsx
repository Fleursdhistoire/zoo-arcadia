interface ReviewCardProps {
  name: string;
  comment: string;
}

export default function ReviewCard({ name, comment }: ReviewCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-700 mb-2">{comment}</p>
      <p className="text-green-600 font-semibold">- {name}</p>
    </div>
  );
}