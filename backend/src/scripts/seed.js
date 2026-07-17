import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // ==========================================
    // 1. Create Users (Admin, Lecturer, Student)
    // ==========================================
    console.log('Creating users...');
    const users = [
      {
        email: 'admin@sams.lk',
        password: 'Password123!',
        role: 'admin',
        full_name: 'System Administrator',
        phone: '0711111111',
      },
      {
        email: 'lecturer@sams.lk',
        password: 'Password123!',
        role: 'lecturer',
        full_name: 'Dr. John Doe',
        staff_id: 'L001',
        department: 'Computer Science',
        phone: '0722222222',
      },
      {
        email: 'student@sams.lk',
        password: 'Password123!',
        role: 'student',
        full_name: 'Jane Smith',
        reg_no: 'S2023001',
        year_of_study: 3,
        semester: 1,
        department: 'Software Engineering',
        phone: '0733333333',
      },
    ];

    const createdUsers = {};

    for (const u of users) {
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`Failed to create ${u.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created auth user: ${u.email}`);
      createdUsers[u.role] = authData.user.id;

      // Create profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: authData.user.id,
        role: u.role,
        full_name: u.full_name,
        email: u.email,
        staff_id: u.staff_id,
        reg_no: u.reg_no,
        year_of_study: u.year_of_study,
        semester: u.semester,
        department: u.department,
        phone: u.phone,
        is_active: true,
      });

      if (profileError) {
        console.error(`Failed to create profile for ${u.email}:`, profileError.message);
      }
    }

    // ==========================================
    // 2. Create Semesters
    // ==========================================
    console.log('\nCreating semesters...');
    const { data: semester, error: semError } = await supabaseAdmin
      .from('semesters')
      .insert({
        label: '2026/2027 Semester 1',
        year_of_study: 3,
        semester_number: 1,
        start_date: '2026-08-01',
        enrollment_deadline: '2026-08-15',
        end_date: '2026-12-15',
        is_active: true,
      })
      .select()
      .single();

    if (semError) console.error('Failed to create semester:', semError.message);
    else console.log(`✅ Created active semester: ${semester.label}`);

    // ==========================================
    // 3. Create Subjects
    // ==========================================
    console.log('\nCreating subjects...');
    const { data: subject, error: subError } = await supabaseAdmin
      .from('subjects')
      .insert({
        code: 'CS3101',
        name: 'Advanced Web Development',
        credits: 3,
        year_of_study: 3,
        semester: 1,
        is_active: true,
      })
      .select()
      .single();

    if (subError) console.error('Failed to create subject:', subError.message);
    else console.log(`✅ Created subject: ${subject.name}`);

    // ==========================================
    // 4. Assign Lecturer to Subject
    // ==========================================
    if (createdUsers['lecturer'] && subject) {
      console.log('\nAssigning lecturer to subject...');
      const { error: assignError } = await supabaseAdmin
        .from('subject_lecturers')
        .insert({
          subject_id: subject.id,
          lecturer_id: createdUsers['lecturer'],
        });
        
      if (assignError) console.error('Failed to assign lecturer:', assignError.message);
      else console.log('✅ Lecturer assigned to subject');
    }

    console.log('\n🎉 Seeding complete! You can now log in with:');
    console.log('- admin@sams.lk / Password123!');
    console.log('- lecturer@sams.lk / Password123!');
    console.log('- student@sams.lk / Password123!');

  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
}

seedDatabase();
