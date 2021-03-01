import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import ScrapperService from '../../../services/scrapper';
import RepositoryService from '../../../services/repository';
import { celebrate, Joi } from 'celebrate';
import middlewares from '../../middlewares';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  /**
   * * Scraper Handler..
   * ! Protected route `Authorization` header must be sent with Bearer TOKEN
   * @param scrapeURL: URL of the website to scrape.
   */
  app.use('/scrape', middlewares.isAuth, middlewares.attachCurrentUser, route);

  route.post(
    '/',
    celebrate({
      body: Joi.object({
        scrapeURL: Joi.string().required(),
      }),
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Scrapping quiz data from : %o', req.body.scrapeURL);
      try {
        /**
         * * 1. Okay! so here we are getting instance of scrapper and repository service.
         * ? @function Scrape: Scrapping Website @returns quiz data.
         * ? @function Store: Saving Scrapped data to @DB Repository.
         */

        const scrapeServiceInstance = Container.get(ScrapperService);
        const repositoryServiceInstance = Container.get(RepositoryService);
        const data = await scrapeServiceInstance.scrape(req.body.scrapeURL);
        // await repositoryServiceInstance.Store(data, req.body.scrapeURL);
        res.status(200).json({
          title: data.title,
          scrappedURL: req.body.scrapeURL,
          quizContent: data.ScrappedQuiz,
        });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
