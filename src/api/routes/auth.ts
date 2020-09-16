/* eslint-disable prettier/prettier */
import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
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
        mobileno: Joi.number(),
        class: Joi.string(),
        uid: Joi.number(),
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

  route.patch(
    '/profile_patch',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling profile patch endpoint');
      try {
        const UserModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
        const userId = req.currentUser._id;
        if (req.currentUser.profileCompletion != true) {
          const pendingValues = new Set(
            Object.keys(req.currentUser).filter(
              El => req.currentUser[El] == null && El != 'lastLogin' && El != 'image',
            ),
          );
          const receivedValues = Object.keys(req.body).filter(El => pendingValues.has(El));
          if (receivedValues.length > 0) {
            let subQuery = {};
            await receivedValues.map(patchVal => {
              subQuery[patchVal] = req.body[patchVal];
            });
            const customQuery = {
              $set: subQuery,
            };
            const patchRes = await UserModel.updateOne({ _id: userId }, customQuery);
            if (patchRes) {
              const userData = await UserModel.findById(userId);
              let transformedData = transformUserData(userData.toObject());
              if (!transformedData.profileCompletion) {
                if (transformedData.role == 'faculty' || transformedData.role == 'staff') {
                  // eslint-disable-next-line prettier/prettier
                  var profilecompletion = (((4 - (Object.keys(transformedData).filter(El => transformedData[El] == null && El != 'lastLogin' && El != 'image' && El != 'class' && El != 'semester' && El != 'course').length)) / 4) * 100)
                  // console.log(profilecompletion)
                  if (profilecompletion === 100) {
                    await UserModel.updateOne(
                      { _id: userId },
                      { $set: { profileCompletion: true } },
                      { returnOriginal: true },
                    );
                  }
                } else {
                  var profilecompletion = (((7 - (Object.keys(transformedData).filter(El => transformedData[El] == null && El != 'lastLogin' && El != 'image').length)) / 7) * 100)
                  if (profilecompletion === 100) {
                    await UserModel.updateOne(
                      { _id: userId },
                      { $set: { profileCompletion: true } },
                      { returnOriginal: true },
                    );
                  }
                }
                const data = await UserModel.findById(userId);
                transformedData = transformUserData(data.toObject());
              }
              // eslint-disable-next-line @typescript-eslint/camelcase
              res.status(200).json({ user_data: transformedData });
            } else {
              throw new Error('Error Updating User Data');
            }
          } else {
            throw new Error('No values found to update!');
          }
        } else {
          const patchValues = Object.keys(req.body);
          if (patchValues.length > 0) {
            let subQuery = {};
            await patchValues.map(patchVal => {
              subQuery[patchVal] = req.body[patchVal];
            });
            const customQuery = {
              $set: subQuery,
            };
            const patchRes = await UserModel.updateOne({ _id: userId }, customQuery);
            if (patchRes) {
              const userData = await UserModel.findById(userId);
              let transformedData = transformUserData(userData.toObject());
              // eslint-disable-next-line @typescript-eslint/camelcase
              res.status(200).json({ user_data: transformedData });
            }
          }
        }
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

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

  route.post(
    '/verify_token',
    middlewares.isAuth,
    middlewares.attachCurrentUser,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Verifying OAuth2 token');
      try {
        // eslint-disable-next-line @typescript-eslint/camelcase
        res.json({ jwt: 'authorized', user_data: req.currentUser }).status(200);
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

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
