import { Router, Request, Response } from 'express';
import subRoutes from './routes';
import graphQL from './graphql';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  subRoutes(app);
  graphQL(app);

  // Request to check if server running
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

  return app;
};
