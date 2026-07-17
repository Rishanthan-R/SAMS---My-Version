import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, GraduationCap, BookOpen, ShieldCheck } from 'lucide-react';

const roleConfig: Record<string, { icon: React.ReactNode; color: string; label: string; dashboard: string }> = {
  student: {
    icon: <GraduationCap className="w-6 h-6" />,
    color: '#8ce0a3',
    label: 'Student',
    dashboard: '/student/dashboard',
  },
  lecturer: {
    icon: <BookOpen className="w-6 h-6" />,
    color: '#406874',
    label: 'Lecturer',
    dashboard: '/lecturer/dashboard',
  },
  admin: {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: '#1e293b',
    label: 'Admin',
    dashboard: '/admin/dashboard',
  },
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedRole = searchParams.get('role') || 'student';
  const config = roleConfig[selectedRole] || roleConfig.student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { role } = await signIn(email, password);
      const dashboard = roleConfig[role]?.dashboard || '/student/dashboard';
      navigate(dashboard, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to landing */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#8ce0a3] rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">
                <span className="text-xl">S</span>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your SAMS account</p>

            {/* Role indicator */}
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${config.color}10`, color: config.color }}
            >
              {config.icon}
              Signing in as {config.label}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.lk"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#8ce0a3]/30 focus:border-[#8ce0a3] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#8ce0a3]/30 focus:border-[#8ce0a3] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-[#406874] hover:text-[#32525c] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#406874] hover:bg-[#32525c] disabled:bg-gray-300 text-white text-sm font-medium rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Role switcher */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Sign in as a different role</p>
            <div className="flex justify-center gap-2">
              {Object.entries(roleConfig).map(([role, cfg]) => (
                <Link
                  key={role}
                  to={`/login?role=${role}`}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                    selectedRole === role
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cfg.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
