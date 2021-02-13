import { IRepository } from '../interfaces/IRepository';
import mongoose from 'mongoose';

const Repository = new mongoose.Schema(
	{
		title: {
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

		source: {
			type: String,
			required: true,
			index: true,
		},

		question: {
			type: [String],
			unique: true,
			required: true,
		},

		options: {
			type: [String],
			required: true,
    },

		answer: {
			type: [String],
			required: true,
    },

    weightage: {
      type: Number,
      default: 0
    },

    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subjects', default: null }],

    flagged: {
      type: Boolean,
			default: false
    },

		type: {
			type: String,
			enum: ['MCR', 'MCCB', 'LA', 'DD', 'FU'],
			default: 'MCR',
		},
	},
	{ timestamps: true },
);

export default mongoose.model<IRepository & mongoose.Document>('Repository', Repository);
