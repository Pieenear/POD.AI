import { Request, Response, NextFunction } from 'express';
import { StudentProfile } from '../models/student.model';
import { AiService } from '../services/ai.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export class StudentController {
  /**
   * Retrieves the student's profile. Creates a default one if it does not exist.
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      let profile = await StudentProfile.findOne({ userId: req.user.userId });
      
      // Auto-create blank profile if first time accessing
      if (!profile) {
        profile = new StudentProfile({
          userId: req.user.userId,
          skills: [],
          education: [],
          experience: [],
          projects: [],
          certifications: [],
          resumeVersions: []
        });
        await profile.save();
      }

      res.status(200).json({
        success: true,
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates student profile fields and schedules an automatic AI re-evaluation.
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const {
        headline,
        bio,
        skills,
        education,
        experience,
        projects,
        certifications,
        github,
        linkedin,
        portfolio,
        codingProfiles
      } = req.body;

      let profile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!profile) {
        profile = new StudentProfile({ userId: req.user.userId });
      }

      // Update fields
      if (headline !== undefined) profile.headline = headline;
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = skills;
      if (education !== undefined) profile.education = education;
      if (experience !== undefined) profile.experience = experience;
      if (projects !== undefined) profile.projects = projects;
      if (certifications !== undefined) profile.certifications = certifications;
      if (github !== undefined) profile.github = github;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (portfolio !== undefined) profile.portfolio = portfolio;
      if (codingProfiles !== undefined) {
        profile.codingProfiles = {
          ...profile.codingProfiles,
          ...codingProfiles
        };
      }

      // Re-run AI analysis synchronously so the dashboard receives the updated score immediately
      const aiReviewResult = await AiService.analyzeProfile(profile);
      profile.aiReview = {
        ...aiReviewResult,
        reviewedAt: new Date()
      };

      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated and AI re-scored successfully.',
        data: { profile }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles resume uploads, saving version metadata.
   */
  public static async uploadResume(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      // If Multer received a file, store metadata.
      // In this setup, we support both a mock uploader payload or actual files.
      let fileUrl = '';
      let fileName = 'resume.pdf';

      if (req.file) {
        fileUrl = `/uploads/resumes/${req.file.filename}`;
        fileName = req.file.originalname;
      } else if (req.body.resumeUrl) {
        fileUrl = req.body.resumeUrl;
        fileName = req.body.fileName || 'resume.pdf';
      } else {
        throw new BadRequestError('No resume file or URL provided');
      }

      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!profile) {
        throw new NotFoundError('Student profile not found. Save profile first.');
      }

      const nextVersionNum = profile.resumeVersions.length + 1;
      const newVersion = {
        versionNumber: nextVersionNum,
        url: fileUrl,
        fileName,
        uploadedAt: new Date()
      };

      profile.resumeUrl = fileUrl;
      profile.resumeVersions.push(newVersion);

      // Re-run AI analysis
      const aiReviewResult = await AiService.analyzeProfile(profile);
      profile.aiReview = {
        ...aiReviewResult,
        reviewedAt: new Date()
      };

      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Resume version uploaded and scored.',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Explicitly triggers AI analysis.
   */
  public static async triggerAiReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      const aiReviewResult = await AiService.analyzeProfile(profile);
      profile.aiReview = {
        ...aiReviewResult,
        reviewedAt: new Date()
      };

      await profile.save();

      res.status(200).json({
        success: true,
        message: 'AI Profile analysis completed.',
        data: {
          aiReview: profile.aiReview
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
