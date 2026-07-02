import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isRevoked: boolean;
  createdAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: auto-deletes document when current date exceeds expiresAt
    },
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    },
    isRevoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

RefreshTokenSchema.index({ token: 1 });
RefreshTokenSchema.index({ userId: 1 });

export const RefreshToken = mongoose.model<IRefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
