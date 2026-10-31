import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: formattedErrors,
    });
    return;
  }

  // Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      res.status(409).json({
        success: false,
        error: `A record with this ${target.join(', ') || 'field'} already exists.`,
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Record not found or already deleted.',
      });
      return;
    }
  }

  // Multer Error
  if (err instanceof Error && err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Standard Error
  if (err instanceof Error) {
    console.error('[API Error]:', err.stack || err.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
    return;
  }

  console.error('[Unknown Error]:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred',
  });
}

