import { Service, Inject } from 'typedi';
import MailerService from './mailer';
import { Container } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { reject } from 'lodash';
import { GoogleApis } from 'googleapis';

@Service()
export default class ClassroomService {
	constructor(
		@Inject('userModel') private userModel: Models.UserModel,
		private mailer: MailerService,
		@Inject('logger') private logger,
		@EventDispatcher() private eventDispatcher: EventDispatcherInterface,
	) {}

	public async fetchClassrooms(access_token, id_token) {
		const googleApiInstance: GoogleApis = Container.get('googleapis');
		const auth = new googleApiInstance.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'postmessage');
		// const token = await this.GetOAuthAccessToken(code);
		await auth.setCredentials({
			access_token,
			id_token,
		});
		const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
		return new Promise(resolve => {
			classroom.courses.list(
				{
					pageSize: 10,
				},
				(err, res) => {
					if (err) return console.error('The API returned an error: ' + err);
					const courses = res.data.courses;
					if (courses && courses.length) {
						resolve(courses);
					} else {
						reject({ message: 'No courses found.' });
					}
				},
			);
		});
	}
}
