import { IForms } from './../../../interfaces/IForms';
import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import mongoose from 'mongoose';
import middlewares from '../../middlewares';
import { pubsub } from '../../graphql/pubsub'
import { IRepository } from '../../../interfaces/IRepository';
const route = Router();

export default (app: Router) => {
  app.use('/proctored/students/', middlewares.isAuth, middlewares.attachCurrentUser, middlewares.isStudent, route);

  route.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Fetch All Forms');
    try {
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      console.log(req.currentUser)
      const response = await FormsModel.find({ $or:[{division:req.currentUser.division},{users:req.currentUser.email}] }).populate('content').populate('owner', { _id: 1, name: 1, email: 1 })
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Fetch Form By Id');
    try {
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      const response = await FormsModel.findById({ _id: req.params.id, $or:[{class:req.currentUser.division},{users:req.currentUser.email}]}).populate('content').populate('owner', { _id: 1, name: 1, email: 1 })
      if (!response) {
        throw new Error('No Form Data Found!')
      }
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/proctoredWarning', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    try {
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      console.log(req.currentUser)
      await FormsModel.updateOne({ _id: req.body.formID }, { $push: { proctoredWarnings: { user: req.currentUser._id, warning: req.body.warning } } })
      const response = await FormsModel.findById(req.body.formID).populate('content').populate('owner', { _id: 1, name: 1, email: 1 }).populate('proctoredWarnings proctoredWarnings.user', { name: 1, email: 1 })
      pubsub.publish('PROCTORING_WARNING', {
        proctoredWarning: response
      });
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/submitResult', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    try {
      const formsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      const studentsResponse = req.body.studentsResponse
      let resultUpdateArr = [] as unknown as [{ contentId: string, isAnswerRight: boolean }]
      await studentsResponse.forEach(res => {
        if (res.availableAnswer.includes(res.selectedAnswer)) {
          resultUpdateArr.push({ contentId: res.contentId, isAnswerRight: true})
        } else {
          resultUpdateArr.push({ contentId: res.contentId, isAnswerRight: false })
        }
      });
      const updateObj:{ user: string, result: [{ contentId: string, isAnswerRight: boolean }]} = { user: req.currentUser._id, result: resultUpdateArr }
      console.log({ updateObj })
      await formsModel.updateOne({ _id: req.body.formId }, { $push: { results: updateObj } })
      const responseBody = await formsModel.findById(req.body.formId).populate('content').populate('owner', { _id: 1, name: 1, email: 1 }).populate('results.user', { _id: 1, name: 1, email: 1 }).populate('proctoredWarnings.user', { _id: 1, name: 1, email: 1})
      await res.json(responseBody);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
