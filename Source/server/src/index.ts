import app from './app';
import { env } from './config/env';
import pino from 'pino';

const logger = pino();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
