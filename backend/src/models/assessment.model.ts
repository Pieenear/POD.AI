import mongoose, { Schema, Document } from 'mongoose';

export interface IMcqQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ICodingQuestion {
  questionText: string;
  inputFormat?: string;
  outputFormat?: string;
  sampleInput?: string;
  sampleOutput?: string;
  correctCodeSnippet?: string; // Reference solution
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export interface IAssessment {
  title: string;
  jobId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  type: 'mcq' | 'coding' | 'mixed';
  mcqQuestions: IMcqQuestion[];
  codingQuestions: ICodingQuestion[];
  duration: number; // in minutes
  passingMarks: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentDocument extends IAssessment, Document {}

const McqQuestionSchema = new Schema<IMcqQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true }
}, { _id: false });

const CodingQuestionSchema = new Schema<ICodingQuestion>({
  questionText: { type: String, required: true },
  inputFormat: { type: String },
  outputFormat: { type: String },
  sampleInput: { type: String },
  sampleOutput: { type: String },
  correctCodeSnippet: { type: String },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
  }]
}, { _id: false });

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    type: {
      type: String,
      enum: ['mcq', 'coding', 'mixed'],
      required: true
    },
    mcqQuestions: [McqQuestionSchema],
    codingQuestions: [CodingQuestionSchema],
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks score is required'],
      min: [0, 'Passing marks cannot be negative']
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

AssessmentSchema.index({ jobId: 1 });
AssessmentSchema.index({ companyId: 1 });

export const Assessment = mongoose.model<IAssessmentDocument>('Assessment', AssessmentSchema);
