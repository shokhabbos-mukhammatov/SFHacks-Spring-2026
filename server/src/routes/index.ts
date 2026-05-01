import { Router } from 'express';
import healthRouter from './health';
import eventsRouter from './events';

export const router = Router();

router.use('/health', healthRouter);
router.use('/events', eventsRouter);
