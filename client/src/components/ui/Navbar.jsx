import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck, Globe } from 'lucide-react';
import Badge from './Badge';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { officer, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <nav className="bg-primary-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-7 h-7 text-indigo-300" />
        <span className="text-xl font-bold tracking-wide">{t('appName')}</span>
        <span className="text-indigo-300 text-sm ml-2">Gujarat Police</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-primary-800 rounded-lg p-1">
          <Globe className="w-4 h-4 text-indigo-300 ml-1" />
          {[['en', 'EN'], ['hi', 'हि'], ['gu', 'ગુ']].map(([code, label]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`px-2 py-1 rounded text-xs font-semibold transition ${
                i18n.language === code
                  ? 'bg-white text-primary-900'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {officer && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-indigo-200">{officer.name}</span>
            <Badge label={officer.role} />
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-red-300 transition">
              <LogOut className="w-4 h-4" /> {t('logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}