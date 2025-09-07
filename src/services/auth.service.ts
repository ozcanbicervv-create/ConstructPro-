import { randomBytes } from 'crypto';

import { User, UserRole } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { authenticator } from 'otplib';

import { prisma } from '@/utils/db';

export interface AuthResponse {
  user: Omit<User, 'password' | 'mfaSecret'>;
  accessToken: string;
  refreshToken: string;
  requiresMFA?: boolean;
}

export interface MFASetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  role?: UserRole;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export class AuthService {
  private static readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  // Role-based permissions for construction industry
  private static readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    ADMIN: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
      { resource: 'materials', actions: ['create', 'read', 'update', 'delete', 'order'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'approve', 'share'] },
      { resource: 'team', actions: ['read', 'assign', 'manage'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] },
      { resource: 'system', actions: ['configure', 'monitor', 'backup'] }
    ],
    PROJECT_MANAGER: [
      { resource: 'projects', actions: ['create', 'read', 'update', 'manage'] },
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'assign'] },
      { resource: 'materials', actions: ['create', 'read', 'update', 'order'] },
      { resource: 'documents', actions: ['create', 'read', 'update', 'approve', 'share'] },
      { resource: 'team', actions: ['read', 'assign', 'manage'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] }
    ],
    SITE_SUPERVISOR: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'tasks', actions: ['read', 'update', 'assign'] },
      { resource: 'materials', actions: ['read', 'update'] },
      { resource: 'documents', actions: ['create', 'read', 'update'] },
      { resource: 'team', actions: ['read', 'assign'] },
      { resource: 'reports', actions: ['create', 'read'] }
    ],
    WORKER: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'tasks', actions: ['read', 'update'] },
      { resource: 'materials', actions: ['read'] },
      { resource: 'documents', actions: ['read', 'create'] },
      { resource: 'reports', actions: ['read'] }
    ],
    CLIENT: [
      { resource: 'projects', actions: ['read'] },
      { resource: 'tasks', actions: ['read'] },
      { resource: 'documents', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ],
    SUPPLIER: [
      { resource: 'materials', actions: ['read', 'update'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'documents', actions: ['read', 'create'] }
    ]
  };

  /**
   * Authenticate user with email/password and optional MFA
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if MFA is enabled
    if (user.mfaEnabled && user.mfaSecret) {
      if (!credentials.mfaCode) {
        return {
          user: this.sanitizeUser(user),
          accessToken: '',
          refreshToken: '',
          requiresMFA: true
        };
      }

      const isValidMFA = authenticator.verify({
        token: credentials.mfaCode,
        secret: user.mfaSecret
      });

      if (!isValidMFA) {
        // Check backup codes
        const backupCodes = (user.backupCodes as string[]) || [];
        const isValidBackupCode = backupCodes.includes(credentials.mfaCode);
        
        if (!isValidBackupCode) {
          throw new Error('Invalid MFA code');
        }

        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter(code => code !== credentials.mfaCode);
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: updatedBackupCodes }
        });
      }
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastActive: new Date(),
        isOnline: true
      }
    });

    const tokens = this.generateTokens(user);
    
    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : userData.email,
        company: userData.company,
        title: userData.title,
        phone: userData.phone,
        role: userData.role || UserRole.WORKER
      }
    });

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens
    };
  }

  /**
   * Setup MFA for user
   */
  static async enableMFA(userId: string): Promise<MFASetupResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      randomBytes(4).toString('hex').toUpperCase()
    );

    // Generate QR code URL
    const qrCodeUrl = authenticator.keyuri(
      user.email,
      'ConstructPro',
      secret
    );

    // Save secret (but don't enable MFA yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        backupCodes: backupCodes
      }
    });

    return {
      secret,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify MFA setup and enable it
   */
  static async verifyMFA(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.mfaSecret) {
      throw new Error('MFA not set up');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret
    });

    if (isValid) {
      await prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true }
      });
    }

    return isValid;
  }

  /**
   * Disable MFA for user
   */
  static async disableMFA(userId: string, password: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.password) {
      throw new Error('User not found');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        backupCodes: []
      }
    });
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = verify(refreshToken, this.JWT_REFRESH_SECRET) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: false }
    });
  }

  /**
   * Check if user has permission for resource and action
   */
  static checkPermission(userRole: UserRole, resource: string, action: string): boolean {
    const permissions = this.ROLE_PERMISSIONS[userRole] || [];
    
    return permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }

  /**
   * Get all permissions for user role
   */
  static getUserPermissions(userRole: UserRole): Permission[] {
    return this.ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Generate JWT tokens
   */
  private static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = sign(payload, this.JWT_ACCESS_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY
    });

    const refreshToken = sign(
      { userId: user.id },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Remove sensitive fields from user object
   */
  private static sanitizeUser(user: User): Omit<User, 'password' | 'mfaSecret'> {
    const { password, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}