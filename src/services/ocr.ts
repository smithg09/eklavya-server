/* eslint-disable @typescript-eslint/camelcase */
import { Container } from 'typedi';
import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
// import { createWorker } from 'tesseract.js';
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

  public async recognize(img_src) {
    try {
      const text = await tesseract.recognize(img_src, this.tesseraact_config);
      return text;
    } catch (e) {
      throw new Error("Couldn't recognize the text! Please try again");
    }
  }

}
