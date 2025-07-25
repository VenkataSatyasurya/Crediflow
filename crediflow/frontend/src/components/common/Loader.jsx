const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        {text}
      </div>
    </div>
  );
};

export default Loader;
