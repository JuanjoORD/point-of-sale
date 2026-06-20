import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface UserJwtPayload extends JwtPayload {
      id_usuario: number;
      email: string;
      roles: string[];
      permisos: string[];
      type: 'access' | 'refresh';
    }

    interface Request {
      user?: UserJwtPayload;
    }
  }
}

export {};
