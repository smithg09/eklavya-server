import { Container, Service } from 'typedi';
// import { Service, Inject } from 'typedi';
import { Logger } from 'winston';
// import path from 'path';
import { createWorker } from 'tesseract.js';
import tesseract from 'node-tesseract-ocr';

@Service()
export default class OCRService {
  public tesseraact_config;

  /**
   * Steps to process image before applying OCR :
   * 1. convert -resize 300% img.png img.png
   * 2. convert -contrast-stretch 3.55x3.45% img.png img.png
   * 3. convert [input_file_path] -type Grayscale [output_file_path]
   * 4. convert [input_file_path] -threshold 60% [output_file_path]
   * 5. convert [input_file_path] -deskew 90% [output_file_path]
   */

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
      if (process.env.NODE_ENV == 'production') {
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
