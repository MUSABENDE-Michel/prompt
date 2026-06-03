import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { getSecurityQuestion, verifySecurityAnswer, resetPassword } from '../services/authService';
import { Shield, ArrowLeft, Check } from 'lucide-react';

export default function Recovery() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ username: '', answer: '', newPassword: '', confirmPassword: '' });
  const [question, setQuestion] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGetQuestion = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await getSecurityQuestion(form.username.trim());
      if (res.success) {
        setQuestion(res.data.securityQuestion);
        setStep(2);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'User not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!form.answer.trim()) {
      setErrors({ answer: 'Answer is required' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await verifySecurityAnswer(form.username.trim(), form.answer.trim());
      if (res.success) {
        setResetToken(res.data.resetToken);
        setStep(3);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Incorrect answer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.newPassword) errs.newPassword = 'Password is required';
    else if (form.newPassword.length < 6) errs.newPassword = 'Minimum 6 characters';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await resetPassword(resetToken, form.newPassword);
      if (res.success) {
        addToast('Password reset successfully! Please login.', 'success');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Password Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">DAB Enterprise Ltd - BWS</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleGetQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Checking...' : 'Get Security Question'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Security Question:</p>
              <p>{question}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
              <input
                type="text" value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer"
              />
              {errors.answer && <p className="text-xs text-red-500 mt-1">{errors.answer}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying...' : 'Verify Answer'}
            </button>
            <button type="button" onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1"
            >
              <ArrowLeft size={14} /><span>Back</span>
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password" value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min 6 characters"
              />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center space-x-1">
            <ArrowLeft size={14} /><span>Back to Login</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
