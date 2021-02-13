import { IRepository } from './../interfaces/IRepository';
import { Service, Inject } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
// import repository from '../models/repository';

@Service()
export default class RepositoryService {
	stopwords = [
		'i',
		'me',
		'my',
		'myself',
		'we',
		'our',
		'ours',
		'ourselves',
		'you',
		'your',
		'yours',
		'yourself',
		'yourselves',
		'he',
		'him',
		'his',
		'himself',
		'she',
		'her',
		'hers',
		'herself',
		'it',
		'its',
		'itself',
		'they',
		'them',
		'their',
		'theirs',
		'themselves',
		'what',
		'which',
		'who',
		'whom',
		'this',
		'that',
		'these',
		'those',
		'am',
		'is',
		'are',
		'was',
		'were',
		'be',
		'been',
		'being',
		'have',
		'has',
		'had',
		'having',
		'do',
		'does',
		'did',
		'doing',
		'a',
		'an',
		'the',
		'and',
		'but',
		'if',
		'or',
		'because',
		'as',
		'until',
		'while',
		'of',
		'at',
		'by',
		'for',
		'with',
		'about',
		'against',
		'between',
		'into',
		'through',
		'during',
		'before',
		'after',
		'above',
		'below',
		'to',
		'from',
		'up',
		'down',
		'in',
		'out',
		'on',
		'off',
		'over',
		'under',
		'again',
		'further',
		'then',
		'once',
		'here',
		'there',
		'when',
		'where',
		'why',
		'how',
		'all',
		'any',
		'both',
		'each',
		'few',
		'more',
		'most',
		'other',
		'some',
		'such',
		'no',
		'nor',
		'not',
		'only',
		'own',
		'same',
		'so',
		'than',
		'too',
		'very',
		's',
		't',
		'can',
		'will',
		'just',
		'don',
		'should',
		'now',
	];
	constructor(
		@Inject('repositoryModel') private repositoryModel: Models.RepositoryModelArray,
		@Inject('logger') private logger,
		@EventDispatcher() private eventDispatcher: EventDispatcherInterface,
	) {}

	public async Store(repositoryInputDTO, sourceURL) {
		try {
			this.logger.silly('Saving Quiz Data..');
			const keywords = repositoryInputDTO.title
				.replace('-', '')
				.split(' ')
				.filter(el => {
					return el != '' && !this.stopwords.includes(el);
				});

			const transformedRepository = repositoryInputDTO.ScrappedQuiz.map(el => {
				return {
					title: repositoryInputDTO.title,
					keywords,
					source: sourceURL,
					question: el.question,
					options: el.options,
					answer: el.answer,
				};
			});
			const repositoryRecord = await this.repositoryModel.insertMany(transformedRepository);

			if (!repositoryRecord) {
				throw new Error('Data cannot be saved');
			}

			return;
		} catch (e) {
			if (e.code === 11000) {
				return;
			} else {
				this.logger.error(e);
				throw new Error('Error Saving Repository Data');
			}
		}
  }

  public async StoreRepositories(repositoryInputDTO, sourceURL) {
    try {
      this.logger.silly('Saving Forms Data Into Repositories..');
      const transformedRepository = repositoryInputDTO.content.map(content => {
        return {
          title: repositoryInputDTO.title,
          keywords: repositoryInputDTO.keywords,
          source: sourceURL,
          question: content.question,
          options: content.options,
          answer: content.answer,
          weightage: content.weightage || 0,
          flagged: content.flagged || false,
          subjects: content.subject || null,
        };
      });
      const ids = this.repositoryModel.insertMany(transformedRepository).then(res => {
        return res.map(el => el._id)
      })
      if (!ids) {
        throw new Error('Data cannot be saved');
      }
      return ids;
    } catch (e) {
      if (e.code === 11000) {
        return;
      } else {
        this.logger.error(e);
        throw new Error('Error Saving Repository Data');
      }
    }
  }
}
