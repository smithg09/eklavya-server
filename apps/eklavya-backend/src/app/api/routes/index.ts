import auth from './auth';
import agendash from './agendash';
import classroom from './classroom';
import questgen from './questgen';
import { Router, Request, Response } from 'express';

export default (app: Router) => {
	auth(app);
	questgen(app);
	agendash(app);
  classroom(app);

  app.get('/ping', (_req: Request, _res: Response) => {
    _res.status(200).json({
      status: 200,
      message: 'Server Connected',
    });
  });

  app.get('/documentation', (_req: Request, _res: Response) => {
    _res
      .status(200)
      .send(
        'Please Visit this link for API documentation : https://documenter.getpostman.com/view/9636093/T1LJjo6Y?version=latest',
      );
  });
};
