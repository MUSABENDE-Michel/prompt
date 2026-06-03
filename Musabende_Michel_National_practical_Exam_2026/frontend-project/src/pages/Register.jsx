import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, securityQuestion, securityAnswer } = form;
    if (!username || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
      addToast('All fields are required', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ username, password, securityQuestion, securityAnswer });
      if (result.success) {
        addToast('Registration successful!', 'success');
        navigate('/dashboard');
      } else {
        addToast(result.message || 'Registration failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-600 p-8 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-1">Create Account</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Register for SalesPro Ltd SRMS</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input name="username" value={form.username} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Choose a username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password (min 6 chars)</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Confirm password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Security Question</label>
            <select name="securityQuestion" value={form.securityQuestion} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
              <option value="">Select a question</option>
              <option value="What is your favorite color?">What is your favorite color?</option>
              <option value="What is your pet name?">What is your pet name?</option>
              <option value="What is your birth city?">What is your birth city?</option>
              <option value="What is your favorite food?">What is your favorite food?</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Security Answer</label>
            <input name="securityAnswer" value={form.securityAnswer} onChange={handleChange} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Your answer" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
