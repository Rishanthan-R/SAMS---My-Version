import { supabaseAdmin } from '../config/supabase.js';

/**
 * Auth Middleware — Verifies the JWT token from the Authorization header.
 * Attaches req.user with { id, email, role } on success.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Fetch the user's profile to get their role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, is_active, deleted_at, department, year_of_study')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    // Check if user is active
    if (!profile.is_active || profile.deleted_at) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact your administrator.' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      full_name: profile.full_name,
      department: profile.department,
      year_of_study: profile.year_of_study,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}
