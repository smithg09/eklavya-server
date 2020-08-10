enum Methods {
  local = 'local',
  OAuth2 = 'OAuth2',
}

export interface IUser {
  _id: string;
  method: Methods;
  OAuth2: { Id: string; picture: string };
  name: string;
  email: string;
  password: string;
  salt: string;
  role: string;
  lastLogin: Date;
}

export interface IUserInputDTO {
  name: string;
  email: string;
  password: string;
}
