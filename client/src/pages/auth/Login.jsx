import { useForm } from 'react-hook-form';
import { authApi } from '../../api/caseApi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data);
      login(res.data.token, res.data.officer);
      toast.success(`Welcome, ${res.data.officer.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-14 h-14 text-primary-600 mb-2" />
          <h1 className="text-2xl font-bold text-primary-900">{t('appName')}</h1>
          <p className="text-gray-500 text-sm">{t('tagline')}</p>

          {/* Language switcher on login page too */}
          <div className="flex gap-2 mt-4">
            {[['en', 'English'], ['hi', 'हिंदी'], ['gu', 'ગુજરાતી']].map(([code, label]) => (
              <button key={code} onClick={() => { i18n.changeLanguage(code); localStorage.setItem('language', code); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  i18n.language === code
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'text-gray-500 border-gray-300 hover:border-primary-400'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('badgeNumber')}</label>
            <input {...register('badge_number', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. GUJ001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input {...register('password', { required: true })} type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••" />
          </div>
          <button type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition">
            {t('login')}
          </button>
        </form>
      </div>
    </div>
  );
}