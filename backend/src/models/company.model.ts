import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany {
  userId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  description: string;
  website?: string;
  industry?: string;
  location?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyDocument extends ICompany, Document {}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    logoUrl: {
      type: String
    },
    description: {
      type: String,
      required: [true, 'Company description is required'],
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

CompanySchema.index({ isVerified: 1 });

export const Company = mongoose.model<ICompanyDocument>('Company', CompanySchema);
