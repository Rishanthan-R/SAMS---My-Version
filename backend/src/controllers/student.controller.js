import { supabaseAdmin } from '../config/supabase.js';
import { calculateDistance } from '../utils/geo.js';
import crypto from 'crypto';

export const studentController = {
  /**
   * GET /api/student/dashboard
   * Returns dashboard summary statistics for the logged-in student
   */
  async getDashboardStats(req, res) {
    try {
      const studentId = req.user.id;

      // 1. Get total enrolled subjects
      const { count: enrolledCount, error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId);

      if (enrollError) throw enrollError;

      // 2. Get attendance records to calculate percentage
      const { data: attendanceData, error: attendanceError } = await supabaseAdmin
        .from('attendance')
        .select('status')
        .eq('student_id', studentId);

      if (attendanceError) throw attendanceError;

      const totalSessions = attendanceData.length;
      const presentSessions = attendanceData.filter(a => a.status === 'present').length;
      const attendancePercentage = totalSessions === 0 
        ? 0 
        : Math.round((presentSessions / totalSessions) * 100);

      // 3. Get recent sessions (last 5)
      const { data: recentSessions, error: recentError } = await supabaseAdmin
        .from('attendance')
        .select(`
          id,
          status,
          marked_at,
          sessions (
            session_date,
            subjects (code, name)
          )
        `)
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Clean up nested data for frontend
      const formattedRecent = recentSessions.map(session => ({
        id: session.id,
        status: session.status,
        date: session.sessions?.session_date || session.marked_at,
        subjectCode: session.sessions?.subjects?.code || 'N/A',
        subjectName: session.sessions?.subjects?.name || 'N/A'
      }));

      return res.status(200).json({
        totalEnrolled: enrolledCount || 0,
        attendancePercentage,
        recentSessions: formattedRecent
      });
    } catch (err) {
      console.error('Error fetching student dashboard stats:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  },

  /**
   * GET /api/student/subjects/available
   * Returns active subjects that the student is NOT currently enrolled in
   */
  async getAvailableSubjects(req, res) {
    try {
      const studentId = req.user.id;

      // For simplicity, we just fetch all active subjects and filter out enrolled ones
      // In a real app, this should be scoped by the current active semester
      const { data: activeSemesters } = await supabaseAdmin
        .from('semesters')
        .select('id')
        .eq('is_active', true)
        .single();
        
      if (!activeSemesters) {
        return res.status(200).json([]);
      }

      // Get student's current enrollments
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('subject_id')
        .eq('student_id', studentId)
        .eq('semester_id', activeSemesters.id);

      const enrolledSubjectIds = enrollments ? enrollments.map(e => e.subject_id) : [];

      // Get all active subjects
      let query = supabaseAdmin
        .from('subjects')
        .select(`
          id, code, name, credits, year_of_study, semester,
          subject_lecturers (
            profiles (full_name)
          )
        `)
        .eq('is_active', true);

      const { data: subjects, error } = await query;
      if (error) throw error;

      // Filter out enrolled subjects and format response
      const availableSubjects = subjects
        .filter(sub => !enrolledSubjectIds.includes(sub.id))
        .map(sub => ({
          id: sub.id,
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          lecturerName: sub.subject_lecturers && sub.subject_lecturers.profiles 
            ? sub.subject_lecturers.profiles.full_name 
            : 'Not Assigned'
        }));

      return res.status(200).json(availableSubjects);
    } catch (err) {
      console.error('Error fetching available subjects:', err);
      return res.status(500).json({ error: 'Failed to fetch available subjects' });
    }
  },

  /**
   * POST /api/student/enroll
   * Enrolls a student in a subject
   */
  async enrollSubject(req, res) {
    try {
      const { subjectId } = req.body;
      const studentId = req.user.id;

      if (!subjectId) {
        return res.status(400).json({ error: 'Subject ID is required' });
      }

      // Get current active semester
      const { data: activeSemester } = await supabaseAdmin
        .from('semesters')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!activeSemester) {
        return res.status(400).json({ error: 'No active semester found for enrollment' });
      }

      // Insert enrollment
      const { error } = await supabaseAdmin
        .from('enrollments')
        .insert({
          student_id: studentId,
          subject_id: subjectId,
          semester_id: activeSemester.id
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'Already enrolled in this subject' });
        }
        throw error;
      }

      return res.status(201).json({ message: 'Successfully enrolled in subject' });
    } catch (err) {
      console.error('Error enrolling in subject:', err);
      return res.status(500).json({ error: 'Failed to enroll in subject' });
    }
  },

  /**
   * GET /api/student/attendance
   * Returns full attendance history for the student
   */
  async getAttendanceHistory(req, res) {
    try {
      const studentId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('attendance')
        .select(`
          id,
          status,
          marked_at,
          subjects (code, name),
          sessions (session_date, total_present, total_enrolled)
        `)
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false });

      if (error) throw error;

      const history = data.map(record => ({
        id: record.id,
        status: record.status,
        date: record.sessions?.session_date || record.marked_at,
        subjectCode: record.subjects?.code || 'N/A',
        subjectName: record.subjects?.name || 'N/A',
        markedAt: record.marked_at
      }));

      return res.status(200).json(history);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
  },

  /**
   * POST /api/student/attendance/mark
   * Core logic: Validates OTP and GPS, marks attendance
   */
  async markAttendance(req, res) {
    try {
      const { otp, lat, lng } = req.body;
      const studentId = req.user.id;

      if (!otp || typeof otp !== 'string' || otp.length !== 6) {
        return res.status(400).json({ error: 'Valid 6-digit OTP is required' });
      }

      if (lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Location coordinates are required' });
      }

      // Hash the provided OTP (SHA-256) to match the DB
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

      // Find the active OTP session
      const { data: otpSession, error: sessionError } = await supabaseAdmin
        .from('otp_sessions')
        .select('*')
        .eq('otp_hash', hashedOtp)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !otpSession) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Check if student is actually enrolled in this subject
      // Assuming active semester for simplicity
      const { data: isEnrolled } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('subject_id', otpSession.subject_id)
        .single();
        
      if (!isEnrolled) {
        return res.status(403).json({ error: 'You are not enrolled in this subject' });
      }

      // Calculate GPS Distance
      const distance = calculateDistance(
        lat, lng, 
        otpSession.lecturer_lat, otpSession.lecturer_lng
      );

      const maxDistance = parseInt(process.env.PROXIMITY_THRESHOLD_METRES || '100', 10);

      if (distance > maxDistance) {
        return res.status(403).json({ 
          error: `Location verification failed. You are ${Math.round(distance)} meters away. Must be within ${maxDistance}m.`
        });
      }

      // Find the corresponding formal session
      const { data: formalSession, error: formalSessionError } = await supabaseAdmin
        .from('sessions')
        .select('id, total_present')
        .eq('otp_session_id', otpSession.id)
        .single();

      if (formalSessionError || !formalSession) {
        return res.status(500).json({ error: 'System error: Corresponding session not found' });
      }

      // Check if already marked
      const { data: existingAttendance } = await supabaseAdmin
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('otp_session_id', otpSession.id)
        .single();

      if (existingAttendance) {
        return res.status(400).json({ error: 'Attendance already marked for this session' });
      }

      // Insert Attendance Record
      const { error: markError } = await supabaseAdmin
        .from('attendance')
        .insert({
          student_id: studentId,
          subject_id: otpSession.subject_id,
          session_id: formalSession.id,
          otp_session_id: otpSession.id,
          status: 'present',
          student_lat: lat,
          student_lng: lng,
          distance_metres: distance
        });

      if (markError) throw markError;

      // Increment total_present in session
      await supabaseAdmin
        .from('sessions')
        .update({ total_present: formalSession.total_present + 1 })
        .eq('id', formalSession.id);

      return res.status(200).json({ 
        message: 'Attendance marked successfully!',
        distance: Math.round(distance)
      });
    } catch (err) {
      console.error('Error marking attendance:', err);
      return res.status(500).json({ error: 'Failed to mark attendance' });
    }
  }
};
