import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';
import env from '../../config/environment';
import { UnauthorizedError } from '../../shared/errors/AppError';

interface DbUserRow {
  id_usuario: number;
  nombre: string;
  email: string;
  hash_contrasena: string;
}

interface DbRoleRow {
  nombre_rol: string;
}

interface DbPermissionRow {
  codigo_permiso: string;
}

interface AuthUser {
  id_usuario: number;
  nombre: string;
  email: string;
  roles: string[];
  permisos: string[];
}

interface LoginResult {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface TokenPayload {
  id_usuario: number;
  email: string;
  roles: string[];
  permisos: string[];
  type: 'access' | 'refresh';
}

const getUserByEmail = async (email: string): Promise<DbUserRow | null> => {
  const rows = await sequelize.query<DbUserRow>(
    `
      SELECT TOP 1
        u.id_usuario,
        u.nombre,
        u.email,
        u.hash_contrasena
      FROM MR_USUARIO u
      WHERE u.email = :email
        AND u.activo = 1
        AND u.borrado = 0
    `,
    {
      replacements: { email },
      type: QueryTypes.SELECT,
    },
  );

  return rows[0] ?? null;
};

const getUserById = async (idUsuario: number): Promise<DbUserRow | null> => {
  const rows = await sequelize.query<DbUserRow>(
    `
      SELECT TOP 1
        u.id_usuario,
        u.nombre,
        u.email,
        u.hash_contrasena
      FROM MR_USUARIO u
      WHERE u.id_usuario = :idUsuario
        AND u.activo = 1
        AND u.borrado = 0
    `,
    {
      replacements: { idUsuario },
      type: QueryTypes.SELECT,
    },
  );

  return rows[0] ?? null;
};

const getRolesByUser = async (idUsuario: number): Promise<string[]> => {
  const rows = await sequelize.query<DbRoleRow>(
    `
      SELECT DISTINCT r.nombre_rol
      FROM MR_USUARIO_ROL ur
      INNER JOIN MR_ROL r ON r.id_rol = ur.id_rol
      WHERE ur.id_usuario = :idUsuario
        AND ur.borrado = 0
        AND r.borrado = 0
    `,
    {
      replacements: { idUsuario },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => row.nombre_rol);
};

const getPermissionsByUser = async (idUsuario: number): Promise<string[]> => {
  const rows = await sequelize.query<DbPermissionRow>(
    `
      SELECT DISTINCT p.codigo_permiso
      FROM MR_USUARIO_ROL ur
      INNER JOIN MR_ROL_PERMISO rp ON rp.id_rol = ur.id_rol
      INNER JOIN MR_PERMISO p ON p.id_permiso = rp.id_permiso
      WHERE ur.id_usuario = :idUsuario
        AND ur.borrado = 0
        AND rp.borrado = 0
        AND p.borrado = 0
    `,
    {
      replacements: { idUsuario },
      type: QueryTypes.SELECT,
    },
  );

  return rows.map((row) => row.codigo_permiso);
};

const buildAuthUser = async (idUsuario: number): Promise<AuthUser> => {
  const user = await getUserById(idUsuario);
  if (!user) {
    throw new UnauthorizedError('Usuario no válido o inactivo');
  }

  const [roles, permisos] = await Promise.all([
    getRolesByUser(idUsuario),
    getPermissionsByUser(idUsuario),
  ]);

  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    roles,
    permisos,
  };
};

const signAccessToken = (user: AuthUser): string => {
  const payload: TokenPayload = {
    id_usuario: user.id_usuario,
    email: user.email,
    roles: user.roles,
    permisos: user.permisos,
    type: 'access',
  };

  const options: SignOptions = {
    expiresIn: env.jwt.accessExpires as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.accessSecret, options);
};

const signRefreshToken = (user: AuthUser): string => {
  const payload: TokenPayload = {
    id_usuario: user.id_usuario,
    email: user.email,
    roles: user.roles,
    permisos: user.permisos,
    type: 'refresh',
  };

  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpires as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwt.refreshSecret, options);
};

const validatePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const userDb = await getUserByEmail(email);
  if (!userDb) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const passwordOk = await validatePassword(password, userDb.hash_contrasena);
  if (!passwordOk) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const user = await buildAuthUser(userDb.id_usuario);

  await sequelize.query(
    `
      UPDATE MR_USUARIO
      SET ultimo_login = GETDATE(),
          usuario_actualiza = :usuario,
          fecha_actualiza = GETDATE()
      WHERE id_usuario = :idUsuario
    `,
    {
      replacements: { idUsuario: user.id_usuario, usuario: user.email },
      type: QueryTypes.UPDATE,
    },
  );

  return {
    access_token: signAccessToken(user),
    refresh_token: signRefreshToken(user),
    user,
  };
};

export const refresh = async (refreshToken: string): Promise<LoginResult> => {
  let decoded: JwtPayload & TokenPayload;

  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret) as JwtPayload & TokenPayload;
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado');
  }

  if (decoded.type !== 'refresh' || !decoded.id_usuario) {
    throw new UnauthorizedError('Refresh token inválido');
  }

  const user = await buildAuthUser(decoded.id_usuario);

  return {
    access_token: signAccessToken(user),
    refresh_token: signRefreshToken(user),
    user,
  };
};

export const getProfile = async (idUsuario: number): Promise<AuthUser> => {
  return buildAuthUser(idUsuario);
};

export const logout = async (): Promise<void> => {
  // JWT stateless: el cierre de sesión ocurre eliminando tokens en cliente.
  // Si se requiere revocación fuerte, implementar tabla de sesiones/blacklist.
  return Promise.resolve();
};
