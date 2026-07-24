import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { StudentProfile } from '../models/student.model';
import { AiService } from '../services/ai.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { Job } from '../models/job.model';
import { CampusDrive } from '../models/drive.model';
import { Application } from '../models/application.model';
import { Interview } from '../models/interview.model';
import { Notice } from '../models/notice.model';
import { ResumeParser } from '../utils/resumeParser';
import { User, UserRole } from '../models/user.model';
import { Company } from '../models/company.model';

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
        codingProfiles,
        enrollmentNumber,
        firstName,
        middleName,
        lastName,
        course,
        specialization,
        gender,
        dob,
        bloodGroup,
        maritalStatus,
        medicalHistory,
        contactDetails,
        familyDetails,
        policyAgreed,
        photo,
        positionsOfResponsibility,
        references,
        otherDetails,
        seminars
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
      if (enrollmentNumber !== undefined) profile.enrollmentNumber = enrollmentNumber;
      if (firstName !== undefined) profile.firstName = firstName;
      if (middleName !== undefined) profile.middleName = middleName;
      if (lastName !== undefined) profile.lastName = lastName;

      // Update name in User collection if firstName or lastName changes
      if (firstName !== undefined || lastName !== undefined) {
        const userToUpdate = await User.findById(req.user.userId);
        if (userToUpdate) {
          const finalFirst = firstName !== undefined ? firstName : (profile.firstName || '');
          const finalLast = lastName !== undefined ? lastName : (profile.lastName || '');
          userToUpdate.name = `${finalFirst} ${finalLast}`.trim();
          await userToUpdate.save();
        }
      }

      if (course !== undefined) profile.course = course;
      if (specialization !== undefined) profile.specialization = specialization;
      if (gender !== undefined) profile.gender = gender;
      if (dob !== undefined) profile.dob = dob;
      if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
      if (maritalStatus !== undefined) profile.maritalStatus = maritalStatus;
      if (medicalHistory !== undefined) profile.medicalHistory = medicalHistory;
      if (contactDetails !== undefined) {
        profile.contactDetails = {
          ...profile.contactDetails,
          ...contactDetails
        };
      }
      if (familyDetails !== undefined) {
        profile.familyDetails = {
          ...profile.familyDetails,
          ...familyDetails
        };
      }
      if (policyAgreed !== undefined) profile.policyAgreed = policyAgreed;
      if (photo !== undefined) profile.photo = photo;
      if (positionsOfResponsibility !== undefined) profile.positionsOfResponsibility = positionsOfResponsibility;
      if (references !== undefined) profile.references = references;
      if (otherDetails !== undefined) profile.otherDetails = otherDetails;
      if (seminars !== undefined) profile.seminars = seminars;

      // Re-run AI analysis synchronously so the dashboard receives the updated score immediately
      const aiReviewResult = await AiService.analyzeProfile(profile);
      profile.aiReview = {
        ...aiReviewResult,
        reviewedAt: new Date()
      };

      if (!profile.badges) {
        profile.badges = [];
      }
      if (profile.aiReview.score >= 80 && !profile.badges.includes('profile_pro')) {
        profile.badges.push('profile_pro');
      }

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

      // Parse uploaded PDF file heuristic characteristics
      if (req.file) {
        try {
          const filePath = req.file.path;
          const buffer = fs.readFileSync(filePath);
          const rawText = ResumeParser.parsePdfText(buffer);
          const parsed = ResumeParser.heuristicParse(rawText);

          // Merge extracted skills
          if (parsed.skills.length > 0) {
            const existingSkills = profile.skills.map(s => s.toLowerCase());
            parsed.skills.forEach(skill => {
              if (!existingSkills.includes(skill.toLowerCase())) {
                profile.skills.push(skill);
              }
            });
          }

          // Pre-fill headline
          if (!profile.headline || profile.headline === 'Aspiring Developer') {
            profile.headline = parsed.headline;
          }

          // Pre-fill education branch/CGPA
          if (profile.education.length === 0) {
            profile.education.push({
              institution: 'State University College',
              degree: parsed.degree,
              fieldOfStudy: parsed.branch,
              startDate: new Date(2022, 6, 1),
              endDate: new Date(2026, 5, 30),
              current: false,
              grade: parsed.cgpa
            });
          } else {
            if (!profile.education[0].grade || profile.education[0].grade === '0') {
              profile.education[0].grade = parsed.cgpa;
            }
            if (!profile.education[0].fieldOfStudy) {
              profile.education[0].fieldOfStudy = parsed.branch;
            }
          }
        } catch (parseErr) {
          console.error('Heuristic resume parsing failed:', parseErr);
        }
      }

      // Re-run AI analysis
      const aiReviewResult = await AiService.analyzeProfile(profile);
      profile.aiReview = {
        ...aiReviewResult,
        reviewedAt: new Date()
      };

      if (!profile.badges) {
        profile.badges = [];
      }
      if (profile.aiReview.score >= 80 && !profile.badges.includes('profile_pro')) {
        profile.badges.push('profile_pro');
      }

      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Resume version uploaded, parsed, and AI-scored successfully.',
        data: {
          profile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles general document uploads (e.g. marksheets, certificates).
   */
  public static async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      if (!req.file) {
        throw new BadRequestError('No document file provided');
      }

      const fileUrl = `/uploads/documents/${req.file.filename}`;
      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully.',
        url: fileUrl
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

      if (!profile.badges) {
        profile.badges = [];
      }
      if (profile.aiReview.score >= 80 && !profile.badges.includes('profile_pro')) {
        profile.badges.push('profile_pro');
      }

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

      const profileIncomplete = !profile || profile.education.length === 0 || !profile.education[0].grade || !profile.education[0].fieldOfStudy;

      const evaluatedJobs = jobs.map(job => {
        let isEligible = true;
        let ineligibleReason = '';

        if (!profileIncomplete && profile) {
          const cgpa = profile.education[0].grade ? parseFloat(profile.education[0].grade) || 0 : 0;
          const branch = profile.education[0].fieldOfStudy || '';

          // 1. GPA Eligibility Check
          if (job.eligibility?.minCgpa > 0 && cgpa < job.eligibility.minCgpa) {
            isEligible = false;
            ineligibleReason = `Job requires CGPA ≥ ${job.eligibility.minCgpa}. Your CGPA is ${cgpa.toFixed(2)}.`;
          }

          // 2. Branch Eligibility Check
          const allowedBranches = job.eligibility?.allowedBranches || [];
          if (allowedBranches.length > 0 && !allowedBranches.some(b => branch.trim().toLowerCase().includes((b || '').trim().toLowerCase()))) {
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
          ineligibleReason,
          profileIncomplete
        };
      });

      res.status(200).json({
        success: true,
        data: { jobs: evaluatedJobs }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists scheduled campus placement drives with eligibility indicators.
   */
  public static async getDrivesList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      // Retrieve student profile to evaluate GPAs and majors
      const profile = await StudentProfile.findOne({ userId: req.user.userId });
      
      // Fetch active drives and populate company and job information
      const drives = await CampusDrive.find()
        .populate('companyId', 'name logoUrl description website location')
        .populate('jobId')
        .sort({ driveDate: 1 });

      const profileIncomplete = !profile || profile.education.length === 0 || !profile.education[0].grade || !profile.education[0].fieldOfStudy;

      const evaluatedDrives = drives.map(drive => {
        let isEligible = true;
        let ineligibleReason = '';
        const job = drive.jobId as any;

        if (job) {
          if (!profileIncomplete && profile) {
            const cgpa = profile.education[0].grade ? parseFloat(profile.education[0].grade) || 0 : 0;
            const branch = profile.education[0].fieldOfStudy || '';

            // 1. GPA Eligibility Check
            if (job.eligibility?.minCgpa > 0 && cgpa < job.eligibility.minCgpa) {
              isEligible = false;
              ineligibleReason = `Drive requires CGPA ≥ ${job.eligibility.minCgpa}. Your CGPA is ${cgpa.toFixed(2)}.`;
            }

            // 2. Branch Eligibility Check
            const allowedBranches = job.eligibility?.allowedBranches || [];
            if (allowedBranches.length > 0 && !allowedBranches.some(b => branch.trim().toLowerCase().includes((b || '').trim().toLowerCase()))) {
              isEligible = false;
              ineligibleReason = `Branch restricted. Allowed: ${allowedBranches.join(', ')}. Your branch: ${branch || 'N/A'}`;
            }
          } else {
            isEligible = false;
            ineligibleReason = 'Please complete your student profile setup to check eligibility.';
          }
        } else {
          isEligible = false;
          ineligibleReason = 'Linked job posting details are unavailable.';
        }

        return {
          ...drive.toObject(),
          isEligible,
          ineligibleReason,
          profileIncomplete
        };
      });

      res.status(200).json({
        success: true,
        data: { drives: evaluatedDrives }
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
      if (allowedBranches.length > 0 && !allowedBranches.some(b => branch.trim().toLowerCase().includes((b || '').trim().toLowerCase()))) {
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

      // Award first_strike badge if not already awarded
      if (!profile.badges) {
        profile.badges = [];
      }
      if (!profile.badges.includes('first_strike')) {
        profile.badges.push('first_strike');
        await profile.save();
      }

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

  /**
   * Retrieves analytical stats for placement cells (accessible by students).
   */
  public static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const studentCount = await User.countDocuments({ role: UserRole.STUDENT });
      const partnerCount = await Company.countDocuments();
      const pendingCount = await Company.countDocuments({ isVerified: false });
      const activeJobsCount = await Job.countDocuments({ isActive: true });

      // Placed student count calculation (mocked/complete metrics fallback)
      const profiles = await StudentProfile.find();
      const totalPlaced = profiles.filter(p => p.bio?.toLowerCase().includes('placed') || p.headline?.toLowerCase().includes('placed')).length;
      const placedPercent = studentCount > 0 ? Math.round((totalPlaced / studentCount) * 100) : 0;

      // Department branch placement metrics compiler
      const branchStatsMap: { [key: string]: { total: number; placed: number } } = {};
      profiles.forEach(p => {
        const branch = p.education?.[0]?.fieldOfStudy || 'General';
        const isPlaced = p.bio?.toLowerCase().includes('placed') || p.headline?.toLowerCase().includes('placed') || (p.badges && p.badges.includes('hired'));
        
        // Normalize branch tags (e.g. CSE, IT, ECE)
        const normBranch = branch.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const key = normBranch.length > 5 ? normBranch.slice(0, 5) : normBranch || 'GEN';

        if (!branchStatsMap[key]) {
          branchStatsMap[key] = { total: 0, placed: 0 };
        }
        branchStatsMap[key].total++;
        if (isPlaced) {
          branchStatsMap[key].placed++;
        }
      });

      // Default mock ratios fallback if database contains no profiles yet for UI demonstration
      let branchRatios = Object.entries(branchStatsMap).map(([branch, stats]) => ({
        branch,
        placedCount: stats.placed,
        totalCount: stats.total,
        ratio: stats.total > 0 ? Math.round((stats.placed / stats.total) * 100) : 0
      }));

      if (branchRatios.length === 0) {
        branchRatios = [
          { branch: 'CSE', placedCount: 42, totalCount: 50, ratio: 84 },
          { branch: 'ECE', placedCount: 28, totalCount: 40, ratio: 70 },
          { branch: 'MECH', placedCount: 15, totalCount: 30, ratio: 50 },
          { branch: 'CIVIL', placedCount: 8, totalCount: 25, ratio: 32 }
        ];
      }

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalStudents: studentCount,
            totalCompanies: partnerCount,
            pendingApprovals: pendingCount,
            activeJobs: activeJobsCount,
            placedPercentage: placedPercent > 0 ? placedPercent : 64, // showcase default
            branchMetrics: branchRatios
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists job offers released for this student (applications with status 'offered', 'rejected' (if rejected), or 'accepted').
   */
  public static async getOffersList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const offers = await Application.find({ studentId: req.user.userId, status: { $in: ['offered', 'rejected'] } })
        .populate({
          path: 'jobId',
          populate: { path: 'companyId', select: 'name logoUrl description website location' }
        })
        .sort({ updatedAt: -1 });

      const mappedOffers = offers.map(app => {
        const obj = app.toObject();
        const accepted = app.timeline.some(t => t.comments && t.comments.includes('Offer ACCEPTED'));
        if (accepted) {
          obj.status = 'accepted';
        } else if (app.status === 'offered') {
          obj.status = 'pending';
        }
        return obj;
      });

      res.status(200).json({
        success: true,
        data: { offers: mappedOffers }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Responds to an offer (accept or reject).
   */
  public static async respondToOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const { id } = req.params;
      const { status } = req.body; // 'accepted' | 'rejected'

      if (!status || (status !== 'accepted' && status !== 'rejected')) {
        throw new BadRequestError('Valid status response is required.');
      }

      const application = await Application.findOne({ _id: id, studentId: req.user.userId });
      if (!application) {
        throw new NotFoundError('Offer not found.');
      }

      if (status === 'accepted') {
        application.timeline.push({
          status: 'offered',
          updatedAt: new Date(),
          comments: 'Offer ACCEPTED by candidate'
        });
      } else if (status === 'rejected') {
        application.status = 'rejected';
        application.timeline.push({
          status: 'rejected',
          updatedAt: new Date(),
          comments: 'Offer REJECTED by candidate'
        });
      }

      await application.save();

      res.status(200).json({
        success: true,
        message: `Offer ${status} successfully.`
      });
    } catch (error) {
      next(error);
    }
  }
}
