import { useForm } from 'react-hook-form';
import { authApi } from '../../api/caseApi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuthStore();
  const navigate = useNavigate();

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
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="w-14 h-14 text-primary-600 mb-2" />
          <h1 className="text-2xl font-bold text-primary-900">CrimeGPT</h1>
          <p className="text-gray-500 text-sm">Gujarat Police Documentation System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
            <input {...register('badge_number', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. GUJ001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input {...register('password', { required: true })} type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••" />
          </div>
          <button type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition">
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          New officer? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}