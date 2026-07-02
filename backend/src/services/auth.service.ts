import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User, UserRole, IUserDocument } from '../models/user.model';
import { RefreshToken } from '../models/token.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { mailService } from './mail.service';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';

export class AuthService {
  /**
   * Registers a new user.
   */
  public static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<IUserDocument> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      name,
      email,
      passwordHash,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt
    });

    await user.save();

    // Send verification email in background (don't block response)
    mailService.sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error(`Failed to send verification email: ${err.message}`);
    });

    return user;
  }

  /**
   * Log in user, creating a new session token.
   */
  public static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Create session record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // We'll create a placeholder Mongo document to get a secure tokenId
    const session = new RefreshToken({
      userId: user._id,
      token: crypto.randomBytes(40).toString('hex'),
      expiresAt,
      userAgent,
      ipAddress,
      isRevoked: false
    });

    const dbToken = crypto.randomBytes(64).toString('hex');
    session.token = dbToken;
    await session.save();

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken(user._id.toString(), session.token);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    };
  }

  /**
   * Refreshes credentials using Token Rotation logic.
   */
  public static async refreshSession(
    oldToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(oldToken);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // 2. Lookup session in database
    const session = await RefreshToken.findOne({ token: decoded.tokenId, userId: decoded.userId });
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      // Security alarm: If token was already revoked, someone might have stolen it. Revoke all tokens for this user.
      if (session && session.isRevoked) {
        await RefreshToken.deleteMany({ userId: decoded.userId });
      }
      throw new UnauthorizedError('Invalid or expired refresh token session');
    }

    // 3. Lookup user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User session not found');
    }

    // 4. Rotate: Revoke/delete the old token and create a new one
    await session.deleteOne();

    const newDbToken = crypto.randomBytes(64).toString('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const newSession = new RefreshToken({
      userId: user._id,
      token: newDbToken,
      expiresAt: newExpiresAt,
      userAgent,
      ipAddress,
      isRevoked: false
    });
    await newSession.save();

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken(user._id.toString(), newSession.token);

    return { accessToken, refreshToken };
  }

  /**
   * Log out session.
   */
  public static async logout(token: string): Promise<void> {
    try {
      const decoded = verifyRefreshToken(token);
      await RefreshToken.deleteOne({ token: decoded.tokenId });
    } catch {
      // Fail silently for logout if token is already invalid
    }
  }

  /**
   * Verifies registration email.
   */
  public static async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestError('Verification token is invalid or has expired');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();
  }

  /**
   * Requests a password reset link.
   */
  public static async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal that the user does not exist. Just return.
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetExpires;
    await user.save();

    // Send reset email in background
    mailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      console.error(`Failed to send password reset email: ${err.message}`);
    });
  }

  /**
   * Resets password using token.
   */
  public static async resetPassword(token: string, password: string): Promise<void> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestError('Reset password link is invalid or has expired');
    }

    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
  }
}
