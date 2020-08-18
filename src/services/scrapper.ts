/* eslint-disable @typescript-eslint/camelcase */
import { Service, Inject } from 'typedi';
import axios from 'axios';
import cheerio from 'cheerio';

@Service()
export default class ScrapperService {
  constructor(@Inject('logger') private logger, @Inject('userModel') private userModel: Models.UserModel) {}

  public async scrape(scrapeURL: string) {
    try {
      this.logger.silly('Getting raw HTML page');
      let ScrappedQuiz;
      if (/(sanfoundry.com)+/.test(scrapeURL)) {
        ScrappedQuiz = await this.scrapeSansIncomingData(scrapeURL);
      } else if (/indiabix.com/.test(scrapeURL)) {
        ScrappedQuiz = await this.scrapeIndiaBixIncomingData(scrapeURL);
      } else {
        throw new Error('Specified Not Supported');
      }
      return {
        title: ScrappedQuiz.header,
        ScrappedQuiz: ScrappedQuiz.scrappedQuiz,
      };
    } catch (e) {
      console.log(e);
      if (e.message.split(' ').includes('Specified', 'Not', 'Supported')) {
        throw new Error('Website You Specified Is Not Supported Yet!');
      } else {
        throw new Error('Error Scrapping Website, Please check the URL!');
      }
    }
  }

  public async scrapeIndiaBixIncomingData(scrapeURL: string) {
    try {
      const rawHTMLPage = await axios.get(scrapeURL);
      var $ = cheerio.load(rawHTMLPage.data),
        header = $('.pagehead').text();
      let questions = [];
      await $('.main-left .bix-td-qtxt').each(function(i, elem) {
        questions.push($(elem).html());
      });
      let options = [];
      $('.main-left .bix-tbl-options tbody').each(function(i, elem) {
        var optemp = [];
        $(elem)
          .find('tr')
          .each(function(i, el) {
            var opSingleTemp = $(el)
              .find('td:nth-last-child(1)')
              .text();
            optemp.push(opSingleTemp);
          })
          .text();
        options.push(optemp);
      });

      let answers = [];
      $('.main-left span.jq-hdnakqb').each(function(i, elem) {
        answers.push($(this).text());
      });

      var scrappedQuiz = questions.map((el, index) => {
        return { question: el, options: options[index], answer: answers[index] };
      });
      return { header, scrappedQuiz };
    } catch (e) {
      console.log(e);
      throw new Error('Error Scrapping IndiaBix, Please check the URL!');
    }
  }

  public async scrapeSansIncomingData(scrapeURL: string) {
    try {
      const rawHTMLPage = await axios.get(scrapeURL);
      let $ = cheerio.load(rawHTMLPage.data),
        quizBlock = $('.entry-content')
          .find('p')
          .text()
          .split('View Answer');

      let header = $('h1.entry-title')
        .text()
        .replace('Questions and Answers', '');
      this.logger.silly('Getting Answers');
      let answers = [];
      $('p ~ .collapseomatic_content').each(function(i, elem) {
        answers.push(
          $(this)
            .text()
            .split('\n')
            .slice(0, 1)[0]
            .replace(' Answer: ', ''),
        );
      });

      this.logger.silly('Filtering quesitiosn & options');
      let IndividualHTMLEl = [];
      quizBlock.forEach(el => {
        IndividualHTMLEl.push(el.split('\n'));
      });

      let questions = [];
      let options = [];

      IndividualHTMLEl.forEach((el, index) => {
        if (index == 0) {
          questions.push(['1.' + el.slice(0, el.findIndex(el => el.includes('a)')))[0].split('1.')[1]]);
        } else {
          questions.push(el.slice(0, el.findIndex(el => el.includes('a)'))));
        }
        let filterOptions = el.slice(el.findIndex(el => el.includes('a)')));
        filterOptions.pop();
        options.push(filterOptions);
      });

      questions.pop();
      options.pop();

      this.logger.silly('Mapping into single quiz block');
      let scrappedQuiz = questions.map((el, index) => {
        return { question: el, options: options[index], answer: answers[index] };
      });

      return { header, scrappedQuiz };
    } catch (e) {
      throw new Error('Error Scrapping Sanfoundry, Please check the URL!');
    }
  }
}
