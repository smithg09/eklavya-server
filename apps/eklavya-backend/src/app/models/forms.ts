// import { IRepository } from '../interfaces/IRepository';
import mongoose from 'mongoose';
import { IForms } from '../interfaces/IForms';

const Forms = new mongoose.Schema(
  {
    title: {
      type: String,
      index: true,
      default: null
    },

    description: {
      type: String,
      lowercase: true,
      default: null
    },

    content: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository', default: null}],

    users: {
      type: [String],
      default: null
    },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    class: {
      type: [String],
      unique: true,
      default: null
    },

    duration: {
      type: Number,
      required: true,
    },

    attempts: {
      type: Number,
      default: 1,
      required: true
    },

    visibility: {
      type: Boolean,
      default: false,
      required: true
    },

    view_count: {
      type: Number,
      default: 0
    },

    results: {
      type: [String],
      default: null
    },


    schedule: {
      startTimeStamp: {
        type: Date,
        required: true
      },
      endTimeStamp: {
        type: Date,
        required: true
      },
    }
  },
  { timestamps: true },
);

export default mongoose.model<IForms & mongoose.Document>('Forms', Forms);
