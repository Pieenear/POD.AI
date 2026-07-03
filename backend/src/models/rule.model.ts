import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacementRule {
  minCgpa: number;
  maxBacklogs: number;
  allowedBranches: string[];
  isGlobal: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlacementRuleDocument extends IPlacementRule, Document {}

const PlacementRuleSchema = new Schema<IPlacementRuleDocument>(
  {
    minCgpa: {
      type: Number,
      default: 0
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    allowedBranches: [{
      type: String,
      trim: true
    }],
    isGlobal: {
      type: Boolean,
      default: true
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

// Ensure there is only one global rules document
PlacementRuleSchema.index({ isGlobal: 1 });

export const PlacementRule = mongoose.model<IPlacementRuleDocument>('PlacementRule', PlacementRuleSchema);
