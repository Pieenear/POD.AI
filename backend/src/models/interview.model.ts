import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  duration: number; // In minutes
  type: 'online' | 'offline';
  linkOrLocation: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewDocument extends IInterview, Document {}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Interview title is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Interview date and time are required']
    },
    duration: {
      type: Number,
      default: 30
    },
    type: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online'
    },
    linkOrLocation: {
      type: String,
      required: [true, 'Meeting link or location details are required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

InterviewSchema.index({ studentId: 1 });
InterviewSchema.index({ companyId: 1 });
InterviewSchema.index({ date: 1 });

export const Interview = mongoose.model<IInterviewDocument>('Interview', InterviewSchema);
