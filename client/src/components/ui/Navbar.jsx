import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export default function Navbar() {
  const { officer, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-primary-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-indigo-300" />
        <span className="text-xl font-bold tracking-wide">CrimeGPT</span>
        <span className="text-indigo-300 text-sm ml-2">Gujarat Police</span>
      </div>
      {officer && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-indigo-200">{officer.name}</span>
          <Badge label={officer.role} />
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-red-300 transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}