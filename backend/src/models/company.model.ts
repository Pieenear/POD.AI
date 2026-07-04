import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationDoc {
  docType: 'GST' | 'PAN' | 'Incorporation' | 'Other';
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export interface ICompany {
  userId: mongoose.Types.ObjectId;
  name: string;
  logoUrl?: string;
  description: string;
  website?: string;
  industry?: string;
  location?: string;
  isVerified: boolean;
  verificationDocs?: IVerificationDoc[];
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
    },
    verificationDocs: [
      {
        docType: {
          type: String,
          enum: ['GST', 'PAN', 'Incorporation', 'Other'],
          required: true
        },
        url: {
          type: String,
          required: true
        },
        fileName: {
          type: String,
          required: true
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

CompanySchema.index({ isVerified: 1 });

export const Company = mongoose.model<ICompanyDocument>('Company', CompanySchema);
