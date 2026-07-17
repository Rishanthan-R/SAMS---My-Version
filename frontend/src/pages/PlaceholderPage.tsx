export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-400 text-sm">This page will be implemented in a future phase.</p>
    </div>
  );
}
