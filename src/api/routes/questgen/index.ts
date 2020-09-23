import scrape from './scrape';
import repository from './repository';
import imageProcessing from './imageProcessing'

import { Router } from 'express';

export default (app: Router) => {
  scrape(app);
  repository(app);
  imageProcessing(app);
};
