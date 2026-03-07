import type { RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { createEventSchema, updateEventSchema } from '../schemas/validation.schemas';
import { AppError } from '../middleware/error.middleware';
import type { AuthRequest } from '../middleware/auth.middleware';

export const getEvents: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const { filter } = req.query;
        const now = new Date();

        let dateFilter = {};
        if (filter === 'upcoming') dateFilter = { dateTime: { gte: now } };
        else if (filter === 'past') dateFilter = { dateTime: { lt: now } };

        const events = await prisma.event.findMany({
            where: { userId: authReq.userId!, ...dateFilter },
            orderBy: { dateTime: filter === 'past' ? 'desc' : 'asc' },
            select: { id: true, title: true, dateTime: true, location: true, description: true, shareToken: true, createdAt: true },
        });

        res.json({ events });
    } catch (err) { next(err); }
};

export const createEvent: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const data = createEventSchema.parse(req.body);

        const event = await prisma.event.create({
            data: {
                title: data.title,
                dateTime: new Date(data.dateTime),
                location: data.location,
                description: data.description,
                userId: authReq.userId!,
            },
            select: { id: true, title: true, dateTime: true, location: true, description: true, shareToken: true, createdAt: true },
        });

        res.status(201).json({ message: 'Event created', event });
    } catch (err) { next(err); }
};

export const getEvent: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const id = String(req.params.id);
        const event = await prisma.event.findFirst({
            where: { id, userId: authReq.userId! },
            select: { id: true, title: true, dateTime: true, location: true, description: true, shareToken: true, createdAt: true, updatedAt: true },
        });

        if (!event) throw new AppError('Event not found', 404);
        res.json({ event });
    } catch (err) { next(err); }
};

export const updateEvent: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const data = updateEventSchema.parse(req.body);
        const id = String(req.params.id);

        const existing = await prisma.event.findFirst({ where: { id, userId: authReq.userId! } });
        if (!existing) throw new AppError('Event not found', 404);

        const event = await prisma.event.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.dateTime && { dateTime: new Date(data.dateTime) }),
                ...(data.location && { location: data.location }),
                ...(data.description !== undefined && { description: data.description }),
            },
            select: { id: true, title: true, dateTime: true, location: true, description: true, shareToken: true, updatedAt: true },
        });

        res.json({ message: 'Event updated', event });
    } catch (err) { next(err); }
};

export const deleteEvent: RequestHandler = async (req, res, next) => {
    try {
        const authReq = req as AuthRequest;
        const id = String(req.params.id);

        const existing = await prisma.event.findFirst({ where: { id, userId: authReq.userId! } });
        if (!existing) throw new AppError('Event not found', 404);

        await prisma.event.delete({ where: { id } });
        res.json({ message: 'Event deleted' });
    } catch (err) { next(err); }
};

export const getSharedEvent: RequestHandler = async (req, res, next) => {
    try {
        const shareToken = String(req.params.shareToken);
        const event = await prisma.event.findUnique({
            where: { shareToken },
            select: {
                id: true, title: true, dateTime: true, location: true, description: true,
                user: { select: { name: true } },
            },
        });

        if (!event) throw new AppError('Event not found or link is invalid', 404);
        res.json({ event });
    } catch (err) { next(err); }
};
