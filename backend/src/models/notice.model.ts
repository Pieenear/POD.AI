import mongoose, { Schema, Document } from 'mongoose';

export interface INotice {
  title: string;
  body: string;
  targetAudience: 'all' | 'students' | 'employers';
  targetBranches: string[];
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoticeDocument extends INotice, Document {}

const NoticeSchema = new Schema<INoticeDocument>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true
    },
    body: {
      type: String,
      required: [true, 'Notice body description is required'],
      trim: true
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'employers'],
      default: 'all'
    },
    targetBranches: [{
      type: String,
      trim: true
    }],
    expiresAt: {
      type: Date
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

NoticeSchema.index({ targetAudience: 1 });
NoticeSchema.index({ expiresAt: 1 });

export const Notice = mongoose.model<INoticeDocument>('Notice', NoticeSchema);
