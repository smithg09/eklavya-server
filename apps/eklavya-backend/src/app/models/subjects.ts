import mongoose from 'mongoose';
import { ISubject } from '../interfaces/ISubject'
const Subjects = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      default: null,
      required: true,
    },

    keywords: {
      type: [String],
      lowercase: true,
      index: true,
      default: null,
      required: true,
    },

    topics: {
      type: [String],
      index: true,
    }
  },
  { timestamps: true },
);

export default mongoose.model<ISubject & mongoose.Document>('Subjects', Subjects);
