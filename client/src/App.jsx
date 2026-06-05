import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Navbar from './components/ui/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/cases/Dashboard';
import NewCase from './pages/cases/NewCase';
import CaseDetail from './pages/cases/CaseDetail';

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="min-h-screen bg-slate-50">
              <Navbar />
              <div className="max-w-7xl mx-auto px-4 py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/cases/new" element={<NewCase />} />
                  <Route path="/cases/:id" element={<CaseDetail />} />
                </Routes>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}