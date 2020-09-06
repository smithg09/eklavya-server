enum Methods {
  local = 'local',
  OAuth2 = 'OAuth2',
}

enum Roles {
  student = 'student',
  faculty = 'faculty',
  staff = 'staff',
  admin = 'admin',
}
export interface IUser {
  _id: string;
  method: Methods;
  OAuth2: { Id: string; picture: string };
  name: string;
  email: string;
  password: string;
  class: string;
  rollNo: number;
  semester: number;
  department: string;
  course: string;
  role: Roles;
  verified: boolean;
  profileCompletion: boolean;
  lastLogin: Date;
  salt: string;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
  class: string;
  rollNo: number;
  semester: number;
  department: string;
  course: string;
  role: Roles;
}
