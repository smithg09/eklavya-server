import { IForms } from './../../../interfaces/IForms';
import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import mongoose from 'mongoose';
import middlewares from '../../middlewares';
import RepositoryService from '../../../services/repository';

const route = Router();

export default (app: Router) => {
  app.use('/proctored/forms', route);

  route.get('/', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Fetch All Forms');
    try {
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      const response = await FormsModel.find({ owner: req.currentUser._id }).populate('content').populate('owner',{_id: 1,name: 1,email: 1})
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.get('/:id', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Fetch All Classrooms');
    try {
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      const response = await FormsModel.findById({ _id: req.params.id, owner: req.currentUser._id }).populate('content').populate('owner', { _id: 1, name: 1, email: 1 })
      if (!response) {
        throw new Error('No Form Data Found!')
      }
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });

  route.post('/', middlewares.isAuth, middlewares.attachCurrentUser, async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Fetch All Classrooms');
    try {
      const repositoryServiceInstance = Container.get(RepositoryService);
      const ids = await repositoryServiceInstance.StoreRepositories(req.body, 'local');
      const FormsModel = Container.get('formsModel') as mongoose.Model<IForms & mongoose.Document>;
      const FormsReponse = await FormsModel.create({
        title: req.body.title,
        description: req.body.description,
        content: ids || [],
        attempts: req.body.attempts || 1,
        users: req.body.users || [],
        class: req.body.class || [],
        division: req.body.division || [],
        duration: req.body.duration,
        owner: req.currentUser._id,
        visibility: req.body.visibility || false,
        view_count: req.body.view_count || 0,
        results: null,
        schedule: {
          startTimeStamp: req.body.schedule.startTimeStamp,
          endTimeStamp: req.body.schedule.endTimeStamp
        },
      })

      console.log(FormsReponse)
      if (!FormsReponse) {
        throw new Error('Form cannot be created');
      }

      const response = await FormsModel.findById(FormsReponse._id).populate('content')
      res.json(response).status(200);
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return next(e);
    }
  });
};
