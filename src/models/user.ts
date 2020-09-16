import { IUser } from '../interfaces/IUser';
import mongoose from 'mongoose';
import beautifyUnique from 'mongoose-beautiful-unique-validation';
import mongooseValidationErrorTransform from 'mongoose-validation-error-transform';

const User = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['local', 'OAuth2'],
      required: true,
      default: 'local',
    },

    OAuth2: {
      Id: String,
      picture: String,
    },

    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: 'Email Already Exists `{VALUE}`!',
      index: true,
    },

    password: String,

    mobileno: {
      type: Number,
      default: null,
    },

    class: {
      type: String,
      default: null,
    },

    uid: {
      type: Number,
      default: null,
    },

    semester: {
      type: Number,
      default: null,
    },

    department: {
      type: String,
      default: null,
    },

    course: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['student', 'faculty', 'staff', 'admin'],
      required: true,
      default: 'student',
    },

    verified: {
      type: Boolean,
      default: false,
    },

    profileCompletion: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    salt: String,
  },
  { timestamps: true },
);

/**
 * Plugin to beautify the unique error messages and transform to display messages.
 */
User.plugin(beautifyUnique, {
  defaultMessage: 'Email Already Exists ({VALUE})!',
});

User.plugin(mongooseValidationErrorTransform, {
  humanize: true,
  transform: messages => {
    return messages.join(', ');
  },
});
export default mongoose.model<IUser & mongoose.Document>('User', User);
