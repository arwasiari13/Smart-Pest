import { NextFunction, Request, Response } from 'express';
import { firebaseAuth, firebaseReady } from '../config/firebase';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  // Development fallback: no token → use demo farmer (allows Quick Demo without login)
  if (!token && env.NODE_ENV !== 'production') {
    req.user = { id: 'demo-farmer-uid-001', role: 'FARMER', email: 'demo@smartpest.local' };
    return next();
  }

  if (!token) return next(new ApiError(401, 'Missing bearer token'));
  if (!firebaseAuth) return next(new ApiError(503, 'Firebase not configured'));

  firebaseAuth
    .verifyIdToken(token)
    .then((decoded) => {
      req.user = {
        id: decoded.uid,
        role: (decoded['role'] as string) ?? 'FARMER',
        email: decoded.email ?? '',
      };
      next();
    })
    .catch(() => next(new ApiError(401, 'Invalid or expired Firebase ID token')));
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Unauthenticated'));
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}
