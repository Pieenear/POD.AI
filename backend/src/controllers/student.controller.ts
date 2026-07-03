import { Request, Response, NextFunction } from 'express';
import { StudentProfile } from '../models/student.model';
import { AiService } from '../services/ai.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { Job } from '../models/job.model';
import { Application } from '../models/application.model';
import { Interview } from '../models/interview.model';
import { Notice } from '../models/notice.model';

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

  /**
   * Lists active job openings with eligibility indicators.
   */
  public static async getJobsList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      // Retrieve student profile to evaluate GPAs and majors
      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      const jobs = await Job.find({ isActive: true }).populate('companyId', 'name logoUrl description website location').sort({ createdAt: -1 });

      const evaluatedJobs = jobs.map(job => {
        let isEligible = true;
        let ineligibleReason = '';

        if (profile) {
          const cgpa = profile.education?.[0]?.grade ? parseFloat(profile.education[0].grade) || 0 : 0;
          const branch = profile.education?.[0]?.fieldOfStudy || '';

          // 1. GPA Eligibility Check
          if (job.eligibility?.minCgpa > 0 && cgpa < job.eligibility.minCgpa) {
            isEligible = false;
            ineligibleReason = `Job requires CGPA ≥ ${job.eligibility.minCgpa}. Your CGPA is ${cgpa.toFixed(2)}.`;
          }

          // 2. Branch Eligibility Check
          const allowedBranches = job.eligibility?.allowedBranches || [];
          if (allowedBranches.length > 0 && !allowedBranches.some(b => branch.toLowerCase().includes(b.toLowerCase()))) {
            isEligible = false;
            ineligibleReason = `Branch restricted. Allowed: ${allowedBranches.join(', ')}. Your branch: ${branch || 'N/A'}`;
          }
        } else {
          isEligible = false;
          ineligibleReason = 'Please complete your student profile setup to check eligibility.';
        }

        return {
          ...job.toObject(),
          isEligible,
          ineligibleReason
        };
      }).filter(job => job.isEligible);

      res.status(200).json({
        success: true,
        data: { jobs: evaluatedJobs }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submits a student job application and calculates AI alignment relevance.
   */
  public static async submitApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { jobId } = req.body;
      if (!jobId) {
        throw new BadRequestError('Job ID is required.');
      }

      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!profile || profile.education.length === 0) {
        throw new BadRequestError('Complete your profile education details before applying.');
      }

      const job = await Job.findById(jobId);
      if (!job || !job.isActive) {
        throw new NotFoundError('Job opening is inactive or does not exist.');
      }

      // Check deadline
      if (new Date() > new Date(job.deadline)) {
        throw new BadRequestError('The application deadline for this job posting has passed.');
      }

      // Evaluate eligibility parameters
      const cgpa = profile.education?.[0]?.grade ? parseFloat(profile.education[0].grade) || 0 : 0;
      const branch = profile.education?.[0]?.fieldOfStudy || '';

      if (job.eligibility?.minCgpa > 0 && cgpa < job.eligibility.minCgpa) {
        throw new BadRequestError(`You do not meet the GPA criteria. Required: ${job.eligibility.minCgpa}, Your GPA: ${cgpa.toFixed(2)}`);
      }

      const allowedBranches = job.eligibility?.allowedBranches || [];
      if (allowedBranches.length > 0 && !allowedBranches.some(b => branch.toLowerCase().includes(b.toLowerCase()))) {
        throw new BadRequestError(`Your branch (${branch}) is not eligible for this role.`);
      }

      // Check for duplicate application
      const existingApp = await Application.findOne({ jobId, studentId: req.user.userId });
      if (existingApp) {
        throw new BadRequestError('You have already applied for this job listing.');
      }

      // Calculate AI alignment match score
      const matchResult = await AiService.evaluateJobAlignment(profile, job);

      const application = new Application({
        jobId,
        studentId: req.user.userId,
        status: 'applied',
        aiMatchScore: matchResult.score,
        aiMatchAnalysis: {
          strengths: matchResult.strengths,
          gaps: matchResult.gaps,
          recommendations: matchResult.recommendations
        },
        timeline: [
          { status: 'applied', comments: 'Application successfully received by the recruiter.' }
        ]
      });

      await application.save();

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: { application }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists job applications submitted by the current student.
   */
  public static async getApplicationsList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const applications = await Application.find({ studentId: req.user.userId })
        .populate({
          path: 'jobId',
          populate: { path: 'companyId', select: 'name logoUrl description website location' }
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { applications }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists upcoming interviews scheduled for this student.
   */
  public static async getInterviewsList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const interviews = await Interview.find({ studentId: req.user.userId })
        .populate('jobId', 'title type salaryRange')
        .populate('companyId', 'name logoUrl')
        .sort({ date: 1 });

      res.status(200).json({
        success: true,
        data: { interviews }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves notices that match the student's target branches and audience filters.
   */
  public static async getNoticesList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      const notices = await Notice.find({ targetAudience: { $in: ['all', 'students'] } })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

      const eligibleNotices = notices.filter(notice => {
        if (profile && notice.targetBranches && notice.targetBranches.length > 0) {
          const studentBranch = profile.education?.[0]?.fieldOfStudy || '';
          return notice.targetBranches.some(b => studentBranch.toLowerCase().includes(b.toLowerCase()));
        }
        return true;
      });

      res.status(200).json({
        success: true,
        data: { notices: eligibleNotices }
      });
    } catch (error) {
      next(error);
    }
  }
}
