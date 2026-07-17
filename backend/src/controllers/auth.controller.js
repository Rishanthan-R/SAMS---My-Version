import { authService } from '../services/auth.service.js';

/**
 * Auth Controller — handles HTTP request/response for auth endpoints
 */
export const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.signIn(email, password);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Login error:', err.message);
      return res.status(401).json({ error: err.message || 'Invalid credentials' });
    }
  },

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await authService.resetPassword(email);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Password reset error:', err.message);
      return res.status(500).json({ error: 'Failed to send password reset email' });
    }
  },

  /**
   * PUT /api/auth/update-password
   * Requires authentication
   */
  async updatePassword(req, res) {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const result = await authService.updatePassword(req.user.id, newPassword);
      return res.status(200).json(result);
    } catch (err) {
      console.error('Update password error:', err.message);
      return res.status(500).json({ error: 'Failed to update password' });
    }
  },

  /**
   * GET /api/auth/profile
   * Requires authentication
   */
  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return res.status(200).json(profile);
    } catch (err) {
      console.error('Get profile error:', err.message);
      return res.status(404).json({ error: 'Profile not found' });
    }
  },

  /**
   * PUT /api/auth/profile
   * Requires authentication
   */
  async updateProfile(req, res) {
    try {
      const { full_name, phone } = req.body;
      const updates = {};

      if (full_name) updates.full_name = full_name;
      if (phone !== undefined) updates.phone = phone;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const profile = await authService.updateProfile(req.user.id, updates);
      return res.status(200).json(profile);
    } catch (err) {
      console.error('Update profile error:', err.message);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  },
};
