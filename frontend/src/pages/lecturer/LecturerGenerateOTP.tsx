import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { KeyRound, MapPin, Navigation, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api';
import toast from 'react-hot-toast';
import { differenceInSeconds, parseISO } from 'date-fns';

interface Subject {
  id: string;
  code: string;
  name: string;
}

export function LecturerGenerateOTP() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSubjectId = searchParams.get('subject') || '';
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [loading, setLoading] = useState(true);
  
  const [generating, setGenerating] = useState(false);
  const [activeOtp, setActiveOtp] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [presentStudents, setPresentStudents] = useState<any[]>([]);
  const [absentStudents, setAbsentStudents] = useState<any[]>([]);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await apiClient('/api/lecturer/subjects', { token: session?.access_token });
        setSubjects(data);
        if (data.length > 0 && !selectedSubject) {
          setSelectedSubject(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };
    if (session?.access_token) fetchSubjects();
  }, [session]);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && activeOtp) {
      setActiveOtp(null);
      setActiveSessionId(null);
    }
  }, [timeLeft, activeOtp]);

  // Poll for live session data
  useEffect(() => {
    if (!activeSessionId || timeLeft === 0) return;
    
    const fetchLiveSession = async () => {
      try {
        const data = await apiClient(`/api/lecturer/otp-sessions/${activeSessionId}/live`, { 
          token: session?.access_token 
        });
        setPresentStudents(data.present);
        setAbsentStudents(data.absent);
      } catch (err) {
        console.error('Failed to fetch live session data', err);
      }
    };

    fetchLiveSession(); // Initial fetch
    const poll = setInterval(fetchLiveSession, 3000);
    return () => clearInterval(poll);
  }, [activeSessionId, timeLeft]);

  const handleGenerate = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setGenerating(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGenerating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await apiClient('/api/lecturer/otp/generate', {
            method: 'POST',
            body: {
              subjectId: selectedSubject,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            token: session?.access_token
          });
          
          setActiveOtp(data.otp);
          setActiveSessionId(data.otpSessionId);
          const seconds = differenceInSeconds(parseISO(data.expiresAt), new Date());
          setTimeLeft(Math.max(0, seconds));
          toast.success('Session started successfully!');
        } catch (err: any) {
          toast.error(err.message || 'Failed to generate OTP');
        } finally {
          setGenerating(false);
        }
      },
      (err) => {
        setGenerating(false);
        toast.error('Could not get your location. Please enable location permissions.');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-[#8ce0a3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Generate OTP</h1>
        <p className="text-sm text-gray-500 mt-1">Start a secure, location-verified attendance session</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-50">
        
        {activeOtp ? (
          // ACTIVE SESSION VIEW
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Session Live
            </div>
            
            <p className="text-sm text-gray-500 font-medium mb-4 uppercase tracking-widest">Share this code with students</p>
            
            {/* The giant OTP display */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-10">
              <div className="flex gap-4">
                {activeOtp.split('').map((digit, idx) => (
                  <div key={idx} className="w-16 h-24 sm:w-20 sm:h-28 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl font-bold text-gray-900 shadow-inner">
                    {digit}
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
                <QRCode 
                  value={JSON.stringify({ otp: activeOtp })} 
                  size={160} 
                  level="H"
                  className="mx-auto"
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 text-center">Scan with SAMS App</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
                <Clock className="w-6 h-6 text-[#406874]" />
                <div className="text-left">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Time Remaining</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-[#8ce0a3]/10 px-6 py-4 rounded-2xl border border-[#8ce0a3]/20">
                <MapPin className="w-6 h-6 text-[#8ce0a3]" />
                <div className="text-left">
                  <p className="text-xs text-[#8ce0a3] font-medium uppercase tracking-wider">Location Status</p>
                  <p className="text-lg font-semibold text-gray-900">GPS Locked</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-8">
              The session will automatically expire and invalidate the OTP when the timer reaches zero.
            </p>

            {/* LIVE ABSENTEE TRACKING */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-8 border-t border-gray-100 pt-8">
              <div>
                <h3 className="font-semibold text-green-700 flex items-center gap-2 mb-4 bg-green-50 p-2 rounded-xl border border-green-100">
                  <CheckCircle2 className="w-5 h-5" /> Checked In ({presentStudents.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {presentStudents.length === 0 ? (
                    <p className="text-sm text-gray-400">Waiting for students...</p>
                  ) : (
                    presentStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-gray-500 text-xs">{student.regNo}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-500 flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-xl border border-gray-200">
                  <XCircle className="w-5 h-5" /> Pending/Absent ({absentStudents.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 opacity-70">
                  {absentStudents.length === 0 ? (
                    <p className="text-sm text-gray-400">Everyone checked in!</p>
                  ) : (
                    absentStudents.map(student => (
                      <div key={student.id} className="border border-dashed border-gray-200 rounded-lg p-3 text-sm">
                        <p className="font-medium text-gray-700">{student.name}</p>
                        <p className="text-gray-500 text-xs">{student.regNo}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // SETUP VIEW
          <div className="max-w-md mx-auto">
            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl mb-8 border border-blue-100">
              <Navigation className="w-5 h-5 text-[#406874] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#406874] mb-1">GPS Capture Required</p>
                <p className="text-xs text-[#406874]/80">
                  Your location will be recorded as the center point for this session. Students must be within a 100-meter radius to mark attendance.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#8ce0a3]/30 focus:border-[#8ce0a3] transition-all appearance-none"
                >
                  <option value="" disabled>-- Select a subject --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || subjects.length === 0}
                className="w-full py-4 bg-[#406874] hover:bg-[#32525c] disabled:bg-gray-300 text-white text-base font-semibold rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <MapPin className="w-5 h-5 animate-bounce" />
                    Locking GPS Coordinates...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Generate OTP
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
