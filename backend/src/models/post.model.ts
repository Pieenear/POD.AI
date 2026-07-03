import mongoose, { Schema, Document } from 'mongoose';

export interface IReply {
  author: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
}

export interface IForumPost {
  title: string;
  body: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  replies: IReply[];
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumPostDocument extends IForumPost, Document {}

const ReplySchema = new Schema<IReply>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: [true, 'Reply text body is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ForumPostSchema = new Schema<IForumPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Discussion title is required'],
      trim: true
    },
    body: {
      type: String,
      required: [true, 'Discussion body is required'],
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    replies: [ReplySchema],
    upvotes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ author: 1 });
ForumPostSchema.index({ createdAt: -1 });

export const ForumPost = mongoose.model<IForumPostDocument>('ForumPost', ForumPostSchema);
