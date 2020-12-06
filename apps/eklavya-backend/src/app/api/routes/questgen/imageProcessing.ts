import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
// import RepositoryService from '../../services/repository';
// import mongoose from 'mongoose';
// import { IRepository } from '../../../interfaces/IRepository';
import OCRService from '../../../services/ocr';
import { Logger } from 'winston';
import { spawn } from 'child_process';
import path from 'path';

const route = Router();

export default (app: Router) => {
	app.use('/processImage', route);

	route.post('/filtertext', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Getting data from image!');
		try {
			const OCRServiceInstance = Container.get(OCRService);
			const payload = await OCRServiceInstance.recognizetext(req.body.image);
			/**
			 * !below code is using native js tesseract use as a fallback if error occured.
			 */
			const data = payload;
			const newfa = data.split('\n');
			const re1 = /^[A-Za-z1-9]+\.|\)/;
			const newaw = newfa.filter(el => re1.test(el));
			let answer = [];
			let qa = [];
			const newre1 = /^[A-Za-z]+\.|\)/;
			const newre = /^[0-9]+\.|\)/;
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			for (let i = 0; i <= newaw.length; i++) {
				const i = 0;
				if (newre.test(newaw[i])) {
					const q = newaw.shift();
					while (newre1.test(newaw[i])) {
						answer.push(newaw[i]);
						newaw.shift();
					}
					qa.push({ options: answer, question: q });
					answer = [];
				}
			}
			res.status(200).json(qa);
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/generateMCQ', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		logger.debug('Getting data from image!');
		try {
			// const OCRServiceInstance = Container.get(OCRService);
			// const payload = await OCRServiceInstance.recognizetext(req.body.image);

			const payload = `Big data analytics helps organizations harness their data and use it to identify new opportunities. That, in turn, leads to smarter business moves, more efficient operations, higher profits and happier customers. In his report Big Data in Big Companies, IIA Director of Research Tom Davenport interviewed more than 50 businesses to understand how they used big data. He found they got value in the following ways:
      Cost reduction. Big data technologies such as Hadoop and cloud-based analytics bring significant cost advantages when it comes to storing large amounts of data – plus they can identify more efficient ways of doing business.
      Faster, better decision making. With the speed of Hadoop and in-memory analytics, combined with the ability to analyze new sources of data, businesses are able to analyze information immediately – and make decisions based on what they’ve learned.
      New products and services. With the ability to gauge customer needs and satisfaction through analytics comes the power to give customers what they want. Davenport points out that with big data analytics, more companies are creating new products to meet customers’ needs.`;

			const op = 'all';
			const pythonProcess = spawn('python', [path.join(__dirname,'python', 'questgenMCQ.py'), payload, op]);
			pythonProcess.stdout.on('data', data => {
				res.json({ data: data.toString() });
			});
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});
};
