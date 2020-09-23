import { Router, Request, Response } from 'express';
import subRoutes from './routes';
import graphQL from './graphql';
// import { spawn } from 'child_process';
// import path from 'path';

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

  /**
   * ! Below is a demo code for executing python using child spawn process
   * ! Do not push to prod server.
   *   app.post('/py', (_req: Request, _res: Response) => {
          var arg1 = _req.body.name;
          const pythonProcess = spawn('python', [path.join(global.__basedir, 'python', 'greet.py'), arg1]);
          pythonProcess.stdout.on('data', data => {
            _res.status(200).json({ 'python-script': data.toString() });
          });
      });
   */

  app.post('/ocr', async (_req: Request, _res: Response) => {
    /**
     * !below code is using native js tesseract use as a fallback if error occured.
     */
    // const worker = createWorker({
    //   logger: m => console.log(m),
    // });
    // const image = path.resolve(__dirname, _req.body.image);
    // console.log(image);
    // await worker.load();
    // await worker.loadLanguage('eng');
    // await worker.initialize('eng');
    // const {
    //   data: { text },
    // } = await worker.recognize(image);
    // await worker.terminate();
    var data = 'text';
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
    _res.json(qa);
  });

  return app;
};
