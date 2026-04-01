import app from './app';
import { env } from './config/env';
import pino from 'pino';

const logger = pino();

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(env.PORT, host, () => {
  logger.info(`Server running on http://${host}:${env.PORT}`);
});
