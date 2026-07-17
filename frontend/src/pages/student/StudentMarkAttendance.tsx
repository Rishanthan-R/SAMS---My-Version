import { useEffect, useState } from 'react';
import { BookOpen, MapPin, Target, CheckCircle2, Navigation } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export function StudentMarkAttendance() {
  const { session } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState<null | { distance: number }>(null);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only 1 digit
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }

    setLocating(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    // Get GPS coords
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        setLoading(true);
        try {
          const data = await apiClient('/api/student/attendance/mark', {
            method: 'POST',
            body: {
              otp: otpString,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            token: session?.access_token
          });
          
          setSuccess({ distance: data.distance });
          toast.success('Attendance verified successfully!');
        } catch (err: any) {
          toast.error(err.message || 'Verification failed');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error('Could not get your location. Please enable location permissions.');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">Mark Attendance</h1>
        <p className="text-sm text-gray-500">Enter the 6-digit OTP displayed by your lecturer. Your location will be verified.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
        
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-24 h-24 bg-[#8ce0a3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#8ce0a3]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">You're Checked In!</h2>
            <p className="text-gray-500 mb-6">
              Your attendance has been recorded successfully.
            </p>
            <div className="inline-flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <MapPin className="w-4 h-4 text-[#406874]" />
              Verified at {success.distance} meters from lecturer
            </div>
            <br />
            <button
              onClick={() => {
                setSuccess(null);
                setOtp(['', '', '', '', '', '']);
              }}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors"
            >
              Mark Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Location Notice */}
            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl mb-8 border border-blue-100">
              <Navigation className="w-5 h-5 text-[#406874] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#406874] mb-1">GPS Verification Required</p>
                <p className="text-xs text-[#406874]/80">
                  Your browser will ask for location permissions when you submit. You must be within the lecture hall to be marked present.
                </p>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="mb-10">
              <label className="block text-center text-sm font-medium text-gray-700 mb-6">
                Enter 6-Digit OTP
              </label>
              <div className="flex justify-center gap-2 sm:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#8ce0a3] focus:ring-2 focus:ring-[#8ce0a3]/20 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || locating || otp.join('').length !== 6}
              className="w-full py-4 bg-[#406874] hover:bg-[#32525c] disabled:bg-gray-300 text-white text-base font-semibold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {locating ? (
                <>
                  <MapPin className="w-5 h-5 animate-bounce" />
                  Acquiring GPS Location...
                </>
              ) : loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Verify & Mark Attendance
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
