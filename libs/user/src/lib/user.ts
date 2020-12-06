export type User = {
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
  course: string;
  role: string;
  verified: boolean;
  profileCompletion: boolean;
  lastLogin: Date;
  salt: string;
}
