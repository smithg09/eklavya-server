
import { Router } from 'express';
import forms from './forms';
import studentProctoring from './studentsProctoring';

export default (app: Router) => {
  forms(app)
  studentProctoring(app)
};
