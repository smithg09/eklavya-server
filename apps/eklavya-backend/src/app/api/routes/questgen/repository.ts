import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
// import RepositoryService from '../../services/repository';
import mongoose from 'mongoose';
import { IRepository } from '../../../interfaces/IRepository';
import middlewares from '../../middlewares';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
	/**
	 * * ALl Repository Methods Handler..
	 *
	 * ! Protected route `Authorization` header must be sent with Bearer TOKEN
	 *
	 * TODO Filter: create a route for filtering repository data into various options like subjects , topics , specific keywords etc..
	 */
	app.use('/repositoryData', middlewares.isAuth, route);

	route.post('/all', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Getting Repository Data');
		try {
			const repositoryModel = Container.get('repositoryModel') as mongoose.Model<IRepository & mongoose.Document>;
			const repositoryData = await repositoryModel.find({});

			res.status(200).json(repositoryData);
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Getting %o data', req.params.id);
		try {
			const repositoryModel = Container.get('repositoryModel') as mongoose.Model<IRepository & mongoose.Document>;
			const data = await repositoryModel.findById(req.params.id);

			res.status(200).json(data);
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});
};
