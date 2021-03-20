export interface IForms {
  title: string;
  description: string;
  content: [string];
  users: [string];
  class: [string];
  division: [string];
  duration: number;
  attempts: number;
  visibility: boolean;
  view_count: number;
  results: string;
  owner: string;
  schedule: {
    startTimeStamp: Date;
    endTimeStamp: Date;
  }
}
