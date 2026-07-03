import { Request, Response, NextFunction } from 'express';
import { ForumPost } from '../models/post.model';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';

export class ForumController {
  /**
   * Retrieves all discussion threads, optionally filtered by tag.
   */
  public static async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tag } = req.query;
      const query: any = {};
      
      if (tag) {
        query.tags = tag;
      }

      const posts = await ForumPost.find(query)
        .populate('author', 'name role')
        .populate('replies.author', 'name role')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { posts }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Publishes a new discussion thread.
   */
  public static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { title, body, tags } = req.body;
      if (!title || !body) {
        throw new BadRequestError('Discussion title and body are required.');
      }

      const post = new ForumPost({
        title,
        body,
        tags: tags || [],
        author: req.user.userId,
        replies: [],
        upvotes: []
      });

      await post.save();
      const populated = await ForumPost.findById(post._id).populate('author', 'name role');

      res.status(201).json({
        success: true,
        message: 'Discussion post created successfully.',
        data: { post: populated }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Appends a text reply to a discussion thread.
   */
  public static async createReply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const { body } = req.body;

      if (!body) {
        throw new BadRequestError('Reply message body is required.');
      }

      const post = await ForumPost.findById(id);
      if (!post) {
        throw new NotFoundError('Discussion post not found.');
      }

      post.replies.push({
        author: req.user.userId as any,
        body,
        createdAt: new Date()
      });

      await post.save();

      const populated = await ForumPost.findById(post._id)
        .populate('author', 'name role')
        .populate('replies.author', 'name role');

      res.status(201).json({
        success: true,
        message: 'Reply posted successfully.',
        data: { post: populated }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggles upvote status for a discussion post.
   */
  public static async toggleUpvote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { id } = req.params;
      const post = await ForumPost.findById(id);

      if (!post) {
        throw new NotFoundError('Discussion post not found.');
      }

      const userId = req.user.userId as any;
      const upvoteIndex = post.upvotes.findIndex(uid => uid.toString() === userId.toString());

      if (upvoteIndex > -1) {
        // Remove upvote
        post.upvotes.splice(upvoteIndex, 1);
      } else {
        // Add upvote
        post.upvotes.push(userId);
      }

      await post.save();

      const populated = await ForumPost.findById(post._id)
        .populate('author', 'name role')
        .populate('replies.author', 'name role');

      res.status(200).json({
        success: true,
        message: 'Upvote updated.',
        data: { post: populated }
      });
    } catch (error) {
      next(error);
    }
  }
}
