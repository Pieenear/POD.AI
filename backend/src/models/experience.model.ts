import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewExperience {
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  company: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  roundsDetails: string;
  tips: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewExperienceDocument extends IInterviewExperience, Document {}

const InterviewExperienceSchema = new Schema<IInterviewExperienceDocument>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Role / Position is required'],
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    roundsDetails: {
      type: String,
      required: [true, 'Rounds details are required'],
      trim: true
    },
    tips: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

InterviewExperienceSchema.index({ company: 1 });
InterviewExperienceSchema.index({ difficulty: 1 });
InterviewExperienceSchema.index({ createdAt: -1 });

export const InterviewExperience = mongoose.model<IInterviewExperienceDocument>('InterviewExperience', InterviewExperienceSchema);
