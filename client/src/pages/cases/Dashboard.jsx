import { useEffect, useState } from 'react';
import { caseApi } from '../../api/caseApi';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, FolderOpen, Clock, UserCheck, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const statusIcons = {
  OPEN: <FolderOpen className="w-5 h-5 text-blue-500" />,
  INVESTIGATION: <Clock className="w-5 h-5 text-yellow-500" />,
  ARRESTED: <UserCheck className="w-5 h-5 text-red-500" />,
  CLOSED: <CheckCircle className="w-5 h-5 text-green-500" />,
};

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    caseApi.getAll()
      .then(res => setCases(res.data))
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter(c =>
    c.case_number.toLowerCase().includes(search.toLowerCase()) ||
    c.fir_number?.toLowerCase().includes(search.toLowerCase()) ||
    c.incident_location?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'OPEN').length,
    investigation: cases.filter(c => c.status === 'INVESTIGATION').length,
    arrested: cases.filter(c => c.status === 'ARRESTED').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Case Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all active and closed cases</p>
        </div>
        <button
          onClick={() => navigate('/cases/new')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusCircle className="w-5 h-5" /> New Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Cases', value: stats.total, color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Open', value: stats.open, color: 'bg-blue-50 text-blue-700' },
          { label: 'Under Investigation', value: stats.investigation, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Arrested', value: stats.arrested, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by case number, FIR number, location..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Cases Table */}
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No cases found</p>
              <p className="text-sm mt-1">Create your first case to get started</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['Case No.', 'FIR No.', 'Location', 'Date', 'Status', 'Officer', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-primary-700">{c.case_number}</td>
                    <td className="px-4 py-3 text-gray-600">{c.fir_number || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.incident_location || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {statusIcons[c.status]}
                        <Badge label={c.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.officer_name || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/cases/${c.id}`)}
                        className="text-primary-600 hover:text-primary-800 font-medium hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}