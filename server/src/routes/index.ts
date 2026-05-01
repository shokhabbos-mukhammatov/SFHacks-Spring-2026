import { Router } from 'express';
import eventsRouter from './events';
import healthRouter from './health';

export const router = Router();

router.use('/events', eventsRouter);
router.use('/health', healthRouter);

// TODO: register additional route modules here
// Example:
//   import usersRouter from './users';
//   router.use('/users', usersRouter);
