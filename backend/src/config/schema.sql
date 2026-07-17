-- =============================================================
-- SAMS — Smart Attendance Management System
-- Database Schema Migration
-- Version: 1.1 (Fixed RLS Recursion)
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lecturer', 'student')),
  full_name TEXT NOT NULL,
  reg_no TEXT,           -- Student registration number
  staff_id TEXT,         -- Lecturer staff ID
  email TEXT NOT NULL,
  year_of_study INTEGER CHECK (year_of_study BETWEEN 1 AND 4),
  semester INTEGER CHECK (semester BETWEEN 1 AND 2),
  department TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_year_semester ON profiles(year_of_study, semester);

-- =============================================================
-- 2. SEMESTERS
-- =============================================================
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,                    -- e.g., "2025/2026"
  year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
  semester_number INTEGER NOT NULL CHECK (semester_number BETWEEN 1 AND 2),
  start_date DATE NOT NULL,
  enrollment_deadline DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- 3. SUBJECTS
-- =============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,              -- e.g., "CS2101"
  name TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subjects_year_semester ON subjects(year_of_study, semester);

-- =============================================================
-- 4. SUBJECT–LECTURER ASSIGNMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS subject_lecturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_subject_lecturer UNIQUE (subject_id)  -- one lecturer per subject
);

CREATE INDEX idx_subject_lecturers_lecturer ON subject_lecturers(lecturer_id);

-- =============================================================
-- 5. ENROLLMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_enrollment UNIQUE (student_id, subject_id, semester_id)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_subject ON enrollments(subject_id);

-- =============================================================
-- 6. OTP SESSIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS otp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,                 -- SHA-256 hash of the 6-digit OTP
  lecturer_lat DOUBLE PRECISION NOT NULL,
  lecturer_lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_otp_sessions_subject_active ON otp_sessions(subject_id, is_active);

-- =============================================================
-- 7. SESSIONS (formal lecture session record)
-- =============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  lecturer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  otp_session_id UUID NOT NULL REFERENCES otp_sessions(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_enrolled INTEGER NOT NULL DEFAULT 0,
  total_present INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_subject ON sessions(subject_id);

-- =============================================================
-- 8. ATTENDANCE
-- =============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  otp_session_id UUID NOT NULL REFERENCES otp_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  student_lat DOUBLE PRECISION,
  student_lng DOUBLE PRECISION,
  distance_metres DOUBLE PRECISION,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_attendance UNIQUE (student_id, otp_session_id)  -- one mark per session
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_subject ON attendance(subject_id);
CREATE INDEX idx_attendance_session ON attendance(session_id);

-- =============================================================
-- 9. NOTIFICATIONS
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Security Definer Function to avoid infinite recursion
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_lecturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile; admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    get_my_role() = 'admin'
  );

CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    get_my_role() = 'admin'
  );

CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    get_my_role() = 'admin'
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Semesters: readable by all authenticated users
CREATE POLICY "Authenticated users can view semesters" ON semesters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage semesters" ON semesters
  FOR ALL USING (
    get_my_role() = 'admin'
  );

-- Subjects: readable by all authenticated users
CREATE POLICY "Authenticated users can view subjects" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    get_my_role() = 'admin'
  );

-- Subject-Lecturer: readable by all authenticated users
CREATE POLICY "Authenticated users can view assignments" ON subject_lecturers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage assignments" ON subject_lecturers
  FOR ALL USING (
    get_my_role() = 'admin'
  );

-- Enrollments: students can see own; lecturers can see for their subjects; admins see all
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can manage enrollments" ON enrollments
  FOR ALL USING (
    get_my_role() = 'admin'
  );

-- OTP Sessions: lecturers manage their own; students can read active ones
CREATE POLICY "Lecturers can manage own OTP sessions" ON otp_sessions
  FOR ALL USING (auth.uid() = lecturer_id);

CREATE POLICY "Students can view active OTP sessions" ON otp_sessions
  FOR SELECT USING (
    is_active = true AND
    get_my_role() = 'student'
  );

CREATE POLICY "Admins can view all OTP sessions" ON otp_sessions
  FOR SELECT USING (
    get_my_role() = 'admin'
  );

-- Sessions: readable by relevant parties
CREATE POLICY "Lecturers can manage own sessions" ON sessions
  FOR ALL USING (auth.uid() = lecturer_id);

CREATE POLICY "Authenticated users can view sessions" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Attendance: students see own; lecturers see for their subjects; admins see all
CREATE POLICY "Students can view own attendance" ON attendance
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all attendance" ON attendance
  FOR SELECT USING (
    get_my_role() = 'admin'
  );

-- Notifications: users see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);  -- backend uses service role key

-- =============================================================
-- REALTIME (enable for notifications)
-- =============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
