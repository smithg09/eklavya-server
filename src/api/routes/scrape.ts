import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import ScrapperService from '../../services/scrapper';
import RepositoryService from '../../services/repository';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';
import { title } from 'process';

const route = Router();

export default (app: Router) => {
  app.use('/scrape', route);

  route.get(
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
        const scrapeServiceInstance = Container.get(ScrapperService);
        const repositoryServiceInstance = Container.get(RepositoryService);
        const data = await scrapeServiceInstance.scrape(req.body.scrapeURL);
        await repositoryServiceInstance.Store(data, req.body.scrapeURL);
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
