
import { Router } from 'express';
import forms from './forms';

export default (app: Router) => {
  forms(app)
};
