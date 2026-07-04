import mongoose, { Schema, Document } from 'mongoose';

export interface IMcqAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export interface ICodingAnswer {
  questionIndex: number;
  code: string;
  status: 'pass' | 'fail';
  passedTestCases: number;
  totalTestCases: number;
}

export interface ISubmission {
  assessmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: 'completed' | 'evaluated';
  mcqAnswers: IMcqAnswer[];
  codingAnswers: ICodingAnswer[];
  score: number;
  result: 'pass' | 'fail';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmissionDocument extends ISubmission, Document {}

const McqAnswerSchema = new Schema<IMcqAnswer>({
  questionIndex: { type: Number, required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const CodingAnswerSchema = new Schema<ICodingAnswer>({
  questionIndex: { type: Number, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['pass', 'fail'], required: true },
  passedTestCases: { type: Number, required: true },
  totalTestCases: { type: Number, required: true }
}, { _id: false });

const SubmissionSchema = new Schema<ISubmissionDocument>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['completed', 'evaluated'],
      default: 'completed'
    },
    mcqAnswers: [McqAnswerSchema],
    codingAnswers: [CodingAnswerSchema],
    score: {
      type: Number,
      required: true,
      default: 0
    },
    result: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
      default: 'fail'
    }
  },
  {
    timestamps: true
  }
);

SubmissionSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });
SubmissionSchema.index({ studentId: 1 });

export const Submission = mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);
