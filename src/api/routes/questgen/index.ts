import scrape from './scrape';
import repository from './repository';

import { Router } from 'express';

export default (app: Router) => {
  scrape(app);
  repository(app);
};
