/**
 * Role-based Authorization Middleware
 * Usage: authorize('admin'), authorize('lecturer', 'admin'), etc.
 * Must be used AFTER authenticate middleware.
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
  };
}
