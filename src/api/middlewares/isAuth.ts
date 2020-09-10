import jwt from 'jsonwebtoken';
import config from '../../config';
import { decrypt } from './cryptoAES';
import { Container } from 'typedi';
import mongoose from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import axios from 'axios';
import { Logger } from 'winston';

const getTokenFromHeader = req => {
  /**
   * @TODO Edge and Internet Explorer do some weird things with the headers
   * So I believe that this should handle more 'edge' cases ;)
   */
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    const AUTHORIZATION = req.headers.authorization.split(' ');
    return { authMethod: AUTHORIZATION[1], token: decrypt(AUTHORIZATION[2]) };
  }
  return null;
};

const isAuth = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Verifying JWT Token');
  const { authMethod, token } = getTokenFromHeader(req);
  try {
    if (authMethod != 'local') {
      const { data } = await axios({
        url: `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
        method: 'get',
      }).catch(_e => {
        throw new Error('Invalid OAuth2 Token');
      });
      if (data) {
        req.authMethod = authMethod;
        req.token = token;
        req.userId = data.sub;
        next();
      } else {
        throw new Error('Invalid Token');
      }
    } else {
      const data = await jwt.verify(token, config.appSecret);
      if (data) {
        req.authMethod = authMethod;
        req.token = token;
        req.userId = data._id;
        next();
      } else {
        throw new Error('Invalid Token');
      }
    }
  } catch (e) {
    logger.error('🔥 error: %o', e);
    return next(e);
  }
};

export default isAuth;
