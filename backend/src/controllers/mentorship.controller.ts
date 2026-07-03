import { Request, Response, NextFunction } from 'express';
import { InterviewExperience } from '../models/experience.model';
import { User } from '../models/user.model';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class MentorshipController {
  /**
   * Retrieves all published alumni interview experiences.
   */
  public static async getExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const experiences = await InterviewExperience.find({ status: 'published' })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { experiences }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submits and publishes a new interview experience block.
   */
  public static async createExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { company, role, difficulty, roundsDetails, tips } = req.body;
      if (!company || !role || !roundsDetails) {
        throw new BadRequestError('Company name, role position, and rounds details are required.');
      }

      const user = await User.findById(req.user.userId);
      const authorName = user ? user.name : 'University Alumnus';

      const experience = new InterviewExperience({
        authorId: req.user.userId,
        authorName,
        company,
        role,
        difficulty: difficulty || 'Medium',
        roundsDetails,
        tips: tips || '',
        status: 'published'
      });

      await experience.save();

      res.status(201).json({
        success: true,
        message: 'Interview experience review published.',
        data: { experience }
      });
    } catch (error) {
      next(error);
    }
  }
}
