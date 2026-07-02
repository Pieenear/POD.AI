import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_PORT === 465,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS
      }
    });
  }

  public async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // Fallback fallback if credentials not fully configured
      if (!env.MAIL_USER || !env.MAIL_PASS || env.MAIL_USER === 'test_user') {
        logger.warn(`SMTP credentials not fully set. Simulated Email to: ${to}, Subject: ${subject}`);
        return true;
      }

      const info = await this.transporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject,
        html
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email to ${to}`, error);
      return false;
    }
  }

  public async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const url = `${env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #6366f1; margin-bottom: 20px; font-weight: 700; text-align: center;">Verify Your CareerFlow AI Account</h2>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Thank you for signing up for CareerFlow AI. Please click the button below to confirm your email and activate your account.</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${url}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 30px;">
          Or copy and paste this link into your browser: <br/>
          <a href="${url}" style="color: #6366f1; word-break: break-all;">${url}</a>
        </p>
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">If you didn't create a CareerFlow account, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendMail(to, 'Verify Your CareerFlow AI Account', html);
  }

  public async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const url = `${env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #6366f1; margin-bottom: 20px; font-weight: 700; text-align: center;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 16px; color: #334155; line-height: 1.6;">We received a request to reset the password for your CareerFlow AI account. Click the button below to choose a new password.</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${url}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;
    return this.sendMail(to, 'Reset Your CareerFlow AI Password', html);
  }
}

export const mailService = new MailService();
