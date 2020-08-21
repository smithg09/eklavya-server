export interface IRepository {
  _id: string;
  title: string;
  keywords: [string];
  source: string;
  question: [string];
  options: [string];
  answer: [string];
}
