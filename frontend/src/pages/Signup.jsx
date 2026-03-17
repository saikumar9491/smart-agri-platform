import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    farmSize: '',
    soilType: 'Loamy'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Join the community
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
              Log in here
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-rose-50 p-4 border border-rose-200">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                onChange={handleChange}
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                onChange={handleChange}
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                name="password"
                required
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                onChange={handleChange}
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Farm Location (State/City)</label>
              <input
                type="text"
                name="location"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Farm Size (Acres)</label>
              <input
                type="number"
                name="farmSize"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Primary Soil Type</label>
              <select
                name="soilType"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-green-500 focus:ring-green-500 sm:text-sm bg-white"
                onChange={handleChange}
                value={formData.soilType}
              >
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
                <option value="Silty">Silty</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full justify-center rounded-xl border border-transparent bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
