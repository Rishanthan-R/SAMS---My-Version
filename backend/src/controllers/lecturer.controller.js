import { supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

export const lecturerController = {
  /**
   * GET /api/lecturer/dashboard
   * Returns dashboard stats and checks for an active OTP session
   */
  async getDashboardStats(req, res) {
    try {
      const lecturerId = req.user.id;

      // 1. Get assigned subjects count
      const { count: subjectsCount } = await supabaseAdmin
        .from('subject_lecturers')
        .select('*', { count: 'exact', head: true })
        .eq('lecturer_id', lecturerId);

      // 2. Get total sessions conducted
      const { count: sessionsCount } = await supabaseAdmin
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('lecturer_id', lecturerId);

      // 3. Check for active OTP session
      const { data: activeSession } = await supabaseAdmin
        .from('otp_sessions')
        .select('id, expires_at, subject_id, subjects(code, name)')
        .eq('lecturer_id', lecturerId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 4. Get recent sessions
      const { data: recentSessions } = await supabaseAdmin
        .from('sessions')
        .select('id, session_date, total_enrolled, total_present, subjects(code, name)')
        .eq('lecturer_id', lecturerId)
        .order('session_date', { ascending: false })
        .limit(5);

      const formattedRecent = recentSessions ? recentSessions.map(s => ({
        id: s.id,
        date: s.session_date,
        subjectCode: s.subjects?.code,
        subjectName: s.subjects?.name,
        present: s.total_present,
        enrolled: s.total_enrolled
      })) : [];

      return res.status(200).json({
        totalSubjects: subjectsCount || 0,
        totalSessions: sessionsCount || 0,
        activeSession: activeSession ? {
          id: activeSession.id,
          subjectCode: activeSession.subjects?.code,
          subjectName: activeSession.subjects?.name,
          expiresAt: activeSession.expires_at
        } : null,
        recentSessions: formattedRecent
      });
    } catch (err) {
      console.error('Error fetching lecturer dashboard stats:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  },

  /**
   * GET /api/lecturer/subjects
   * Returns subjects assigned to the lecturer
   */
  async getMySubjects(req, res) {
    try {
      const lecturerId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('subject_lecturers')
        .select(`
          subjects (id, code, name, credits, year_of_study, semester)
        `)
        .eq('lecturer_id', lecturerId)
        .eq('subjects.is_active', true);

      if (error) throw error;

      // Flatten response
      const subjects = data
        .filter(item => item.subjects !== null)
        .map(item => item.subjects);

      return res.status(200).json(subjects);
    } catch (err) {
      console.error('Error fetching lecturer subjects:', err);
      return res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  },

  /**
   * POST /api/lecturer/otp/generate
   * Generates a secure OTP, logs lecturer's GPS, and opens a session
   */
  async generateOTP(req, res) {
    try {
      const { subjectId, lat, lng } = req.body;
      const lecturerId = req.user.id;

      if (!subjectId || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: 'Subject ID and coordinates are required' });
      }

      // Verify assignment
      const { data: assignment } = await supabaseAdmin
        .from('subject_lecturers')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('lecturer_id', lecturerId)
        .single();

      if (!assignment) {
        return res.status(403).json({ error: 'Not assigned to this subject' });
      }

      // Invalidate any existing active OTPs for this lecturer
      await supabaseAdmin
        .from('otp_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('lecturer_id', lecturerId)
        .eq('is_active', true);

      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

      // Calculate expiry (default 10 minutes)
      const validityMinutes = parseInt(process.env.OTP_VALIDITY_MINUTES || '10', 10);
      const expiresAt = new Date(Date.now() + validityMinutes * 60000).toISOString();

      // Create OTP session
      const { data: otpSession, error: otpError } = await supabaseAdmin
        .from('otp_sessions')
        .insert({
          subject_id: subjectId,
          lecturer_id: lecturerId,
          otp_hash: otpHash,
          lecturer_lat: lat,
          lecturer_lng: lng,
          expires_at: expiresAt,
          is_active: true
        })
        .select()
        .single();

      if (otpError) throw otpError;

      // Get total enrolled for this subject
      const { count: enrolledCount } = await supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('subject_id', subjectId);

      // Create formal session record
      const { error: sessionError } = await supabaseAdmin
        .from('sessions')
        .insert({
          subject_id: subjectId,
          lecturer_id: lecturerId,
          otp_session_id: otpSession.id,
          total_enrolled: enrolledCount || 0,
          total_present: 0
        });

      if (sessionError) throw sessionError;

      // Return the plaintext OTP *once*
      return res.status(201).json({
        otp,
        expiresAt,
        message: 'OTP generated successfully'
      });
    } catch (err) {
      console.error('Error generating OTP:', err);
      return res.status(500).json({ error: 'Failed to generate OTP' });
    }
  },

  /**
   * GET /api/lecturer/sessions
   * Returns past sessions conducted by the lecturer
   */
  async getSessionHistory(req, res) {
    try {
      const lecturerId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('sessions')
        .select(`
          id,
          session_date,
          total_enrolled,
          total_present,
          subjects (code, name)
        `)
        .eq('lecturer_id', lecturerId)
        .order('session_date', { ascending: false });

      if (error) throw error;

      const history = data.map(s => ({
        id: s.id,
        date: s.session_date,
        subjectCode: s.subjects?.code,
        subjectName: s.subjects?.name,
        present: s.total_present,
        enrolled: s.total_enrolled
      }));

      return res.status(200).json(history);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  },

  /**
   * GET /api/lecturer/sessions/:id/attendance
   * Returns detailed attendance list for a specific session
   */
  async getSessionAttendance(req, res) {
    try {
      const { id } = req.params;
      const lecturerId = req.user.id;

      // Verify ownership
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from('sessions')
        .select('subject_id, subjects(code, name)')
        .eq('id', id)
        .eq('lecturer_id', lecturerId)
        .single();

      if (sessionError || !sessionData) {
        return res.status(403).json({ error: 'Session not found or access denied' });
      }

      // Get attendance records
      const { data: attendance, error: attError } = await supabaseAdmin
        .from('attendance')
        .select(`
          status,
          marked_at,
          distance_metres,
          profiles (full_name, reg_no)
        `)
        .eq('session_id', id);

      if (attError) throw attError;

      const formattedList = attendance.map(a => ({
        studentName: a.profiles?.full_name,
        regNo: a.profiles?.reg_no,
        status: a.status,
        timeMarked: a.marked_at,
        distance: Math.round(a.distance_metres || 0)
      }));

      return res.status(200).json({
        subject: sessionData.subjects,
        attendance: formattedList
      });
    } catch (err) {
      console.error('Error fetching session details:', err);
      return res.status(500).json({ error: 'Failed to fetch session details' });
    }
  }
};
