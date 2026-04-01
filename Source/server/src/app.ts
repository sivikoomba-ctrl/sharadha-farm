import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.split(',').map(s => s.trim()) }));
app.use(express.json());
app.use(pinoHttp({ quietReqLogger: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts, please try again later' },
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

app.use('/api', routes);

app.use(errorHandler);

export default app;
