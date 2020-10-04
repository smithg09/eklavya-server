import winston from 'winston';
import config from '../config';
import os from 'os';
import DiscordLogger from 'node-discord-logger';

const transports = [];
let LoggerInstance;
if (process.env.NODE_ENV !== 'development') {
  LoggerInstance = new DiscordLogger({
    hook: 'https://discordapp.com/api/webhooks/762034517715451914/hu-XM_aEZlbJoYbskl4aHASP6DjxH7ryzxLGn_R0qU9fKUvcnUmLXautw5CDvnWZvouf',
    serviceName: 'Eklavya Server', // optional, will be included as text in the footer
    defaultMeta: {
      // optional, will be added to all the messages
      'Process ID': process.pid,
      Host: os.hostname(), // import os from 'os';
    },
    errorHandler: err => {
      // optional, if you don't want this library to log to console
      console.error('error from discord', err);
    },
  });
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.cli(), winston.format.splat()),
    }),
  );

  LoggerInstance = winston.createLogger({
    level: config.logs.level,
    levels: winston.config.npm.levels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    ),
    transports,
  });
}

export default LoggerInstance;
