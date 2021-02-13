import mongoose from 'mongoose';
import { IOrganization } from '../interfaces/IOrganization'
const Organization = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
      default: null,
      required: true,
    },

    apiKey: {
      type: String,
      lowercase: true,
      default: null
    },

    subscription : {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true },
);

export default mongoose.model<IOrganization & mongoose.Document>('Organization', Organization);
