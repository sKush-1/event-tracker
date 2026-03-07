import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    dateTime: z.string().datetime({ message: 'Invalid date-time format (use ISO 8601)' }),
    location: z.string().min(1, 'Location is required').max(500, 'Location too long'),
    description: z.string().max(2000, 'Description too long').optional(),
});

export const updateEventSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    dateTime: z.string().datetime().optional(),
    location: z.string().min(1).max(500).optional(),
    description: z.string().max(2000).optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
