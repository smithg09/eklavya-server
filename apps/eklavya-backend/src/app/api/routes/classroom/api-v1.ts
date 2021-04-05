import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import { GoogleApis } from 'googleapis';
import { environment } from '../../../../environments/environment';
import { reject } from 'lodash';
import ClassroomService from '../../../services/classroom';
import middlewares from '../../middlewares';
import { IUser } from '../../../interfaces/IUser';
import mongoose from 'mongoose';

const route = Router();

export const setOAuth2Credentials = async (access_token, token) => {
	const googleApiInstance: GoogleApis = Container.get('googleapis');
	const auth = new googleApiInstance.auth.OAuth2(
		environment.OAuth2.clientId,
		environment.OAuth2.clientSecret,
		'postmessage',
	);
	await auth.setCredentials({
		access_token: access_token,
		id_token: token,
	});
	return { auth };
}

export default (app: Router) => {
	app.use('/classroom', middlewares.isAuth, middlewares.attachCurrentUser, route);

	let groupResponseByUserId = (array, key) => {
		const filteredar = array.reduce((result, obj) => {
			(result[obj[key]] = result[obj[key]] || []).push(obj);
			return result;
		}, {});
		if (filteredar !== {}) {
			return Object.keys(filteredar).map(el => {
				return { userId: el, grades: filteredar[el] };
			});
		}
	};

	route.post('/courses/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const courses = await new Promise(resolve => {
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
			res.json({ courses });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courses/create', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const course = await new Promise(resolve => {
				classroom.courses.create(
					{
						requestBody: {
							name: req.body.name,
							description: req.body.description,
							section: req.body.section,
						},
					},
					(err, res) => {
						if (err) return console.error('The API returned an error: ' + err);
						const course = res.data.courses;
						if (course && course.length) {
							resolve(course);
						} else {
							reject({ message: 'No courses found.' });
						}
					},
				);
			});
			res.json({ course });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/announcements/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const announcements = await new Promise(resolve => {
				classroom.courses.announcements.list(
					{
						courseId: req.body.courseId,
					},
					(err, res) => {
						if (err) throw new Error('The API returned an error: ' + err);
						const announcements = res.data.announcements;
						if (announcements && announcements.length) {
							resolve(announcements);
						} else {
							reject({ message: 'No announcements found.' });
						}
					},
				);
			});
			res.json({ announcements });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/announcements/create', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.announcements.create({
				courseId: req.body.courseId,
				requestBody: {
					text: req.body.announcementText,
				},
			});
			res.json({ announcement: response.data });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courseWork/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.list({
				courseId: req.body.courseId,
			});
			res.json({ courseWork: response.data });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courseWork/create', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.create({
				courseId: req.body.courseId,
				requestBody: {
					materials: [
						{
							driveFile: {
								driveFile: {
									id: req.body.fileId,
								},
								shareMode: 'VIEW',
							},
						},
					],
					maxPoints: req.body.maxPoints,
					title: req.body.title,
					workType: 'ASSIGNMENT',
					dueDate: {
						day: req.body.day,
						month: req.body.month,
						year: req.body.year,
					},
					dueTime: {
						hours: req.body.hours,
						minutes: req.body.minutes,
					},
					associatedWithDeveloper: true,
					assigneeMode: 'ALL_STUDENTS',
					state: 'PUBLISHED',
				},
			});
			res.json({ courseWork: response.data });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courseWork/studentSubmissions/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.studentSubmissions.list({
				courseId: req.body.courseId,
				courseWorkId: '-',
			});
			res.json({ studentSubmissions: response.data });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post(
		'/courseWork/studentSubmissions/modifyAttachments',
		async (req: Request, res: Response, next: NextFunction) => {
			const logger: Logger = Container.get('logger');
			try {
				const googleApiInstance: GoogleApis = Container.get('googleapis');
				const { auth } = await setOAuth2Credentials(req.access_token, req.token);
				const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
				const response = await classroom.courses.courseWork.studentSubmissions.modifyAttachments({
					courseId: req.body.courseId,
					courseWorkId: req.body.courseWorkId,
					id: req.body.id,
					requestBody: {
						addAttachments: [
							{
								driveFile: {
									id: req.body.fileId,
								},
							},
						],
					},
				});
				res.json({ studentSubmission: response.data });
			} catch (e) {
				logger.error('🔥 error: %o', e);
				return next(e);
			}
		},
	);

	route.post('/courseWork/studentSubmissions/turnIn', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.studentSubmissions.turnIn({
				courseId: req.body.courseId,
				courseWorkId: req.body.courseWorkId,
				id: req.body.id,
			});
			res.json({ turnedIn: Object.keys(response.data).length === 0 ? true : false });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courseWork/studentSubmissions/grades', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.studentSubmissions.patch({
				courseId: req.body.courseId,
				courseWorkId: req.body.courseWorkId,
				id: req.body.id,
				updateMask: 'assignedGrade',
				requestBody: {
					assignedGrade: req.body.grades,
					// draftGrade: req.body.grades,
				},
			});
			res.json({ studentSubmission: response.data });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courses/students/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.students.list({
				courseId: req.body.courseId,
			});
			res.json({ students: response.data.students });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/courses/teachers/list', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.teachers.list({
				courseId: req.body.courseId,
			});
			res.json({ teachers: response.data.teachers });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/invitations/create', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			req.body.invitations.forEach(invitees => {
				classroom.invitations.create({
					requestBody: {
						courseId: req.body.courseId,
						role: invitees.role,
						userId: invitees.userMail,
					},
				});
			});
			res.json({ invitation: 'sent' });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/assignments/pending', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.studentSubmissions.list({
				courseId: req.body.courseId,
				courseWorkId: '-',
				states: ['NEW', 'CREATED', 'RETURNED', 'RECLAIMED_BY_STUDENT'],
			});
			const filteredId = response.data.studentSubmissions.map(el => el.courseWorkId);
			const courseWorkResponse = await classroom.courses.courseWork.list({
				courseId: req.body.courseId,
			});
			const pendingAssignments = courseWorkResponse.data.courseWork.filter(courseWork =>
				filteredId.includes(courseWork.id),
			);
			res.json({ pendingAssignments, total: pendingAssignments.length });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});

	route.post('/reports', async (req: Request, res: Response, next: NextFunction) => {
		const logger: Logger = Container.get('logger');
		try {
			const googleApiInstance: GoogleApis = Container.get('googleapis');
			const { auth } = await setOAuth2Credentials(req.access_token, req.token);
			const classroom = await googleApiInstance.classroom({ version: 'v1', auth });
			const response = await classroom.courses.courseWork.studentSubmissions.list({
				courseId: req.body.courseId,
				courseWorkId: '-',
				fields: 'studentSubmissions(courseId,courseWorkId,id,userId,submissionHistory(gradeHistory))',
			});
			const responseWithGradeHistory = response.data.studentSubmissions
				.filter(el => el.submissionHistory)
				.filter(el => el.submissionHistory.length > 1);
			const groupedUserResponse = groupResponseByUserId(responseWithGradeHistory, 'userId');
			const courseWorkList = await classroom.courses.courseWork.list({
				courseId: req.body.courseId,
				fields: 'courseWork(id,title)',
			});
			const groupedCourseWorkAndGrades = [];
			await groupedUserResponse.forEach(res => {
				res.grades.map(el => {
					courseWorkList.data.courseWork
						.map(ccel => {
							if (ccel.id === el.courseWorkId) {
								groupedCourseWorkAndGrades.push({ ...el, title: ccel.title });
							}
						})
						.filter(el => el);
				});
			});
			const groupedUserReponse = groupResponseByUserId(groupedCourseWorkAndGrades, 'userId');
			const userModel = Container.get('userModel') as mongoose.Model<IUser & mongoose.Document>;
			groupedUserReponse.map(async el => {
				const dbSchemamap = await el.grades.map(grade => {
					const filteredGrade = grade.submissionHistory
						.filter(el => Object.keys(el).length)
						.filter(el => Object.keys(el).includes('gradeHistory'));
					return {
						courseId: grade.courseId,
						courseWorkId: grade.courseWorkId,
						id: grade.id,
						title: grade.title,
						grades: filteredGrade[0].gradeHistory.pointsEarned,
						maxGrades: filteredGrade[0].gradeHistory.maxPoints,
					};
				});
				await userModel.updateOne({ oauth2id: el.userId }, { $set: { classreport: dbSchemamap } });
			});
			res.json({ userGrades: groupedUserReponse });
		} catch (e) {
			logger.error('🔥 error: %o', e);
			return next(e);
		}
	});
};
