import { supabaseAdmin } from '../config/supabase.js';

/**
 * Auth Service — handles authentication business logic via Supabase
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Fetch user profile for role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    if (!profile.is_active || profile.deleted_at) {
      throw new Error('Your account has been deactivated. Please contact your administrator.');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        full_name: profile.full_name,
        year_of_study: profile.year_of_study,
        semester: profile.semester,
      },
      session: data.session,
    };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password reset email sent' };
  },

  /**
   * Update user password
   */
  async updatePassword(userId, newPassword) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Password updated successfully' };
  },

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('Profile not found');
    }

    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
