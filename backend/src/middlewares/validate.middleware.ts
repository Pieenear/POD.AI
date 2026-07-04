import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      })) as any;
      
      // Assign parsed data back to req to have fully typed validated schemas
      req.body = parsed.body;
      Object.defineProperty(req, 'query', { value: parsed.query, writable: true, configurable: true });
      Object.defineProperty(req, 'params', { value: parsed.params, writable: true, configurable: true });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => {
          const field = err.path.slice(1).join('.');
          return `${field}: ${err.message}`;
        });
        
        res.status(400).json({
          success: false,
          message: 'Validation Error',
          errors
        });
        return;
      }
      next(error);
    }
  };
};
