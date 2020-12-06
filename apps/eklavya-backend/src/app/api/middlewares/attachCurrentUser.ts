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
const attachCurrentUser = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  try {
    const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
    let userRecord;
    if (req.authMethod != 'local') {
      userRecord = await UserModel.findOne({ 'OAuth2.Id': req.userId });
    } else {
      userRecord = await UserModel.findById(req.userId);
    }
    const data = userRecord.toObject();
    Reflect.deleteProperty(data, 'password');
    Reflect.deleteProperty(data, 'salt');
    const transformedData = transformUserData(data);
    if (transformedData) {
      req.currentUser = transformedData;
      return next();
    } else {
      throw new Error('Error Sending User Data');
    }
  } catch (e) {
    logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
