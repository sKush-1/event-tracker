import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import {
    getEvents,
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
    getSharedEvent,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: ExpressRouter = Router();

// Public route - share link (must come before :id to prevent conflict)
router.get('/share/:shareToken', getSharedEvent);

// Protected routes
router.use(authenticate);
router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEvent);
router.patch('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
