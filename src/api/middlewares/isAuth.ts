/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from 'jsonwebtoken';
import config from '../../config';
import { decrypt } from './cryptoAES';
import { Container } from 'typedi';
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
    let auth_token = null;
    const AUTHORIZATION = req.headers.authorization.split(' ');
    if (req.headers.access_token) {
      auth_token = req.headers.access_token;
    }
    return {
      authMethod: AUTHORIZATION[1],
      token: decrypt(AUTHORIZATION[2]),
      authToken: (auth_token && decrypt(auth_token)) || null,
    };
  }
  return null;
};

const isAuth = async (req, res, next) => {
  const logger: Logger = Container.get('logger');
  logger.debug('Verifying JWT Token');
  const { authMethod, token, authToken } = getTokenFromHeader(req);
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
        req.access_token = authToken;
        return next();
      } else {
        throw new Error('Invalid Token');
      }
    } else {
      const data = await jwt.verify(token, config.appSecret);
      if (data) {
        req.authMethod = authMethod;
        req.token = token;
        req.userId = data._id;
        req.access_token = null;
        return next();
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
