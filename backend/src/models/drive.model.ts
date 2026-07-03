import mongoose, { Schema, Document } from 'mongoose';

export interface IDriveRound {
  roundNumber: number;
  name: string;
  date?: Date;
}

export interface ICampusDrive {
  companyId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  driveDate: Date;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  rounds: IDriveRound[];
  registeredStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampusDriveDocument extends ICampusDrive, Document {}

const DriveRoundSchema = new Schema<IDriveRound>({
  roundNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date
  }
});

const CampusDriveSchema = new Schema<ICampusDriveDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required']
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    rounds: [DriveRoundSchema],
    registeredStudents: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

CampusDriveSchema.index({ jobId: 1 });
CampusDriveSchema.index({ driveDate: 1 });
CampusDriveSchema.index({ companyId: 1 });

export const CampusDrive = mongoose.model<ICampusDriveDocument>('CampusDrive', CampusDriveSchema);
