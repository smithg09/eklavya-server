import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { Logger } from 'winston';
import { transformUserData } from '../../helpers/transformUserData';

/**
 * * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const isStudent = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  try {
    if (req.currentUser.role === 'student') {
      return next();
    } else {
      throw new Error('Insuffient Permission! Required Student');
    }
  } catch (e) {
    logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

const isFaculty = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  try {
    if (req.currentUser.role === 'staff') {
      return next();
    } else {
      throw new Error('Insuffient Permission! Staff Or Faculty Login Required');
    }
  } catch (e) {
    logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export { isStudent, isFaculty };
