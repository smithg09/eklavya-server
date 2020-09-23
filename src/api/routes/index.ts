import auth from './auth';
import agendash from './agendash';
import classroom from './classroom';
import questgen from './questgen';
import { Router } from 'express';

export default (app: Router) => {
  auth(app);
  questgen(app);
  agendash(app);
  classroom(app);
};
