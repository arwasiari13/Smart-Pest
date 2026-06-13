declare global {
  namespace Express {
    interface User {
      id: string;    // Firebase UID
      role: string;  // 'ADMIN' | 'FARMER'
      email: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
