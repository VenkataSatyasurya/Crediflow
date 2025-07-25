const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-lg bg-white p-8 text-center shadow">
      <h3 className="text-sm font-medium text-gray-800">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
