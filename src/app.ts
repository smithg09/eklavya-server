import 'reflect-metadata'; // We need this in order to use @Decorators
import config from './config';
import express from 'express';
import Logger from './loaders/logger';

class BootstrapApp {
  private appModule: express.Application;

  constructor() {
    this.appModule = express();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    global.__basedir = __dirname;
    /**
     * A little hack here
     * Async/Await cannot used in Class methods
     * So instead Promises are used here
     * @method Preconfig
     **/
    new Promise(resolve => {

      /**
       * Import/Export can only be used in 'top-level code'
       * So using good old require statements.
       **/
      resolve(require('./loaders').default({ expressApp: this.appModule }));
    }).then(() => {
      this.createServer(this.appModule);
    });
  }

  private createServer(app: express.Application) {
    app.listen(config.port, (err: string) => {
      if (err) {
        Logger.error(err);
        process.exit(1);
      }
      Logger.info(`
           ********************************
           * 🛡️  Server listening on: ${config.port} *
           * 🌐 http://localhost:${config.port}     *
           ********************************
           `);
    });
  }
}

new BootstrapApp();
