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
  results: [{
    user: string,
    result: [{
      contentId: string,
      isAnswerRight: boolean
    }]
  }];
  proctoredWarnings: [{
    user: string,
    warning: string,
  }];
  owner: string;
  schedule: {
    startTimeStamp: Date;
    endTimeStamp: Date;
  }
}
