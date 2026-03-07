import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { registerSchema, loginSchema } from '../schemas/validation.schemas';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

const generateToken = (userId: string): string => {
    const opts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] };
    return jwt.sign({ userId }, process.env.JWT_SECRET as string, opts);
};

// POST /api/auth/register
export const register: RequestHandler = async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);

        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) throw new AppError('Email already in use', 409);

        const hashedPassword = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
            data: { name: data.name, email: data.email, password: hashedPassword },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        const token = generateToken(user.id);
        res.status(201).json({ message: 'Account created successfully', token, user });
    } catch (err) { next(err); }
};

// POST /api/auth/login
export const login: RequestHandler = async (req, res, next) => {
    try {
        const data = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: data.email } });
        if (!user) throw new AppError('Invalid email or password', 401);

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new AppError('Invalid email or password', 401);

        const token = generateToken(user.id);
        res.json({
            message: 'Logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        });
    } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const user = await prisma.user.findUnique({
            where: { id: authReq.userId },
            select: { id: true, name: true, email: true, createdAt: true },
        });
        if (!user) throw new AppError('User not found', 404);
        res.json({ user });
    } catch (err) { next(err); }
};
