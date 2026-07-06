import mongoose, { Schema, Document } from 'mongoose';

export interface ISemesterDetail {
  year: number;
  semester: string;
  cgpa?: number;
  closedBacklogs?: number;
  liveBacklogs?: number;
  marksheetUrl?: string;
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  grade?: string;
  marksheetUrl?: string;
  semesters?: ISemesterDetail[];
  aggregateCgpa?: number;
  totalClosedBacklogs?: number;
  totalLiveBacklogs?: number;
}

export interface IExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  cgpa?: string;
  marksheetUrl?: string;
  experienceType?: 'job' | 'internship';
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  githubLink?: string;
}

export interface ICertification {
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface IResumeVersion {
  versionNumber: number;
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export interface IAiReview {
  score: number;
  grammarRating: string;
  formattingRating: string;
  keywordMatch: string[];
  suggestions: string[];
  reviewedAt: Date;
}

export interface IContactDetails {
  phone?: string;
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface IFamilyDetails {
  fatherName?: string;
  motherName?: string;
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  headline?: string;
  bio?: string;
  skills: string[];
  education: IEducation[];
  experience: IExperience[];
  projects: IProject[];
  certifications: ICertification[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  codingProfiles?: {
    leetcode?: string;
    hackerrank?: string;
    codeforces?: string;
  };
  resumeUrl?: string;
  resumeVersions: IResumeVersion[];
  aiReview?: IAiReview;
  badges: string[];
  enrollmentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  course?: string;
  specialization?: string;
  gender?: string;
  dob?: Date;
  bloodGroup?: string;
  maritalStatus?: string;
  medicalHistory?: string;
  contactDetails?: IContactDetails;
  familyDetails?: IFamilyDetails;
  policyAgreed?: boolean;
  photo?: string;
  positionsOfResponsibility?: string[];
  references?: string;
  otherDetails?: string;
  seminars?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterDetailSchema = new Schema<ISemesterDetail>({
  year: { type: Number },
  semester: { type: String },
  cgpa: { type: Number },
  closedBacklogs: { type: Number },
  liveBacklogs: { type: Number },
  marksheetUrl: { type: String }
});

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  grade: { type: String },
  marksheetUrl: { type: String },
  semesters: [SemesterDetailSchema],
  aggregateCgpa: { type: Number },
  totalClosedBacklogs: { type: Number },
  totalLiveBacklogs: { type: Number }
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String },
  cgpa: { type: String },
  marksheetUrl: { type: String },
  experienceType: { type: String, enum: ['job', 'internship'], default: 'job' }
});

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  link: { type: String },
  githubLink: { type: String }
});

const CertificationSchema = new Schema<ICertification>({
  name: { type: String, required: true },
  issuingOrganization: { type: String, required: true },
  issueDate: { type: Date, required: true },
  expirationDate: { type: Date },
  credentialId: { type: String },
  credentialUrl: { type: String }
});

const ResumeVersionSchema = new Schema<IResumeVersion>({
  versionNumber: { type: Number, required: true },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const AiReviewSchema = new Schema<IAiReview>({
  score: { type: Number, required: true },
  grammarRating: { type: String, required: true },
  formattingRating: { type: String, required: true },
  keywordMatch: [{ type: String }],
  suggestions: [{ type: String }],
  reviewedAt: { type: Date, default: Date.now }
});

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    headline: { type: String, trim: true },
    bio: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    education: [EducationSchema],
    experience: [ExperienceSchema],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    codingProfiles: {
      leetcode: { type: String, trim: true },
      hackerrank: { type: String, trim: true },
      codeforces: { type: String, trim: true }
    },
    resumeUrl: { type: String },
    resumeVersions: [ResumeVersionSchema],
    aiReview: AiReviewSchema,
    badges: [{ type: String, trim: true }],
    enrollmentNumber: { type: String, trim: true },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    course: { type: String, trim: true },
    specialization: { type: String, trim: true },
    gender: { type: String, trim: true },
    dob: { type: Date },
    bloodGroup: { type: String, trim: true },
    maritalStatus: { type: String, trim: true },
    medicalHistory: { type: String, trim: true },
    contactDetails: {
      phone: { type: String, trim: true },
      altPhone: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true }
    },
    familyDetails: {
      fatherName: { type: String, trim: true },
      motherName: { type: String, trim: true }
    },
    policyAgreed: { type: Boolean, default: false },
    photo: { type: String },
    positionsOfResponsibility: [{ type: String, trim: true }],
    references: { type: String, trim: true },
    otherDetails: { type: String, trim: true },
    seminars: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Indexes
StudentProfileSchema.index({ skills: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
