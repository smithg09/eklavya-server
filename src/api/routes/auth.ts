import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
import jwt from 'jsonwebtoken';
import { Container } from 'typedi';
import { IUser } from '../../interfaces/IUser';
import config from '../../config';
import AuthService from '../../services/auth';
import { IUserInputDTO } from '../../interfaces/IUser';
import middlewares from '../middlewares';
import { transformUserData } from '../../helpers/transformUserData';
import { encrypt, decrypt } from '../middlewares/cryptoAES';

const route = Router();

export default (app: Router) => {
  app.use('/auth', route);

  route.post(
    '/signup',
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        class: Joi.string(),
        rollNo: Joi.number(),
        semester: Joi.number(),
        department: Joi.string(),
        course: Joi.string(),
        role: Joi.string(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-Up endpoint with body: %o', req.body);
      try {
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignUp(req.body as IUserInputDTO);
        const transformedUserData = transformUserData(user);
        // eslint-disable-next-line @typescript-eslint/camelcase
        return res.status(201).json({ user_data: transformedUserData, token: encrypt(token) });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/signin',
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling Sign-In endpoint with body: %o', req.body);
      try {
        const { email, password } = req.body;
        const authServiceInstance = Container.get(AuthService);
        const { user, token } = await authServiceInstance.SignIn(email, password);
        const transformedUserData = transformUserData(user);
        // eslint-disable-next-line @typescript-eslint/camelcase
        return res.status(201).json({ user_data: transformedUserData, token: encrypt(token) });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  /**
   * * Google Sign In Route using OAuth2
   * TODO Verifing OAuth id JWT token from OAuth endpoint (i.e https://developers.google.com/identity/sign-in/web/backend-auth)
   */

  route.post('/oauth/google', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling OAuth Sign-In endpoint');
    try {
      const authServiceInstance = Container.get(AuthService);
      // eslint-disable-next-line @typescript-eslint/camelcase
      const { user, access_token, token } = await authServiceInstance.GoogleSignIn(req.body.oauth_code);
      const transformUserRecord = transformUserData(user);
      const encryptedAT = encrypt(access_token);
      const encryptedT = encrypt(token);
      res
        .json({
          // eslint-disable-next-line @typescript-eslint/camelcase
          user_data: transformUserRecord,
          // eslint-disable-next-line @typescript-eslint/camelcase
          access_token: encryptedAT,
          token: encryptedT,
        })
        .status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/classroom', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling OAuth Sign-In endpoint');
    try {
      const authServiceInstance = Container.get(AuthService);
      const data = await authServiceInstance.getAccess(decrypt(req.body.access_token), decrypt(req.body.id_token));
      res.json(data).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/verify', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Verifying Email address token');
    try {
      const isVerified = await jwt.verify(req.query.token, config.appSecret);
      if (isVerified) {
        const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
        await UserModel.updateOne({ _id: isVerified._id }, { $set: { verified: true } });
        res.redirect('https://app.eklavya.tech/');
      } else {
        throw new Error('Invalid Token');
      }
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/verify_token', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Verifying OAuth2 token');
    const token = decrypt(req.headers.authorization.split(' ')[1]);
    try {
      const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
      let isVerified, userRecord;
      if (req.body.method != 'local') {
        const { data } = await axios({
          url: `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
          method: 'get',
        }).catch(_e => {
          throw new Error('Invalid OAuth2 Token');
        });
        if (data) {
          isVerified = data;
          userRecord = await UserModel.findOne({ 'OAuth2.Id': isVerified.sub });
        } else {
          throw new Error('Invalid Token');
        }
      } else {
        isVerified = await jwt.verify(token, config.appSecret);
        userRecord = await UserModel.findById(isVerified._id);
      }

      if (isVerified) {
        const data = userRecord.toObject();
        Reflect.deleteProperty(data, 'password');
        Reflect.deleteProperty(data, 'salt');
        const transformedData = transformUserData(data);
        if (transformedData) {
          res.status(200).json(transformedData);
        } else {
          throw new Error('Error Sending User Data');
        }
      } else {
        throw new Error('Invalid Token');
      }
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  /**
   * @TODO Let's leave this as a place holder for now
   * The reason for a logout route could be deleting a 'push notification token'
   * so the device stops receiving push notifications after logout.
   *
   * Another use case for advance/enterprise apps, you can store a record of the jwt token
   * emitted for the session and add it to a black list.
   * It's really annoying to develop that but if you had to, please use Redis as your data store
   */
  route.post('/logout', middlewares.isAuth, (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling Sign-Out endpoint with body: %o', req.body);
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      return res.status(200).end();
    } catch (e) {
      logger.error('🔥 error %o', e);
      return next(e);
    }
  });
};
