import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import ClassroomService from '../../../services/classroom';
import middlewares from '../../middlewares';

const route = Router();

export default (app: Router) => {
	app.use('/classroom', route);

	route.post('/', middlewares.isAuth, async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Fetch All Classrooms');
		try {
			const classroomServiceInstance = Container.get(ClassroomService);
			const data = await classroomServiceInstance.fetchClassrooms(req.access_token, req.token);
			res.json(data).status(200);
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});
};
