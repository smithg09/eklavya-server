import winston from 'winston';
import winstonDashboard from 'winston-dashboard';
import path from 'path';
import config from '../config';
import fs from 'fs';
import { chunk } from 'lodash';

const transports = [];
if (process.env.NODE_ENV !== 'development') {
  transports.push(new winston.transports.File({ filename: path.join(process.cwd(), 'logs', 'server.log') }),);
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.cli(), winston.format.splat()),
    }),
    new winston.transports.File({ filename: `${path.join(process.cwd(), 'logs', 'server.log')}` }),
  );
}

const LoggerInstance: winston.Logger = winston.createLogger({
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

export default LoggerInstance;
