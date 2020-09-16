/* eslint-disable @typescript-eslint/no-unused-vars */
import { Document, Model } from 'mongoose';
import { IUser } from '../../interfaces/IUser';
import { IRepository } from '../../interfaces/IRepository';
declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
      access_token: string;
      token: string;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
    export type RepositoryModel = Model<IRepository & Document>;
  }
}
