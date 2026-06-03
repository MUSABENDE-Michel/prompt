import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSecurityQuestion, recoverPassword } from '../services/authService';

const Recovery = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    if (!username.trim()) { toast.error('Enter your username'); return; }
    setLoading(true);
    try {
      const res = await getSecurityQuestion(username);
      setSecurityQuestion(res.data.data.securityQuestion);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!securityAnswer.trim() || newPassword.length < 6) {
      toast.error('Fill all fields. Password min 6 chars');
      return;
    }
    setLoading(true);
    try {
      await recoverPassword({ username, securityAnswer, newPassword });
      toast.success('Password reset! Redirecting to login...');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Package className="mx-auto text-blue-600" size={40} />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Password Recovery</h2>
          <p className="text-gray-500 text-sm">Reset your password securely</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleGetQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
              {loading ? 'Searching...' : 'Get Security Question'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Security Question:</p>
              <p className="text-sm text-blue-600 mt-1">{securityQuestion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
              <input type="text" value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min 6 characters" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
