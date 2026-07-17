import { supabaseAdmin } from '../config/supabase.js';

export const adminController = {
  /**
   * GET /api/admin/dashboard
   */
  async getDashboardStats(req, res) {
    try {
      const { count: studentCount } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: lecturerCount } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'lecturer');

      const { count: subjectCount } = await supabaseAdmin
        .from('subjects')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: activeSemester } = await supabaseAdmin
        .from('semesters')
        .select('label')
        .eq('is_active', true)
        .single();

      return res.status(200).json({
        totalStudents: studentCount || 0,
        totalLecturers: lecturerCount || 0,
        totalSubjects: subjectCount || 0,
        activeSemester: activeSemester?.label || 'None'
      });
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers(req, res) {
    try {
      const { role } = req.query; // 'student' or 'lecturer'
      
      let query = supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('role', 'admin') // don't list admins
        .order('created_at', { ascending: false });
        
      if (role) {
        query = query.eq('role', role);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  /**
   * POST /api/admin/users
   * Creates a user in auth.users and then inserts their profile
   */
  async createUser(req, res) {
    try {
      const { email, password, role, fullName, regNo, staffId, department, yearOfStudy, semester } = req.body;

      if (!email || !role || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // 1. Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: password || 'Password123!',
        email_confirm: true,
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // 2. Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          role,
          full_name: fullName,
          email,
          reg_no: role === 'student' ? regNo : null,
          staff_id: role === 'lecturer' ? staffId : null,
          department,
          year_of_study: yearOfStudy,
          semester,
          is_active: true
        });

      if (profileError) {
        // Rollback auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        throw profileError;
      }

      return res.status(201).json({ message: 'User created successfully', user: authUser.user });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  },

  /**
   * GET /api/admin/semesters
   */
  async getSemesters(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('semesters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching semesters:', err);
      return res.status(500).json({ error: 'Failed to fetch semesters' });
    }
  },

  /**
   * POST /api/admin/semesters
   */
  async createSemester(req, res) {
    try {
      const { label, yearOfStudy, semesterNumber, startDate, enrollmentDeadline, endDate, isActive } = req.body;

      if (isActive) {
        // Deactivate all other semesters if this one is active
        await supabaseAdmin.from('semesters').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const { data, error } = await supabaseAdmin
        .from('semesters')
        .insert({
          label,
          year_of_study: yearOfStudy,
          semester_number: semesterNumber,
          start_date: startDate,
          enrollment_deadline: enrollmentDeadline,
          end_date: endDate,
          is_active: isActive || false
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (err) {
      console.error('Error creating semester:', err);
      return res.status(500).json({ error: 'Failed to create semester' });
    }
  },

  /**
   * GET /api/admin/subjects
   */
  async getSubjects(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('subjects')
        .select(`
          *,
          subject_lecturers(
            lecturer_id,
            profiles(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten structure
      const subjects = data.map(sub => ({
        ...sub,
        lecturer: sub.subject_lecturers ? sub.subject_lecturers.profiles?.full_name : null,
        lecturer_id: sub.subject_lecturers ? sub.subject_lecturers.lecturer_id : null
      }));

      return res.status(200).json(subjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      return res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  },

  /**
   * POST /api/admin/subjects
   */
  async createSubject(req, res) {
    try {
      const { code, name, credits, yearOfStudy, semester, lecturerId } = req.body;

      const { data: subject, error: subError } = await supabaseAdmin
        .from('subjects')
        .insert({
          code,
          name,
          credits,
          year_of_study: yearOfStudy,
          semester,
          is_active: true
        })
        .select()
        .single();

      if (subError) throw subError;

      if (lecturerId) {
        await supabaseAdmin.from('subject_lecturers').insert({
          subject_id: subject.id,
          lecturer_id: lecturerId
        });
      }

      return res.status(201).json(subject);
    } catch (err) {
      console.error('Error creating subject:', err);
      return res.status(500).json({ error: 'Failed to create subject' });
    }
  },

  /**
   * GET /api/admin/lecturers
   * Helper to get a dropdown list of lecturers for assignment
   */
  async getLecturersList(req, res) {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, staff_id')
        .eq('role', 'lecturer')
        .eq('is_active', true);

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch lecturers' });
    }
  }
};
