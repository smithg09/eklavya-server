import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
// import RepositoryService from '../../services/repository';
// import mongoose from 'mongoose';
// import { IRepository } from '../../../interfaces/IRepository';
import middlewares from '../../middlewares';
import OCRService from '../../../services/ocr';
import { Logger } from 'winston';
import { spawn } from 'child_process';
import path from 'path';

const route = Router();

export default (app: Router) => {
  app.use('/processImage', middlewares.isAuth, route);

  route.post('/filtertext', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Getting data from image!');
    try {
      const OCRServiceInstance = Container.get(OCRService);
      const text = await OCRServiceInstance.recognizetext(req.body.image);
      /**
       * !below code is using native js tesseract use as a fallback if error occured.
       */
      var data = text;
      var newfa = data.split('\n');
      var re1 = /^[A-Za-z1-9]+\.|\)/;
      var newaw = newfa.filter(el => re1.test(el));
      var answer = [];
      var qa = [];
      var newre1 = /^[A-Za-z]+\.|\)/;
      var newre = /^[0-9]+\.|\)/;
      var qa = [];
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      for (i = 0; i <= newaw.length; i++) {
        var i = 0;
        if (newre.test(newaw[i])) {
          var q = newaw.shift();
          while (newre1.test(newaw[i])) {
            answer.push(newaw[i]);
            newaw.shift();
          }
          qa.push({ options: answer, question: q });
          answer = [];
        }
      }
      res.status(200).json(qa);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/generateMCQ', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Getting data from image!');
    try {
      const OCRServiceInstance = Container.get(OCRService);
      const text = await OCRServiceInstance.recognizetext(req.body.image);
      /**
       * ! Below is a demo code for executing python using child spawn process
       * ! Do not push to prod server.
       */
      const pythonProcess = spawn('python', [path.join(global.__basedir, 'python', 'greet.py'), text]);
      pythonProcess.stdout.on('data', data => {
        return data.toString();
      });
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
