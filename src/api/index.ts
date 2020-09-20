import { Router, Request, Response } from 'express';
import auth from './routes/auth';
import scrape from './routes/scrape';
import repository from './routes/repository';
import agendash from './routes/agendash';
import graphQL from './graphql';
import classroom from './routes/classroom';
import { spawn } from 'child_process';
import path from 'path';
import { createWorker } from 'tesseract.js';

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

  app.post('/by', (_req: Request, _res: Response) => {
    const pythonProcess = spawn('python', [path.join(global.__basedir, 'python', 'bycryptp.py')]);
    pythonProcess.stdout.on('data', data => {
      _res.status(200).json({ 'bycrypt-script': data.toString() });
    });
  });

  app.post('/ocr', async (_req: Request, _res: Response) => {
    const worker = createWorker({
      logger: m => console.log(m),
    });
    const image = path.resolve(__dirname, _req.body.image);
    console.log(image);
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const {
      data: { text },
    } = await worker.recognize(image);
    await worker.terminate();
    var data = text;
    var newfa = data.split('\n');
    console.log(newfa)
    var re1 = /^[A-Za-z1-9]+\.|\)/;
    var newaw = newfa.filter(el => re1.test(el));
    var answer = [];
    var qa = [];
    var newre1 = /^[A-Za-z]+\.|\)/;
    var newre = /^[0-9]+\.|\)/;
    var qa = [];
    console.log(newaw)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    for (i = 0; i <= newaw.length; i++) {
      var i = 0;
      console.log(newaw)
      if (newre.test(newaw[i])) {
        var q = newaw.shift();
        while (newre1.test(newaw[i])) {
          console.log(newaw[i])
          answer.push(newaw[i]);
          newaw.shift();
        }
        qa.push({ answers: answer, question: q });
        answer = [];
      }
    }
    _res.json(qa);
  });

  return app;
};
