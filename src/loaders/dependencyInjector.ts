import { Container } from 'typedi';
import LoggerInstance from './logger';
import agendaFactory from './agenda';
import Agenda from 'agenda';
import mailer from 'nodemailer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { google } = require('googleapis');

export default ({ mongoConnection, models }: { mongoConnection; models: { name: string; model: any }[] }) => {
  try {
    models.forEach(m => {
      Container.set(m.name, m.model);
    });

    var nodeMailerTransport = mailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 25,
      secure: process.env.NODE_ENV === 'development' ? false : true,
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_SECRET,
      },
    });

    nodeMailerTransport.verify(function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });

    const agendaInstance: Agenda = agendaFactory({ mongoConnection });
    Container.set('googleapis', google);
    LoggerInstance.info('✌️ GoogleApis loaded');
    Container.set('agendaInstance', agendaInstance);
    Container.set('logger', LoggerInstance);
    Container.set('NodeMailerClient', nodeMailerTransport);
    LoggerInstance.info('✌️ Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
