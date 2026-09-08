import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthTokenPayload, UserRole } from '../types/index.js';
import { db } from '../database/db.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload & { fullUser?: any };
}

const JWT_SECRET = process.env.JWT_SECRET || 'aktipan_super_secret_jwt_key_2026_production_grade';

export function extractToken(req: Request): string | null {
  // 1. Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1].trim();
  }

  // 2. Cookie header: aktipan_auth_token=<token> or aktipan_token=<token>
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:aktipan_auth_token|aktipan_token)=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  // 3. Optional query parameter (e.g. for downloads/media or initial websocket handshake)
  if (typeof req.query.token === 'string' && req.query.token) {
    return req.query.token.trim();
  }

  return null;
}

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan. Harap login terlebih dahulu.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    
    // Check if user still exists in database and is active
    const user = db.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Pengguna dengan token ini sudah tidak terdaftar.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan oleh administrator.'
      });
      return;
    }

    req.user = {
      ...decoded,
      role: user.role, // Always use fresh role from DB
      name: user.name,
      fullUser: user
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Sesi login Anda telah berakhir. Harap login kembali.'
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Token autentikasi tidak valid atau telah kadaluarsa.'
    });
    return;
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = db.getUserById(decoded.userId);
    if (user && user.isActive) {
      req.user = {
        ...decoded,
        role: user.role,
        name: user.name,
        fullUser: user
      };
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan untuk mengakses fitur ini.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak. Fitur ini hanya dapat diakses oleh peran: ${allowedRoles.join(', ')}.`
      });
      return;
    }

    next();
  };
}
