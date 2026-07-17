import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfiles() {
  const users = [
    { email: 'admin@sams.lk', role: 'admin', full_name: 'System Administrator', phone: '0711111111' },
    { email: 'lecturer@sams.lk', role: 'lecturer', full_name: 'Dr. John Doe', staff_id: 'L001', department: 'Computer Science', phone: '0722222222' },
    { email: 'student@sams.lk', role: 'student', full_name: 'Jane Smith', reg_no: 'S2023001', year_of_study: 3, semester: 1, department: 'Software Engineering', phone: '0733333333' }
  ];

  for (const u of users) {
    const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const user = existingUsers.find(e => e.email === u.email);

    if (user) {
      await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        role: u.role,
        full_name: u.full_name,
        email: u.email,
        staff_id: u.staff_id,
        reg_no: u.reg_no,
        year_of_study: u.year_of_study,
        semester: u.semester,
        department: u.department,
        phone: u.phone,
        is_active: true
      });
      console.log(`✅ Fixed profile for ${u.email}`);
    }
  }

  // Also fix subject_lecturers
  const { data: lecturerProfile } = await supabaseAdmin.from('profiles').select('id').eq('role', 'lecturer').single();
  const { data: subject } = await supabaseAdmin.from('subjects').select('id').eq('code', 'CS3101').single();
  
  if (lecturerProfile && subject) {
    await supabaseAdmin.from('subject_lecturers').upsert({
      subject_id: subject.id,
      lecturer_id: lecturerProfile.id
    });
    console.log('✅ Re-assigned lecturer to subject');
  }
}

fixProfiles();
