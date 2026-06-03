import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import authService from '../services/authService';
import { KeyRound } from 'lucide-react';

export default function Recovery() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { recover } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      addToast('Enter your username', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.getSecurityQuestion(username);
      if (res.data.success) {
        setSecurityQuestion(res.data.data.securityQuestion);
        setStep(2);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'User not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!securityAnswer || !newPassword) {
      addToast('Fill all fields', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await recover({ username, securityAnswer, newPassword });
      if (result.success) {
        addToast('Password recovered! You can now login.', 'success');
        navigate('/login');
      } else {
        addToast(result.message || 'Recovery failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Recovery failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-600 p-8 shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-primary-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-1">Password Recovery</h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          {step === 1 ? 'Enter your username to start' : 'Answer the security question'}
        </p>

        {step === 1 ? (
          <form onSubmit={handleGetQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Enter username" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm">
              {loading ? 'Checking...' : 'Get Security Question'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRecover} className="space-y-4">
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300 font-medium">Security Question:</p>
              <p className="text-white text-sm mt-1">{securityQuestion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Your Answer</label>
              <input value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="Your answer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password (min 6 chars)</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" placeholder="New password" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm">
              {loading ? 'Recovering...' : 'Recover Password'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-400">
          <Link to="/login" className="text-primary-400 hover:text-primary-300">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
