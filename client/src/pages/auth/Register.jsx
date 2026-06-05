import { useForm } from 'react-hook-form';
import { authApi } from '../../api/caseApi';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await authApi.register(data);
      toast.success('Registered! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="w-12 h-12 text-primary-600 mb-2" />
          <h1 className="text-2xl font-bold text-primary-900">Register Officer</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[['name','Full Name','Rajesh Kumar'],['badge_number','Badge Number','GUJ001'],['station','Police Station','Navrangpura PS']].map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input {...register(field, { required: true })} placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select {...register('role')} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="IO">IO - Investigating Officer</option>
              <option value="SHO">SHO - Station House Officer</option>
              <option value="LEGAL_ADVISOR">Legal Advisor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input {...register('password', { required: true })} type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg transition">
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered? <Link to="/login" className="text-primary-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}