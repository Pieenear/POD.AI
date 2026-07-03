import mongoose, { Schema, Document } from 'mongoose';

export interface IAiMatchAnalysis {
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface IStatusTimeline {
  status: 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected';
  updatedAt: Date;
  comments?: string;
}

export interface IApplication {
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'applied' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected';
  aiMatchScore: number;
  aiMatchAnalysis: IAiMatchAnalysis;
  timeline: IStatusTimeline[];
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplicationDocument extends IApplication, Document {}

const AiMatchAnalysisSchema = new Schema<IAiMatchAnalysis>({
  strengths: [{ type: String, trim: true }],
  gaps: [{ type: String, trim: true }],
  recommendations: [{ type: String, trim: true }]
}, { _id: false });

const StatusTimelineSchema = new Schema<IStatusTimeline>({
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'rejected'],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  comments: {
    type: String,
    trim: true
  }
}, { _id: false });

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
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
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'rejected'],
      default: 'applied'
    },
    aiMatchScore: {
      type: Number,
      default: 0
    },
    aiMatchAnalysis: {
      type: AiMatchAnalysisSchema,
      default: () => ({ strengths: [], gaps: [], recommendations: [] })
    },
    timeline: [StatusTimelineSchema],
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Unique index: a student can only submit one application per job
ApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1 });
ApplicationSchema.index({ status: 1 });

export const Application = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);
