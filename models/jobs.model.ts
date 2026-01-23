import mongoose, { Schema, type Document } from "mongoose";

export interface IJob extends Document {
    title: string;
    requiredSkills: string[];
    minExperience?: string;
    description: string;
    education?: string;
    company?: string;
    scoringWeights: {
        skills: number;
        experience: number;
        education: number;
        aiMatch: number;
    };
    location: string;
    salaryRange?: {
        min: number;
        max: number;
    };
    postedDate: Date;
    applyLink: string;
    tags?: string[];
}
const jobSchema = new Schema<IJob>({
    title: { type: String, required: true },
    requiredSkills: { type: [String], required: true },
    minExperience: { type: String },
    description: { type: String, required: false },
    education: { type: String },
    company: { type: String, required: false },
    scoringWeights: {
        skills: { type: Number, default: 0.4 },
        experience: { type: Number, default: 0.3 },
        education: { type: Number, default: 0.2 },
        aiMatch: { type: Number, default: 0.1 },
    },
    location: { type: String, required: true },
    salaryRange: {
        min: { type: Number },
        max: { type: Number },
    },
    postedDate: { type: Date, default: Date.now },
    applyLink: { type: String, required: true },
    tags: { type: [String] },
}, { timestamps: true });

export const JobModel = mongoose.model("Job", jobSchema);