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
        .eq('is_active', true) // Only active users
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
   * POST /api/admin/users/bulk
   * Creates multiple users at once
   */
  async bulkCreateUsers(req, res) {
    try {
      const { users } = req.body;
      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'Invalid user data provided' });
      }

      const results = { successful: 0, failed: 0, errors: [] };

      for (const u of users) {
        try {
          // 1. Create auth user
          const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: u.email,
            password: 'Password123!', // Default password
            email_confirm: true,
          });

          if (authError) throw authError;

          // 2. Create profile
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: authUser.user.id,
              role: u.role,
              full_name: u.fullName,
              email: u.email,
              reg_no: u.role === 'student' ? (u.regNo || null) : null,
              staff_id: u.role === 'lecturer' ? (u.staffId || null) : null,
              year_of_study: u.yearOfStudy ? parseInt(u.yearOfStudy) : null,
              department: u.department || null,
              semester: u.semester ? parseInt(u.semester) : null,
              is_active: true
            });

          if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            throw profileError;
          }

          results.successful++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Failed to create ${u.email}: ${err.message}`);
        }
      }

      return res.status(200).json({ 
        message: 'Bulk operation complete',
        ...results
      });
    } catch (err) {
      console.error('Error in bulk creation:', err);
      return res.status(500).json({ error: 'Failed to process bulk upload' });
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Soft deletes a user (sets is_active = false)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      return res.status(200).json({ message: 'User deactivated successfully' });
    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  /**
   * PUT /api/admin/users/:id
   * Updates an existing user's profile (email cannot be changed here)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { fullName, regNo, staffId, department, yearOfStudy, semester } = req.body;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: fullName,
          reg_no: regNo || null,
          staff_id: staffId || null,
          department: department || null,
          year_of_study: yearOfStudy || null,
          semester: semester || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ message: 'User updated successfully', user: data });
    } catch (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user' });
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
      const { label, yearOfStudy, semesterNumber, startDate, enrollmentDeadline, endDate, isActive, enrollmentOpen } = req.body;

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
          is_active: isActive || false,
          enrollment_open: enrollmentOpen || false
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
   * PUT /api/admin/semesters/:id
   */
  async updateSemester(req, res) {
    try {
      const { id } = req.params;
      const { label, yearOfStudy, semesterNumber, startDate, enrollmentDeadline, endDate, isActive, enrollmentOpen } = req.body;

      if (isActive) {
        await supabaseAdmin.from('semesters').update({ is_active: false }).neq('id', id);
      }

      const { data, error } = await supabaseAdmin
        .from('semesters')
        .update({
          label,
          year_of_study: yearOfStudy,
          semester_number: semesterNumber,
          start_date: startDate,
          enrollment_deadline: enrollmentDeadline,
          end_date: endDate,
          is_active: isActive || false,
          enrollment_open: enrollmentOpen || false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error updating semester:', err);
      return res.status(500).json({ error: 'Failed to update semester' });
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
      const { code, name, departments, credits, yearOfStudy, semester, lecturerId } = req.body;

      const { data: subject, error: subError } = await supabaseAdmin
        .from('subjects')
        .insert({
          code,
          name,
          departments: Array.isArray(departments) ? departments : [],
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
   * PUT /api/admin/subjects/:id
   */
  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const { code, name, departments, credits, yearOfStudy, semester, lecturerId } = req.body;

      const { data: subject, error: subError } = await supabaseAdmin
        .from('subjects')
        .update({
          code,
          name,
          departments: Array.isArray(departments) ? departments : [],
          credits,
          year_of_study: yearOfStudy,
          semester
        })
        .eq('id', id)
        .select()
        .single();

      if (subError) throw subError;

      // Update Lecturer Assignment (Delete existing, then insert if provided)
      await supabaseAdmin.from('subject_lecturers').delete().eq('subject_id', id);
      
      if (lecturerId) {
        await supabaseAdmin.from('subject_lecturers').insert({
          subject_id: id,
          lecturer_id: lecturerId
        });
      }

      return res.status(200).json(subject);
    } catch (err) {
      console.error('Error updating subject:', err);
      return res.status(500).json({ error: 'Failed to update subject' });
    }
  },

  /**
   * POST /api/admin/subjects/bulk
   * Creates multiple subjects at once
   */
  async bulkCreateSubjects(req, res) {
    try {
      const { subjects } = req.body;
      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ error: 'Invalid subject data provided' });
      }

      const results = { successful: 0, failed: 0, errors: [] };

      for (const s of subjects) {
        try {
          const { error: subError } = await supabaseAdmin
            .from('subjects')
            .insert({
              code: s.code,
              name: s.name,
              departments: s.departments || [],
              credits: s.credits ? parseInt(s.credits) : 3,
              year_of_study: s.yearOfStudy ? parseInt(s.yearOfStudy) : 1,
              semester: s.semester ? parseInt(s.semester) : 1,
              is_active: true
            });

          if (subError) throw subError;
          results.successful++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Failed to create ${s.code}: ${err.message}`);
        }
      }

      return res.status(200).json({ 
        message: 'Bulk operation complete',
        ...results
      });
    } catch (err) {
      console.error('Error in bulk subject creation:', err);
      return res.status(500).json({ error: 'Failed to process bulk upload' });
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
  },

  /**
   * DELETE /api/admin/subjects/:id
   * Hard delete a subject (fails if sessions exist due to FK)
   */
  async deleteSubject(req, res) {
    try {
      const { id } = req.params;
      const { error } = await supabaseAdmin
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') { // Foreign key constraint violation
          return res.status(400).json({ error: 'Cannot delete subject: it has existing sessions or enrollments.' });
        }
        throw error;
      }

      return res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (err) {
      console.error('Error deleting subject:', err);
      return res.status(500).json({ error: 'Failed to delete subject' });
    }
  },

  /**
   * GET /api/admin/subjects/:id/timetables
   */
  async getSubjectTimetables(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabaseAdmin
        .from('timetables')
        .select('*')
        .eq('subject_id', id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching timetables:', err);
      return res.status(500).json({ error: 'Failed to fetch timetables' });
    }
  },

  /**
   * POST /api/admin/subjects/:id/timetables
   * Overwrites existing timetables for the subject
   */
  async saveSubjectTimetables(req, res) {
    try {
      const { id } = req.params;
      const { timetables } = req.body;

      // Delete existing timetables
      await supabaseAdmin.from('timetables').delete().eq('subject_id', id);

      if (Array.isArray(timetables) && timetables.length > 0) {
        const payload = timetables.map(t => ({
          subject_id: id,
          day_of_week: parseInt(t.day_of_week),
          start_time: t.start_time,
          end_time: t.end_time
        }));

        const { error } = await supabaseAdmin.from('timetables').insert(payload);
        if (error) throw error;
      }

      return res.status(200).json({ message: 'Timetables saved successfully' });
    } catch (err) {
      console.error('Error saving timetables:', err);
      return res.status(500).json({ error: 'Failed to save timetables' });
    }
  },

  /**
   * POST /api/admin/promote-batch
   * Increments year_of_study for all active students.
   * If year_of_study becomes 5, sets is_active to false.
   * Resets semester to 1.
   * Deletes old enrollments.
   */
  async promoteBatch(req, res) {
    try {
      // Get all active students
      const { data: students, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, year_of_study')
        .eq('role', 'student')
        .eq('is_active', true);

      if (fetchError) throw fetchError;
      if (!students || students.length === 0) {
        return res.status(200).json({ message: 'No active students to promote.' });
      }

      let promotedCount = 0;
      let graduatedCount = 0;

      for (const student of students) {
        const currentYear = student.year_of_study || 1;
        const nextYear = currentYear + 1;

        if (nextYear > 4) {
          // Graduate them
          await supabaseAdmin
            .from('profiles')
            .update({ is_active: false })
            .eq('id', student.id);
          graduatedCount++;
        } else {
          // Promote them
          await supabaseAdmin
            .from('profiles')
            .update({ year_of_study: nextYear, semester: 1 })
            .eq('id', student.id);
          promotedCount++;
        }
      }

      // Delete old enrollments for all students
      // If we only want to delete for active students, we can do it by id
      const studentIds = students.map(s => s.id);
      if (studentIds.length > 0) {
        await supabaseAdmin
          .from('enrollments')
          .delete()
          .in('student_id', studentIds);
      }

      return res.status(200).json({
        message: 'Batch promotion completed successfully.',
        promoted: promotedCount,
        graduated: graduatedCount
      });

    } catch (err) {
      console.error('Error in batch promotion:', err);
      return res.status(500).json({ error: 'Failed to promote batch' });
    }
  }
};
