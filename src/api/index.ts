import { Router, Request, Response } from 'express';
import auth from './routes/auth';
import scrape from './routes/scrape';
import repository from './routes/repository';
import agendash from './routes/agendash';
import graphQL from './graphql';
import classroom from './routes/classroom';
import { spawn } from 'child_process';
import path from 'path';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  classroom(app);
  scrape(app);
  repository(app);
  graphQL(app);
  agendash(app);

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

  app.post('/py', (_req: Request, _res: Response) => {
    var arg1 = _req.body.name;
    const pythonProcess = spawn('python', [path.join(global.__basedir, 'python', 'greet.py'), arg1]);
    pythonProcess.stdout.on('data', data => {
      _res.status(200).json({ 'python-script': data.toString() });
    });
  });

  return app;
};
