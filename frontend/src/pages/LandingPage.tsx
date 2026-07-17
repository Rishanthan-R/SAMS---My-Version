import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, ShieldCheck, MapPin, Clock, Fingerprint } from 'lucide-react';
import { motion } from 'motion/react';

const roleCards = [
  {
    title: 'Student',
    description: 'Mark attendance, enroll in subjects, and track your records',
    icon: <GraduationCap className="w-8 h-8" />,
    color: '#8ce0a3',
    bgColor: 'bg-green-50',
    loginPath: '/login?role=student',
  },
  {
    title: 'Lecturer',
    description: 'Generate OTPs, conduct sessions, and monitor attendance',
    icon: <BookOpen className="w-8 h-8" />,
    color: '#406874',
    bgColor: 'bg-teal-50',
    loginPath: '/login?role=lecturer',
  },
  {
    title: 'Admin',
    description: 'Manage users, academic structure, and system reports',
    icon: <ShieldCheck className="w-8 h-8" />,
    color: '#1e293b',
    bgColor: 'bg-slate-50',
    loginPath: '/login?role=admin',
  },
];

const features = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'GPS Verification',
    description: 'Ensures physical presence through real-time location verification',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Time-Limited OTP',
    description: '10-minute OTP codes prevent unauthorized attendance marking',
  },
  {
    icon: <Fingerprint className="w-6 h-6" />,
    title: 'Anti-Spoofing',
    description: 'Server-side validation makes GPS spoofing virtually impossible',
  },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F5F7] font-sans">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8ce0a3] rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">
              <span className="text-lg">S</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">SAMS</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Smart Attendance</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-[#406874] hover:bg-[#32525c] text-white text-sm font-medium rounded-full shadow-sm transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#8ce0a3]/10 text-[#406874] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            GPS-Verified Attendance System
          </div>
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 tracking-tight mb-6 leading-tight">
            Smart Attendance<br />
            <span className="text-[#406874]">Management System</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Faculty of Computing, University of Sri Jayewardenepura.
            OTP + GPS verification ensures only physically present students get marked.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {roleCards.map((role, idx) => (
            <motion.button
              key={role.title}
              onClick={() => navigate(role.loginPath)}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 text-left hover:shadow-md transition-shadow group cursor-pointer"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${role.color}15`, color: role.color }}
              >
                {role.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{role.description}</p>
              <div
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                style={{ backgroundColor: `${role.color}10`, color: role.color }}
              >
                Login as {role.title} →
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
              <div className="w-12 h-12 bg-[#406874] rounded-2xl flex items-center justify-center text-white mb-4">
                {feature.icon}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 SAMS — Faculty of Computing, University of Sri Jayewardenepura
          </p>
        </div>
      </footer>
    </div>
  );
}
