/* eslint-disable @typescript-eslint/camelcase */
import { Container } from 'typedi';
import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
import path from 'path';
import { createWorker } from 'tesseract.js';
import tesseract from 'node-tesseract-ocr';

@Service()
export default class OCRService {
  public tesseraact_config;

  Logger: Logger;
  constructor() {
    this.Logger = Container.get('logger');
    this.tesseraact_config = {
      lang: 'eng',
      oem: 1,
      psm: 3,
    };
  }

  public async recognizetext(img_src) {
    try {
      if (process.env.NODE_ENV != 'production') {
        const worker = createWorker({
          logger: m => console.log(m),
        });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const {
          data: { text },
        } = await worker.recognize(img_src);
        await worker.terminate();
        return text;
      } else {
        const text = await tesseract.recognize(img_src, this.tesseraact_config);
        return text;
      }
    } catch (e) {
      console.log(e);
      throw new Error("Couldn't recognize the text! Please try again");
    }
  }

}
