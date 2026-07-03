import { Request, Response, NextFunction } from 'express';
import { Company } from '../models/company.model';
import { Job } from '../models/job.model';
import { CampusDrive } from '../models/drive.model';
import { User } from '../models/user.model';
import { UnauthorizedError, BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

export class EmployerController {
  /**
   * Retrieves company profile. Auto-creates a placeholder if not found.
   */
  public static async getCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      let company = await Company.findOne({ userId: req.user.userId });
      
      // Auto-create profile if first time
      if (!company) {
        const user = await User.findById(req.user.userId);
        company = new Company({
          userId: req.user.userId,
          name: user ? `${user.name}'s Corporate Profile` : 'Company Profile',
          description: 'Add your company profile description here.',
          isVerified: false
        });
        await company.save();
      }

      res.status(200).json({
        success: true,
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates company profile.
   */
  public static async updateCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { name, logoUrl, description, website, industry, location } = req.body;

      let company = await Company.findOne({ userId: req.user.userId });
      if (!company) {
        company = new Company({ userId: req.user.userId });
      }

      if (name !== undefined) company.name = name;
      if (logoUrl !== undefined) company.logoUrl = logoUrl;
      if (description !== undefined) company.description = description;
      if (website !== undefined) company.website = website;
      if (industry !== undefined) company.industry = industry;
      if (location !== undefined) company.location = location;

      await company.save();

      res.status(200).json({
        success: true,
        message: 'Company profile updated successfully.',
        data: { company }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists all jobs posted by the corporate employer.
   */
  public static async getJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const company = await Company.findOne({ userId: req.user.userId });
      if (!company) {
        res.status(200).json({ success: true, data: { jobs: [] } });
        return;
      }

      const jobs = await Job.find({ companyId: company._id, isActive: true }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { jobs }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new job posting.
   */
  public static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      let company = await Company.findOne({ userId: req.user.userId });
      if (!company) {
        const user = await User.findById(req.user.userId);
        company = new Company({
          userId: req.user.userId,
          name: user ? `${user.name}'s Corporate Profile` : 'Company Profile',
          description: 'Auto-provisioned company profile details',
          isVerified: false
        });
        await company.save();
      }

      const {
        title,
        description,
        requirements,
        skillsRequired,
        location,
        salaryRange,
        type,
        eligibility,
        deadline
      } = req.body;

      if (!title || !description || !location || !deadline) {
        throw new BadRequestError('Title, description, location, and deadline are required.');
      }

      const job = new Job({
        companyId: company._id,
        postedBy: req.user.userId,
        title,
        description,
        requirements: requirements || [],
        skillsRequired: skillsRequired || [],
        location,
        salaryRange,
        type: type || 'full-time',
        eligibility: eligibility || { minCgpa: 0, allowedBranches: [], maxBacklogs: 0 },
        deadline: new Date(deadline),
        isActive: true
      });

      await job.save();

      res.status(201).json({
        success: true,
        message: 'Job posting created successfully.',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates an existing job posting.
   */
  public static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const {
        title,
        description,
        requirements,
        skillsRequired,
        location,
        salaryRange,
        type,
        eligibility,
        deadline,
        isActive
      } = req.body;

      const job = await Job.findById(id);
      if (!job) {
        throw new NotFoundError('Job posting not found.');
      }

      // Check ownership
      if (job.postedBy.toString() !== req.user.userId) {
        throw new ForbiddenError('You are not authorized to update this job listing.');
      }

      if (title !== undefined) job.title = title;
      if (description !== undefined) job.description = description;
      if (requirements !== undefined) job.requirements = requirements;
      if (skillsRequired !== undefined) job.skillsRequired = skillsRequired;
      if (location !== undefined) job.location = location;
      if (salaryRange !== undefined) job.salaryRange = salaryRange;
      if (type !== undefined) job.type = type;
      if (eligibility !== undefined) job.eligibility = eligibility;
      if (deadline !== undefined) job.deadline = new Date(deadline);
      if (isActive !== undefined) job.isActive = isActive;

      await job.save();

      res.status(200).json({
        success: true,
        message: 'Job listing updated successfully.',
        data: { job }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivates/Soft-deletes a job listing.
   */
  public static async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const job = await Job.findById(id);
      if (!job) {
        throw new NotFoundError('Job listing not found.');
      }

      if (job.postedBy.toString() !== req.user.userId) {
        throw new ForbiddenError('You are not authorized to remove this listing.');
      }

      // Soft delete
      job.isActive = false;
      await job.save();

      res.status(200).json({
        success: true,
        message: 'Job listing deactivated successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists drives scheduled by the employer's company.
   */
  public static async getDrives(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const company = await Company.findOne({ userId: req.user.userId });
      if (!company) {
        res.status(200).json({ success: true, data: { drives: [] } });
        return;
      }

      const drives = await CampusDrive.find({ companyId: company._id })
        .populate('jobId', 'title location type salaryRange')
        .sort({ driveDate: 1 });

      res.status(200).json({
        success: true,
        data: { drives }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Schedules a new campus drive.
   */
  public static async createDrive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const company = await Company.findOne({ userId: req.user.userId });
      if (!company) {
        throw new BadRequestError('Create a company profile first before scheduling drives.');
      }

      const { jobId, driveDate, rounds } = req.body;

      if (!jobId || !driveDate) {
        throw new BadRequestError('Job selection and drive date are required.');
      }

      // Verify job exists and belongs to this employer
      const job = await Job.findById(jobId);
      if (!job || job.companyId.toString() !== company._id.toString()) {
        throw new BadRequestError('Invalid Job ID specified.');
      }

      const drive = new CampusDrive({
        companyId: company._id,
        jobId,
        driveDate: new Date(driveDate),
        rounds: rounds || [{ roundNumber: 1, name: 'Initial Screening' }],
        status: 'scheduled'
      });

      await drive.save();

      const populatedDrive = await CampusDrive.findById(drive._id).populate('jobId', 'title location type');

      res.status(201).json({
        success: true,
        message: 'Campus drive scheduled successfully.',
        data: { drive: populatedDrive }
      });
    } catch (error) {
      next(error);
    }
  }
}
