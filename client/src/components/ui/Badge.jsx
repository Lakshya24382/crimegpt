const colors = {
  OPEN: 'bg-blue-100 text-blue-800',
  INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  ARRESTED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-green-100 text-green-800',
  IO: 'bg-indigo-100 text-indigo-800',
  SHO: 'bg-purple-100 text-purple-800',
  LEGAL_ADVISOR: 'bg-teal-100 text-teal-800',
};

export default function Badge({ label }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[label] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  );
}