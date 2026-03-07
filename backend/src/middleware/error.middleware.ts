import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';


export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Validation error',
            errors: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }

    res.status(500).json({ message: 'Internal server error' });
};
