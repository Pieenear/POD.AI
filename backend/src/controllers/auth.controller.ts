import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/jwt';
import { User } from '../models/user.model';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const user = await AuthService.register(name, email, password, role);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const { accessToken, refreshToken, user } = await AuthService.login(
        email,
        password,
        userAgent,
        ipAddress
      );

      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          accessToken,
          user
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new UnauthorizedError('Session expired. Please sign in again.');
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const { accessToken, refreshToken } = await AuthService.refreshSession(
        token,
        userAgent,
        ipAddress
      );

      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken
        }
      });
    } catch (error) {
      // Clear cookie if session is invalid to avoid stale cookies
      clearRefreshTokenCookie(res);
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (token) {
        await AuthService.logout(token);
      }

      clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string;
      if (!token) {
        throw new BadRequestError('Verification token is missing');
      }

      await AuthService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now log in.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.requestPasswordReset(email);

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, reset instructions have been sent.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully. You can now log in.'
      });
    } catch (error) {
      next(error);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const user = await User.findById(req.user.userId).select('-passwordHash');
      if (!user) {
        throw new UnauthorizedError('User session invalid');
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
