export default function Spinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}