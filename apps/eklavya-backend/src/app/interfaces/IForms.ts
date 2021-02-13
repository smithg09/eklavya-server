export interface IForms {
  title: string;
  description: string;
  content: [string];
  users: [string];
  class: [string];
  duration: number;
  attempts: number;
  visibility: boolean;
  view_count: number;
  results: string;
  schedule: {
    startTimeStamp: Date;
    endTimeStamp: Date;
  }
}
