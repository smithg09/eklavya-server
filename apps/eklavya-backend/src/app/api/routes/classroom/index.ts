import apiV1 from './api-v1';
import wrapper from './wrapper';

import { Router } from 'express';

export default (app: Router) => {
	apiV1(app);
	wrapper(app);
};
