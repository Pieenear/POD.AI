import mongoose, { Schema, Document } from 'mongoose';

export interface IEligibility {
  minCgpa: number;
  allowedBranches: string[];
  maxBacklogs: number;
}

export interface IJob {
  companyId: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  location: string;
  salaryRange?: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  eligibility: IEligibility;
  deadline: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobDocument extends IJob, Document {}

const EligibilitySchema = new Schema<IEligibility>({
  minCgpa: {
    type: Number,
    default: 0
  },
  allowedBranches: [{
    type: String,
    trim: true
  }],
  maxBacklogs: {
    type: Number,
    default: 0
  }
});

const JobSchema = new Schema<IJobDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }],
    skillsRequired: [{
      type: String,
      trim: true
    }],
    location: {
      type: String,
      required: [true, 'Job location is required'],
      trim: true
    },
    salaryRange: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time'
    },
    eligibility: {
      type: EligibilitySchema,
      default: () => ({})
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

JobSchema.index({ companyId: 1 });
JobSchema.index({ isActive: 1 });
JobSchema.index({ deadline: 1 });

export const Job = mongoose.model<IJobDocument>('Job', JobSchema);
