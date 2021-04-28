import { IOrganization } from './IOrganization'
export interface IUser {
  _id: string;
  method: string;
  OAuth2: { Id: string; picture: string };
  name: string;
  email: string;
  password: string;
  picture: string;
  mobileno: number;
  division: string;
  uid: number;
  semester: number;
  department: string;
  rollNo: number;
  course: string;
  organization: IOrganization;
  role: string;
  verified: boolean;
  profileCompletion: boolean;
  lastLogin: Date;
  classreport:
    {
      courseId: string;
      courseWorkId: string;
      title: string;
      grades: number;
      maxGrades: number;
    }[];
  salt: string;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  salt: string;
}
